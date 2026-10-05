"use client";

import { lazy, Suspense, useCallback, useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore } from "react";
import { ArrowUpRight, X, Pause, Play } from "@phosphor-icons/react";
import { useAudio } from "@/lib/use-audio";
import { chapters } from "@/lib/chapters";

const LightScene = lazy(() => import("./light-scene"));
const ScrollMotion = lazy(() => import("./scroll-motion"));
const subscribeMotion = (notify: () => void) => {
  const query = matchMedia("(prefers-reduced-motion: reduce)");
  query.addEventListener("change", notify);
  return () => query.removeEventListener("change", notify);
};
const getMotion = () => matchMedia("(prefers-reduced-motion: reduce)").matches;

export function Experience({ children, audioAvailable }: { children: React.ReactNode; audioAvailable: boolean }) {
  const root = useRef<HTMLDivElement>(null);
  const gate = useRef<HTMLDivElement>(null);
  const main = useRef<HTMLElement>(null);
  const credits = useRef<HTMLDialogElement>(null);
  const introAnimations = useRef<Animation[]>([]);
  const enterGuard = useRef(false);
  const progress = useRef(0);
  const sceneProgress = useRef(0);
  const [stage, setStage] = useState<"gate" | "entering" | "active">("gate");
  const [preparing, setPreparing] = useState(false);
  const [activeChapter, setActiveChapter] = useState("within");
  const systemReduced = useSyncExternalStore(subscribeMotion, getMotion, () => false);
  const [motionOverride, setMotionOverride] = useState<boolean | null>(null);
  const reduced = motionOverride ?? systemReduced;
  const audio = useAudio(audioAvailable);

  const enter = useCallback((sound: boolean) => {
    if (enterGuard.current) return;
    enterGuard.current = true;
    if (sound) audio.start();
    setPreparing(true);
    const image = gate.current?.querySelector("img");
    const openingImage = main.current?.querySelector<HTMLImageElement>(".within-wide img");
    if (openingImage) openingImage.loading = "eager";
    const ready = Promise.all([document.fonts.ready, image?.decode().catch(() => undefined), openingImage?.decode().catch(() => undefined)]);
    void ready.finally(() => {
      if (!root.current) return;
      window.scrollTo(0, 0);
      setPreparing(false);
      setStage("entering");
      const finish = () => {
        setStage("active");
        requestAnimationFrame(() => {
          document.getElementById("within-title")?.focus({ preventScroll: true });
        });
      };
      if (reduced) { finish(); return; }
      const animations: Animation[] = [];
      gate.current?.querySelectorAll(".gate-copy, .gate-bottom, .gate-label").forEach((element) => {
        animations.push(element.animate([{ opacity: 1, transform: "translateY(0)" }, { opacity: 0, transform: "translateY(-30px)" }], { duration: 550, fill: "forwards", easing: "cubic-bezier(.55,0,1,.45)" }));
      });
      if (gate.current) animations.push(gate.current.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 1050, delay: 500, fill: "forwards", easing: "cubic-bezier(.65,0,.35,1)" }));
      root.current.querySelectorAll(".within-copy > *").forEach((element, index) => {
        animations.push(element.animate([{ opacity: 0, transform: "translateY(32px)" }, { opacity: 1, transform: "translateY(0)" }], { duration: 760, delay: 600 + index * 120, fill: "both", easing: "cubic-bezier(.22,1,.36,1)" }));
      });
      introAnimations.current = animations;
      void Promise.all(animations.map((animation) => animation.finished)).then(() => {
        finish();
      }).catch(() => undefined);
    });
  }, [audio, reduced]);

  useLayoutEffect(() => {
    if (stage !== "active") return;
    // Keep the fade's fill until React has removed the gate. Canceling before
    // that commit restores opacity: 1 and can paint a one-frame gate flash.
    introAnimations.current.forEach((animation) => animation.cancel());
    introAnimations.current = [];
  }, [stage]);

  useEffect(() => {
    if (main.current) main.current.inert = stage !== "active";
    document.body.style.overflow = stage === "active" ? "" : "hidden";
    return () => { document.body.style.overflow = ""; };
  }, [stage]);

  useEffect(() => {
    document.documentElement.classList.add("js");
    return () => { introAnimations.current.forEach((animation) => animation.cancel()); };
  }, []);

  useEffect(() => {
    const el = main.current;
    if (!el) return;
    const replay = () => {
      audio.replay();
      sceneProgress.current = 0;
      window.dispatchEvent(new Event("between:replay"));
      window.scrollTo({ top: 0, behavior: "instant" });
      document.getElementById("within-title")?.focus({ preventScroll: true });
    };
    const showCredits = () => { credits.current?.showModal(); window.dispatchEvent(new Event("between:pause-scroll")); };
    const replayButton = el.querySelector("[data-replay]");
    const creditsButton = el.querySelector("[data-credits]");
    replayButton?.addEventListener("click", replay);
    creditsButton?.addEventListener("click", showCredits);
    return () => {
      replayButton?.removeEventListener("click", replay);
      creditsButton?.removeEventListener("click", showCredits);
    };
  }, [audio]);

  return (
    <div ref={root} className="experience" data-stage={stage} data-reduced={reduced}>
      <a className="skip-link" href="#within-title" onClick={(event) => { if (stage !== "active") { event.preventDefault(); enter(false); } }}>Skip to experience</a>
      <div className="film-grain" aria-hidden="true" />
      <header className="site-header">
        <a className="wordmark" href="#within" aria-label="Between, beginning" onClick={(event) => { if (stage !== "active") event.preventDefault(); }}>between<span className="wordmark-symbol" aria-hidden="true">∗</span></a>
        {stage === "active" ? (
          <div className="experience-controls">
            <button className="control motion-control" onClick={() => setMotionOverride(!reduced)} aria-label={reduced ? "Enable motion" : "Reduce motion"} aria-pressed={reduced}>{reduced ? <Play size={14} weight="light" /> : <Pause size={14} weight="light" />}<span>Motion {reduced ? "off" : "on"}</span></button>
            <button className="control sound-control" onClick={audio.toggle} aria-label={audio.status === "playing" ? "Mute sound" : "Enable sound"} aria-pressed={audio.status === "playing"}>
              <span className="sound-bars" data-playing={audio.status === "playing"} aria-hidden="true"><i /><i /><i /><i /><i /></span>
              <span>Sound {audio.status === "playing" ? "on" : audio.status === "loading" ? "loading" : "off"}</span>
            </button>
          </div>
        ) : <span className="header-note">An exploration of human connection</span>}
      </header>

      {stage !== "active" && <div className="entry-gate" ref={gate} aria-label="Enter Between">
        <picture className="gate-image"><source media="(max-width: 767px)" srcSet="/images/within-mobile.avif" type="image/avif" /><source media="(max-width: 767px)" srcSet="/images/within-mobile.webp" type="image/webp" /><source srcSet="/images/within.avif" type="image/avif" /><img src="/images/within.webp" alt="A woman with closed eyes, quietly illuminated by a sliver of warm light." width="1672" height="941" fetchPriority="high" /></picture>
        <div className="gate-shade" />
        <div className="gate-label"><span className="tiny-star" aria-hidden="true">∗</span><span>An invitation to feel.</span></div>
        <div className="gate-copy">
          <p className="gate-intro">A journey inward.<br />A connection outward.</p>
          <h1 className="gate-title">BETWEEN</h1>
          <div className="gate-action-row">
            <p>Eight movements.<br />One very human feeling.</p>
            <div className="gate-buttons">
              <button className="enter-button" onClick={() => enter(true)} disabled={preparing || stage === "entering"}><span>{preparing ? "Preparing experience" : "Enter with sound"}</span><span className="button-icon"><ArrowUpRight size={20} weight="light" /></span></button>
              <button className="quiet-button" onClick={() => enter(false)} disabled={preparing || stage === "entering"}>Enter quietly</button>
            </div>
          </div>
        </div>
        <div className="gate-bottom"><span>Headphones on. World off.</span><span>Scroll at your own pace · Stay a while.</span></div>
      </div>}

      <main ref={main} className="story" id="story">{children}</main>

      {stage === "active" && <>
        <Suspense fallback={null}><ScrollMotion root={root} main={main} reduced={reduced} progress={progress} sceneProgress={sceneProgress} setActiveChapter={setActiveChapter} /></Suspense>
        {!reduced && <Suspense fallback={null}><LightScene progress={sceneProgress} energy={audio.energy} /></Suspense>}
        <nav className="chapter-nav" aria-label="Story chapters">{chapters.map((chapter) => <a href={`#${chapter.id}`} key={chapter.id} aria-label={chapter.label} aria-current={activeChapter === chapter.id ? "location" : undefined}><span /> <span className="chapter-nav-label">{chapter.label}</span></a>)}</nav>
        <div className="journey-status" aria-hidden="true"><span>{String(chapters.findIndex((chapter) => chapter.id === activeChapter) + 1).padStart(2, "0")}</span><span className="journey-track"><i className="journey-fill" /></span><span>08</span></div>
        <div className="reading-progress" aria-hidden="true" />
      </>}

      {audio.message && <div className="audio-message" role="status"><p>{audio.message}</p><button onClick={audio.clearMessage} aria-label="Dismiss sound message"><X size={18} /></button></div>}

      <dialog className="credits-dialog" ref={credits} data-lenis-prevent onClose={() => window.dispatchEvent(new Event("between:resume-scroll"))} onClick={(event) => { if (event.target === event.currentTarget) credits.current?.close(); }}>
        <button className="dialog-close" onClick={() => credits.current?.close()} aria-label="Close credits"><X size={24} weight="light" /></button>
        <span className="credits-mark" aria-hidden="true">∗</span>
        <h2>The space<br />between us.</h2>
        <p>BETWEEN is a conceptual digital artwork about our inner worlds and the connections that change them.</p>
        <dl><div><dt>Soundtrack</dt><dd>Inner Light<br />Elderbrook & Bob Moses<br /><span>Instrumental{audioAvailable ? "" : " · coming soon"}</span></dd></div><div><dt>Visuals</dt><dd>Original AI-generated photography<br /><span>Created for BETWEEN</span></dd></div></dl>
        <p className="credits-small">An independent portfolio concept. Not affiliated with the recording artists.</p>
      </dialog>
      <noscript><style>{`.entry-gate,.experience-controls,.chapter-nav,[data-replay],[data-credits]{display:none!important}.story{visibility:visible!important}.chapter{height:auto!important}.scene{min-height:100svh}.site-header{position:absolute}`}</style></noscript>
    </div>
  );
}
