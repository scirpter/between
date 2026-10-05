# Verification — BETWEEN, scrollytelling edition

Checked on 17–18 September 2026 in local Chrome against a production Next.js build. This supersedes the interactive edition.

## Delivered

The narrative now unfolds entirely through scroll. Form selection, dragging, the memory atlas controls, distance slider, hold-to-connect action, personalized artwork, and their state modules were removed.

Lenis smooths wheel scrolling on GSAP's ticker; native touch remains intact. Four unique memories reveal sequentially, two light forms converge, a filament crosses the reaching hands, and Connection expands into an ivory finale. Afterglow opens from a framed photograph. Chapter durations span 26.2 desktop / 19.7 mobile viewport heights.

Mobile crops retain the window, seaside figures, and dancing subjects. The touch response sits below the hands. The final statement stays on three lines. Header and footer colors adapt to the illuminated scenes.

## Passed

- Production build, TypeScript, and ESLint.
- 32 chapter checks at 1440 x 900, 1366 x 768, 390 x 844, and 360 x 800: readable heading holds, decoded images, no horizontal overflow, reverse traversal, release, replay.
- All four memories forward and backward at desktop/mobile sizes: correct photograph, readable caption, full opacity, contained typography.
- Actual wheel interpolation: a 650 px wheel input moves through an intermediate position before settling at 650 px.
- Native Chromium touch scroll, chapter taps after the native fling settles, and reduced-motion cleanup.
- Keyboard chapter navigation transfers focus to the correct heading; navigation indicators follow the visible chapter.
- Credits lock the background and restore scrolling on Escape; replay resets the story without retained Lenis inertia.
- System/manual reduced motion removes Lenis, pins, and WebGL. Four memories remain readable as vertical scenes.
- No-JavaScript reading; unavailable WebGL; CSS light fallbacks; simulated context loss.
- Camera regression: reverse jumps restore the sculpture. A rapid jump into Distance produces two separated light forms within 350 ms on desktop/mobile. The extra camera easing was removed because it drifted behind the HTML on throttled mobile rendering.
- Entry handoff: zero gate flashes, cancellation flashes, or leftover entry animations in quiet desktop, sound desktop, delayed mobile chunks with 4x CPU throttling, and reduced-motion keyboard entry.
- Delayed image readiness waits for the 900 px mobile opening image to decode.
- Startup requests only the threshold image before entry; opening and memory images decode when needed.
- Axe 4.13 WCAG 2 A/AA and 2.1 AA: zero detected violations in the static story, illuminated finale, and Afterglow inset.
- Supplied MP3 decodes to 258.07 seconds and advances after click-initiated playback.
- Isolated audio fixture: play, mute, hidden-tab pause, explicit resume, replay, natural ending, rejected playback, and delayed loading.

The browser suite caught a caption-boundary test issue, native touch fling timing, missing scoped animation targets, and camera interpolation lag. These were corrected and the relevant checks rerun. Final composition captures also cover the light expansion and Afterglow's inset transition.

## Image delivery

Eighteen original masters remain in `assets/originals/`. Landscapes retain native 1672 x 941 detail; memories are 1536 x 1024; dedicated portraits export at 900 x 1600.

AVIF quality is 78 desktop / 76 mobile with 4:4:4 chroma. WebP is 94 / 93. No native 4K claim is made. Each memory uses one source throughout its reveal; mobile eye layers share one file. Four unused reflection exports were removed.

35 delivery files total 4,369,579 bytes (4.17 MiB), including browser alternatives and the social image. Source masters and the supplied soundtrack are separate.

## Performance

Final isolated mobile Lighthouse report: `output/lighthouse-scroll-final.json`, generated at 22:07 UTC on 17 September (00:07 local time on 18 September).

| Metric | Result |
| --- | --- |
| Performance | 98 |
| Accessibility | 100 |
| Best practices | 100 |
| SEO | 100 |
| Largest contentful paint | 2.4 s |
| First contentful paint | 0.8 s |
| Total blocking time | 60 ms |
| Cumulative layout shift | 0 |
| Initial transferred resources | 250.6 KiB |

The report is complete with `runtimeError: null`. Chrome's launcher returned Windows `EPERM` while cleaning up its temporary profile after saving the report; this is separate from the site audit. LCP and CLS meet the requested lab targets. TBT does not establish field INP.

The canvas caps DPR at 1.5 desktop / 1 mobile and drawing at 30 fps on mobile. It skips hidden and inactive scenes. These are implementation limits, not physical-device frame-rate measurements.

## Remaining external checks

- Complete listening pass to confirm the supplied recording contains zero vocals. Playback tests do not establish this.
- Physical iPhone/Safari and Android testing; the mobile checks above use Chrome emulation.
- Field INP and physical-device frame rates.
- Final public origin before deployment. No public deployment was performed.

Reproduction instructions: `scripts/qa/README.md`. Logs: `output/qa-*.log`. Screenshots: `output/playwright/`.
