"use client";

import type { RefObject, Dispatch, SetStateAction } from "react";
import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
gsap.registerPlugin(ScrollTrigger, useGSAP);

interface Props {
  root: RefObject<HTMLDivElement | null>; main: RefObject<HTMLElement | null>;
  reduced: boolean; progress: RefObject<number>; sceneProgress: RefObject<number>;
  setActiveChapter: Dispatch<SetStateAction<string>>;
}

export default function ScrollMotion({ root, main, reduced, progress, sceneProgress, setActiveChapter }: Props) {
  useGSAP(() => {
    const host = root.current;
    if (!host) return;
    const initialFocus = document.activeElement as HTMLElement | null;
    const sections = gsap.utils.toArray<HTMLElement>("[data-chapter]", host);
    // Experience owns both the OS preference and the explicit motion override.
    const lenis = reduced ? null : new Lenis({
      lerp: .095, smoothWheel: true, syncTouch: false, autoRaf: false,
      anchors: false, respectReducedMotion: false, stopInertiaOnNavigate: true,
    });
    const tick = (seconds: number) => lenis?.raf(seconds * 1000);
    const update = () => ScrollTrigger.update();
    if (lenis) {
      lenis.on("scroll", update);
      gsap.ticker.add(tick);
      gsap.ticker.lagSmoothing(0);
      host.setAttribute("data-smooth", "true");
    }
    const media = gsap.matchMedia();
    media.add({ desktop: "(min-width: 768px)", mobile: "(max-width: 767px)" }, (context) => {
      const desktop = Boolean(context.conditions?.desktop);
      sections.forEach((section) => {
        if (reduced) return;
        const scene = section.querySelector<HTMLElement>(".scene")!;
        const select = (selector: string) => scene.querySelectorAll(":scope " + selector);
        const timeline = gsap.timeline({ defaults: { ease: "none" }, scrollTrigger: {
          trigger: section, start: "top top", end: "bottom bottom",
          pin: scene, pinSpacing: false, scrub: true, invalidateOnRefresh: true,
        } });
        // Every chapter has a normalized, reversible clock. Lenis supplies the easing.
        timeline.to({}, { duration: 1 }, 0);
        switch (section.id) {
          case "within":
            timeline.to(select(".within-wide"), { scale: desktop ? 1.2 : 1.12, transformOrigin: desktop ? "73% 42%" : "53% 37%", duration: .65 }, 0)
              .fromTo(select(".iris-detail"), { opacity: 0, scale: 1 }, { opacity: 1, scale: 1.06, duration: .35 }, .28)
              .to(select(".within-wide"), { opacity: 0, duration: .18 }, .53)
              .to(select(".within-copy"), { y: -60, opacity: 0, duration: .17 }, .28)
              .to(select(".iris-coordinate"), { opacity: 0, duration: .12 }, .18)
              .fromTo(select(".within-postscript"), { opacity: 0, y: 25 }, { opacity: 1, y: 0, duration: .16 }, .55)
              .to(select(".within-postscript"), { opacity: 0, duration: .13 }, .83)
              .to(select(".iris-detail"), { opacity: .08, duration: .2 }, .8)
              .fromTo(select(".opening-thread"), { opacity: 0, scaleY: 0 }, { opacity: 1, scaleY: 1, duration: .25 }, .73);
            break;
          case "inner":
            timeline.fromTo(select(".inner-copy > *"), { y: 35, opacity: 0 }, { y: 0, opacity: 1, stagger: .025, duration: .12 }, .02)
              .to(select(".inner-copy"), { opacity: 0, y: -45, duration: .15 }, .53)
              .to(select(".orbit-label"), { opacity: 0, duration: .12 }, .55)
              .to(select(".inner-fallback .orbit-study"), { scale: 2.8, rotation: 75, opacity: .2, duration: .4 }, .58)
              .fromTo(select(".inner-postscript"), { opacity: 0, scale: .95 }, { opacity: 1, scale: 1, duration: .14 }, .72);
            break;
          case "thought": {
            timeline.fromTo(select(".memory-room .memory-visual"), {
              clipPath: desktop ? "inset(18% 6% 18% 53%)" : "inset(48% 8% 13% 8%)",
            }, { clipPath: "inset(0% 0% 0% 0%)", duration: .09, ease: "power2.inOut" }, .07)
              .to(select(".thought-copy"), { opacity: 0, y: -30, duration: .06 }, .07)
              .fromTo(select(".memory-timeline"), { opacity: 0 }, { opacity: 1, duration: .04 }, .14)
              .to(select(".memory-timeline b"), { scaleX: 1, duration: .7 }, .16)
              .to(select(".memory-timeline"), { opacity: 0, duration: .04 }, .86);
            const shots = ["room", "rain", "sea", "dance"];
            shots.forEach((id, index) => {
              const incoming = [0, .28, .47, .66][index];
              const caption = [.14, .33, .52, .71][index];
              const outgoing = [.27, .46, .65, .84][index];
              if (index > 0) {
                timeline.fromTo(select(".memory-" + id), { autoAlpha: 0 }, { autoAlpha: 1, duration: .07 }, incoming)
                  .fromTo(select(".memory-" + id + " .memory-visual"), { clipPath: "inset(0% 0% 0% 100%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: .08, ease: "power2.inOut" }, incoming)
                  .to(select(".memory-" + shots[index - 1]), { autoAlpha: 0, duration: .015 }, incoming + .08);
              }
              timeline.fromTo(select(".memory-" + id + " img"), { scale: 1.06, xPercent: index % 2 ? -1 : 1 }, { scale: 1, xPercent: 0, duration: .26 }, incoming)
                .fromTo(select(".memory-" + id + " .memory-caption"), { opacity: 0, y: 35 }, { opacity: 1, y: 0, duration: .05 }, caption)
                .to(select(".memory-" + id + " .memory-caption"), { opacity: 0, y: -25, duration: .04 }, outgoing);
            });
            timeline.to(select(".memory-dance .memory-visual"), { opacity: .15, duration: .12 }, .86)
              .to(select(".memory-dance .memory-index"), { opacity: 0, duration: .04 }, .86)
              .fromTo(select(".thought-postscript"), { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: .08 }, .89);
            break;
          }
          case "distance":
            timeline.fromTo(select(".distance-copy"), { opacity: .25 }, { opacity: 1, duration: .12 }, 0)
              .to(select(".distance-copy h2>span:first-child"), { xPercent: -10, duration: .5 }, .1)
              .to(select(".distance-copy h2>span:last-child"), { xPercent: 10, duration: .5 }, .1)
              .to(select(".distance-copy>p"), { opacity: 0, duration: .17 }, .15)
              .to(select(".distance-copy"), { opacity: 0, duration: .13 }, .6)
              .to(select(".distance-whisper"), { opacity: 0, duration: .1 }, .65)
              .to(select(".world-one"), { xPercent: desktop ? 135 : 100, scale: .65, duration: .3 }, .5)
              .to(select(".world-two"), { xPercent: desktop ? -135 : -100, scale: .65, duration: .3 }, .5)
              .fromTo(select(".distance-thread"), { opacity: 0, scaleX: 0 }, { opacity: 1, scaleX: 1, duration: .2 }, .54)
              .to(select(".distance-thread"), { opacity: 0, duration: .12 }, .83)
              .fromTo(select(".distance-postscript"), { opacity: 0, y: 25 }, { opacity: 1, y: 0, duration: .12 }, .8);
            break;
          case "encounter":
            timeline.to(select(".curtain-left"), { xPercent: -100, duration: .42, ease: "power2.inOut" }, 0)
              .to(select(".curtain-right"), { xPercent: 100, duration: .42, ease: "power2.inOut" }, 0)
              .fromTo(select("> .scene-picture"), { scale: 1.08 }, { scale: 1, duration: .8 }, 0)
              .fromTo(select(".encounter-copy"), { y: 35, opacity: 0 }, { y: 0, opacity: 1, duration: .15 }, .28)
              .fromTo(select(".encounter-line"), { scaleY: 0, opacity: 0 }, { scaleY: 1, opacity: 1, duration: .3 }, .1)
              .to(select(".encounter-line"), { opacity: 0, duration: .2 }, .6);
            break;
          case "touch":
            timeline.fromTo(select("> .scene-picture"), { scale: 1.08, opacity: .45 }, { scale: 1, opacity: 1, duration: .5 }, 0)
              .fromTo(select(".touch-copy"), { y: 35, opacity: 0 }, { y: 0, opacity: 1, duration: .12 }, .03)
              .to(select(".touch-copy"), { y: -35, opacity: 0, duration: .15 }, .32)
              .fromTo(select(".touch-filament"), { opacity: 0, scaleX: 0 }, { opacity: 1, scaleX: 1, duration: .2 }, .35)
              .to(select(".touch-filament"), { opacity: 0, duration: .1 }, .62)
              .to(select(".touch-warmth"), { opacity: 1, duration: .27 }, .45)
              .fromTo(select(".touch-answer"), { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: .15 }, .6);
            select(".touch-resonance i").forEach((ring, index) => {
              const start = .42 + index * .045;
              timeline.fromTo(ring, { scale: .05 }, { scale: 3.5, duration: .35 }, start)
                .to(ring, { opacity: .4, duration: .06 }, start)
                .to(ring, { opacity: 0, duration: .29 }, start + .06);
            });
            break;
          case "connection":
            timeline.fromTo(select("> .scene-picture"), { scale: 1.08, opacity: .3 }, { scale: 1, opacity: 1, duration: .25 }, 0)
              .fromTo(select(".connection-copy"), { y: 45, opacity: 0 }, { y: 0, opacity: 1, duration: .14 }, .08)
              .to(select(".connection-copy"), { y: -45, opacity: 0, duration: .11 }, .34)
              .to(select("> .scene-picture"), { scale: 1.12, opacity: .08, duration: .2 }, .42)
              .to(select(".connection-shade"), { opacity: 0, duration: .2 }, .42)
              .to(select(".release-disc"), { scale: 1, duration: .18, ease: "power2.inOut" }, .6)
              .fromTo(select(".connection-postscript"), { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: .13 }, .77)
              .to(select(".release-note"), { opacity: 1, duration: .05 }, .87)
              .to(select(".scene-foot, .chapter-stamp>span"), { color: "#6d5c47", duration: .06 }, .72);
            break;
          case "afterglow":
            timeline.fromTo(select(".afterglow-frame"), { clipPath: "inset(12% 6% 12% 6%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: .4, ease: "power2.inOut" }, 0)
              .fromTo(select(".afterglow-frame .scene-picture"), { scale: 1.06 }, { scale: 1, duration: 1 }, 0)
              .fromTo(select(".afterglow-copy"), { y: 35, opacity: 0 }, { y: 0, opacity: 1, duration: .2 }, .24);
            break;
        }
      });
      let bounds = sections.map((section) => ({ top: section.offsetTop, range: Math.max(1, section.offsetHeight - innerHeight) }));
      let active = "";
      const syncScene = (scroll: number) => {
        let index = 0;
        for (let i = 0; i < bounds.length; i++) if (scroll >= bounds[i].top - 1) index = i;
        const phase = index + Math.min(1, Math.max(0, (scroll - bounds[index].top) / bounds[index].range));
        sceneProgress.current = phase;
        if (active !== sections[index].id) { active = sections[index].id; setActiveChapter(active); }
        const release = reduced ? host.querySelector(".connection-postscript")?.getBoundingClientRect() : null;
        const light = reduced ? Boolean(release && release.top <= 70 && release.bottom > 70) : phase >= 6.76 && phase < 7.3;
        host.setAttribute("data-tone", light ? "light" : "dark");
      };
      // A single owner keeps both the camera and chapter indicator correct after rapid jumps.
      ScrollTrigger.create({ trigger: main.current, start: "top top", end: "bottom bottom",
        onRefresh: (self) => {
          bounds = sections.map((section) => ({ top: section.offsetTop, range: Math.max(1, section.offsetHeight - innerHeight) }));
          syncScene(self.scroll());
        },
        onUpdate: (self) => {
          syncScene(self.scroll());
          progress.current = self.progress;
          gsap.set(host.querySelectorAll(".reading-progress, .journey-fill"), { scaleX: self.progress });
        },
      });
    });

    const restoreFocus = (focused: HTMLElement | null) => {
      if (focused?.isConnected && focused !== document.body && document.activeElement !== focused) focused.focus({ preventScroll: true });
    };
    restoreFocus(initialFocus);
    const refresh = () => {
      const focused = document.activeElement as HTMLElement | null;
      lenis?.resize();
      ScrollTrigger.refresh();
      restoreFocus(focused);
    };
    const navigate = (event: MouseEvent) => {
      if (!lenis || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const link = (event.target as Element).closest<HTMLAnchorElement>('a[href^="#"]');
      if (!link || link.target || link.hasAttribute("download")) return;
      const id = link.getAttribute("href")!.slice(1);
      const target = document.getElementById(id);
      if (!target) return;
      event.preventDefault();
      const section = target.closest<HTMLElement>("[data-chapter]");
      const focus = section?.querySelector<HTMLElement>("h1,h2") ?? target;
      const holds: Record<string, number> = { within: 0, inner: .22, thought: .04, distance: .12, encounter: .55, touch: .22, connection: .27, afterglow: .65 };
      const top = section ? section.offsetTop + Math.max(0, section.offsetHeight - innerHeight) * (holds[section.id] ?? 0) : target.getBoundingClientRect().top + scrollY;
      history.replaceState(null, "", "#" + id);
      lenis.scrollTo(top, { duration: 1.45, lerp: 0, easing: (t) => 1 - Math.pow(1 - t, 4), onComplete: () => focus.focus({ preventScroll: true }) });
    };
    const replay = () => { lenis?.scrollTo(0, { immediate: true, force: true }); ScrollTrigger.update(); };
    const pause = () => lenis?.stop();
    const resume = () => lenis?.start();
    host.addEventListener("click", navigate);
    window.addEventListener("between:replay", replay);
    window.addEventListener("between:pause-scroll", pause);
    window.addEventListener("between:resume-scroll", resume);
    if (host.querySelector("dialog[open]")) pause();
    const images = host.querySelectorAll(".story img");
    images.forEach((img) => img.addEventListener("load", refresh));
    let disposed = false;
    void document.fonts.ready.then(() => { if (!disposed) refresh(); });
    return () => {
      disposed = true;
      media.revert();
      images.forEach((img) => img.removeEventListener("load", refresh));
      host.removeEventListener("click", navigate);
      window.removeEventListener("between:replay", replay);
      window.removeEventListener("between:pause-scroll", pause);
      window.removeEventListener("between:resume-scroll", resume);
      lenis?.off("scroll", update);
      gsap.ticker.remove(tick);
      lenis?.destroy();
      host.removeAttribute("data-smooth");
      host.removeAttribute("data-tone");
    };
  }, { scope: root, dependencies: [reduced], revertOnUpdate: true });
  return null;
}
