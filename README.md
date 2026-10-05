# BETWEEN

A cinematic exploration of human connection and the mind. Eight movements unfold entirely through scrolling: an intimate eye, an inner universe, four remembered moments, two distant worlds, an encounter, a reaching gesture, shared light, and afterglow.

## Experience

Enter with sound or enter quietly, then scroll at your own pace. There are no choices, drag gestures, sliders, hold interactions, or downloads inside the narrative. Scroll reveals every scene and reverses every transition.

- Lenis smooths wheel scrolling on GSAP's animation clock. Touch scrolling remains native.
- Each memory has its own photograph, full-frame reveal, camera movement, and readable caption hold.
- Two woven light forms converge as the distance closes. A filament crosses the fingertips; five waves carry the gesture outward.
- Connection opens from portrait to light sculpture to an ivory typographic finale. The last portrait expands from an inset frame.
- Sound, reduced motion, chapter navigation, credits, and replay remain available.

The desktop story spans 26.2 viewport heights; mobile spans 19.7, with shorter holds and dedicated framing. The soundtrack runs independently of scroll.

## Run locally

Requires Node.js 20.9 or newer. Checked with Node 24.

~~~sh
npm ci
npm run dev
~~~

Open http://127.0.0.1:3000. For the production version:

~~~sh
npm run build
npm run start
~~~

## Soundtrack

The supplied instrumental of **Inner Light by Elderbrook & Bob Moses** is self-hosted at:

~~~text
public/audio/inner-light-instrumental.mp3
~~~

Rebuild and restart after adding or replacing the file: availability is checked during prerendering. If absent, the silent experience remains usable.

Audio starts directly from a user gesture, uses 35% gain with gentle transitions, pauses on hidden tabs, resumes through the sound control, and restarts with replay. Scroll never seeks the recording. Smoothed audio energy subtly affects the light sculpture. Playback verification does not establish that the complete recording is vocal-free; a full listening pass remains necessary.

## Structure

- `src/app/page.tsx`: server-rendered chapters and four memory compositions.
- `src/lib/chapters.ts`: copy, chapter scroll distances, image framing, soundtrack.
- `src/lib/memories.ts`: distinct memory imagery, captions, desktop/mobile focal points.
- `src/components/experience.tsx`: entry, audio controls, motion preference, credits, replay. The entry fade keeps its final state until React removes the gate, preventing the previous late flicker.
- `src/components/scroll-motion.tsx`: Lenis lifecycle, GSAP timelines, pins, chapter progress, anchor navigation, and light/dark chrome.
- `src/components/light-scene.tsx`: one Three.js canvas with woven fibers, scroll-driven geometry and camera travel, and audio response.
- `src/lib/use-audio.ts`: playback lifecycle and energy analysis.
- `src/app/globals.css`: foundation, entrance, navigation, controls.
- `src/app/cinema.css`: chapter compositions, responsive framing, static fallbacks.

Continuous values update refs and uniforms without React rerenders. Lenis and the canvas share GSAP's ticker. The renderer caps DPR at 1.5 desktop / 1 mobile, limits mobile drawing to 30 fps, and skips hidden or inactive scenes.

Reduced motion removes Lenis, pins, WebGL, and scroll choreography. All four memories become readable vertical chapters; the ivory closing statement remains. Without JavaScript, the story is readable immediately. WebGL unavailability or context loss reveals composed CSS light forms. Credits pause background scrolling and restore it on close.

## Assets

Original generated photography: `assets/originals/`. Original fonts: `assets/fonts/`. Delivery images: `public/images/`. Self-hosted Clash Display and Satoshi subsets: `src/app/fonts/`.

~~~sh
npm run assets
npm run assets -- memory-room memory-rain memory-sea memory-dance
~~~

Eighteen original masters are documented in `assets/PROMPTS.md` and `assets/MEMORY-PROMPTS.md`. Each memory uses one image throughout its reveal. Encounter uses one image behind two curtains. The threshold has a separate portrait from the opening eye and the touch chapter.

Landscapes retain native 1672 x 941 detail; memory masters are 1536 x 1024. Dedicated portrait exports are 900 x 1600. High-quality AVIF/WebP encoding preserves texture. The desktop eye transition has a separate close-up; mobile shares one portrait source rather than downloading identical copies. These are not native 4K masters.

Unused reflection exports were removed. The 35 delivery files total approximately 4.17 MiB, including alternate browser encodings and the social image. Source masters and audio are separate. Story images are deferred behind the entrance.

Set `NEXT_PUBLIC_SITE_URL` from `.env.example` before public deployment. No public deployment has been performed.

## Checks

~~~sh
npm run typecheck
npm run lint
npm run build
~~~

Browser verification instructions: `scripts/qa/README.md`. Results: `QA.md`. Captures and Lighthouse reports: `output/`.

Checks cover four viewports, chapter holds, all memories in both scroll directions, smooth wheel scrolling, native touch, anchor focus, replay, modal locking, entry handoff, reduced motion, no JavaScript, WebGL failure, and audio lifecycle.

Physical-device Safari, field INP, and the final instrumental listening pass remain external checks. Local Chrome results are lab measurements.
