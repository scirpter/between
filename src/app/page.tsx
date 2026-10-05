import { existsSync } from "node:fs";
import path from "node:path";
import type { CSSProperties, ReactNode } from "react";
import { Experience } from "@/components/experience";
import { SceneImage } from "@/components/scene-image";
import { ChapterSection, ChapterHeading, ChapterBody } from "@/components/chapter";
import { memories } from "@/lib/memories";

function Foot({ number, name, children }: { number: string; name: string; children: ReactNode }) {
  return <div className="scene-foot"><span className="chapter-stamp"><span>{number} / 08</span>{name}</span><span className="foot-note">{children}</span></div>;
}

function Orbit({ className = "" }: { className?: string }) {
  return <div className={"orbit-study " + className} aria-hidden="true">{Array.from({ length: 22 }, (_, index) => <i key={index} style={{ transform: "rotate(" + index * 8.18 + "deg) scaleX(" + (.18 + (index % 7) * .1) + ")" }} />)}</div>;
}

export default function Home() {
  const audioAvailable = existsSync(path.join(process.cwd(), "public/audio/inner-light-instrumental.mp3"));
  return <Experience audioAvailable={audioAvailable}>
    <ChapterSection id="within">
      <div className="scene within-scene">
        <SceneImage id="within" className="within-wide" /><SceneImage id="within" asset="iris-detail" className="iris-detail" />
        <div className="scene-shade" />
        <div className="within-copy"><span className="eyebrow">Begin on the inside</span><ChapterHeading id="within" /><ChapterBody id="within" /></div>
        <div className="iris-coordinate" aria-hidden="true"><i /><span>A universe, looking out.</span></div>
        <div className="within-postscript scene-postscript"><span>Look a little closer.</span></div>
        <div className="opening-thread" aria-hidden="true"><i /></div>
        <Foot number="01" name="Within">Scroll slowly. Let it unfold.</Foot>
        <a className="chapter-next" href="#inner" aria-label="Continue to an inner universe"><span aria-hidden="true">↓</span></a>
      </div>
    </ChapterSection>

    <ChapterSection id="inner">
      <div className="scene inner-scene">
        <div className="inner-fallback"><Orbit /></div>
        <div className="inner-copy"><span className="eyebrow">No map could hold you</span><ChapterHeading id="inner" /><ChapterBody id="inner" /></div>
        <div className="orbit-label" aria-hidden="true"><span>Always becoming.</span><i /><span>Never complete.</span></div>
        <div className="inner-postscript scene-postscript"><span>And still,</span><span>there is more.</span></div>
        <Foot number="02" name="Inner universe">Everything you carry. Everything you are.</Foot>
      </div>
    </ChapterSection>

    <ChapterSection id="thought">
      <div className="scene thought-scene">
        <div className="memory-reel">
          {memories.map((memory, index) => <figure className={"memory-shot memory-" + memory.id} data-memory={memory.id} key={memory.id} aria-labelledby={"memory-" + memory.id + "-title"}>
            <div className="memory-visual"><picture><source srcSet={"/images/" + memory.asset + ".avif"} type="image/avif" /><img src={"/images/" + memory.asset + ".webp"} alt={memory.alt} width="1536" height="1024" loading="lazy" decoding="async" style={{ objectPosition: memory.position, "--mobile-focus": memory.mobilePosition } as CSSProperties} /></picture><div className="memory-shade" /></div>
            <figcaption className="memory-caption"><span className="eyebrow">0{index + 1} / {memory.label}</span><h3 id={"memory-" + memory.id + "-title"}>{memory.title}</h3><p>{memory.detail}</p></figcaption>
            <span className="memory-index" aria-hidden="true">{memory.number}<i>/</i>04</span>
          </figure>)}
        </div>
        <div className="thought-copy"><span className="eyebrow">What we carry</span><ChapterHeading id="thought" /><ChapterBody id="thought" /></div>
        <div className="thought-postscript scene-postscript"><span>Nothing felt</span><span>is ever really lost.</span></div>
        <div className="memory-timeline" aria-hidden="true"><span>01</span><i><b /></i><span>04</span></div>
        <Foot number="03" name="Memory">A place. A journey. A silence. A feeling.</Foot>
      </div>
    </ChapterSection>

    <ChapterSection id="distance">
      <div className="scene distance-scene">
        <div className="distance-fallback"><Orbit className="world-one" /><Orbit className="world-two" /></div>
        <div className="distance-copy"><span className="eyebrow">The space between two worlds</span><ChapterHeading id="distance" /><ChapterBody id="distance" /></div>
        <div className="distance-thread" aria-hidden="true"><i /><span /></div>
        <div className="distance-whisper"><span>My world.</span><span>Your world.</span></div>
        <div className="distance-postscript scene-postscript"><span>Until we let</span><span>someone in.</span></div>
        <Foot number="04" name="Distance">An invitation, waiting.</Foot>
      </div>
    </ChapterSection>

    <ChapterSection id="encounter">
      <div className="scene encounter-scene">
        <SceneImage id="encounter" />
        <div className="encounter-curtain curtain-left" aria-hidden="true" /><div className="encounter-curtain curtain-right" aria-hidden="true" />
        <div className="encounter-shade" />
        <div className="encounter-copy"><span className="eyebrow">The extraordinary act of paying attention</span><ChapterHeading id="encounter" /><ChapterBody id="encounter" /></div>
        <div className="encounter-line" aria-hidden="true" />
        <Foot number="05" name="Encounter">To be seen. To be allowed to be.</Foot>
      </div>
    </ChapterSection>

    <ChapterSection id="touch">
      <div className="scene touch-scene">
        <SceneImage id="touch" /><div className="touch-shade" />
        <div className="touch-copy"><span className="eyebrow">A small beginning</span><ChapterHeading id="touch" /><ChapterBody id="touch" /></div>
        <div className="touch-filament" aria-hidden="true"><i /></div>
        <div className="touch-resonance" aria-hidden="true">{Array.from({ length: 5 }, (_, index) => <i key={index} style={{ "--ripple": index } as CSSProperties} />)}</div>
        <div className="touch-warmth" aria-hidden="true" />
        <div className="touch-answer scene-postscript"><span>There you are.</span><p>One small gesture.<br />An entirely different world.</p></div>
        <Foot number="06" name="Courage">Some beginnings are almost imperceptible.</Foot>
      </div>
    </ChapterSection>

    <ChapterSection id="connection">
      <div className="scene connection-scene">
        <SceneImage id="connection" /><div className="connection-shade" />
        <div className="connection-copy"><span className="eyebrow">The distance becomes a doorway</span><ChapterHeading id="connection" /><ChapterBody id="connection" /></div>
        <div className="release-disc" aria-hidden="true" />
        <div className="connection-postscript scene-postscript"><span>You were never</span><span>meant to be</span><span>an island.</span></div>
        <p className="release-note">For a moment,<br />the edges disappear.</p>
        <Foot number="07" name="Connection">Two worlds. One shared light.</Foot>
      </div>
    </ChapterSection>

    <ChapterSection id="afterglow">
      <div className="scene afterglow-scene">
        <div className="afterglow-frame"><SceneImage id="afterglow" /><div className="afterglow-shade" /></div>
        <div className="afterglow-copy"><span className="eyebrow">What remains</span><ChapterHeading id="afterglow" /><ChapterBody id="afterglow" /><button className="text-button replay-button" data-replay>Experience again <span aria-hidden="true">↗</span></button></div>
        <span className="afterglow-word" aria-hidden="true">between</span>
        <footer className="scene-foot final-footer"><span className="chapter-stamp"><span>08 / 08</span>Carry a little light with you.</span><button className="text-button" data-credits>About this experience <span aria-hidden="true">+</span></button></footer>
      </div>
    </ChapterSection>
  </Experience>;
}
