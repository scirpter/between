# Browser verification

These are Playwright CLI function scripts. Run the production site on port 3001:

~~~sh
npm run build
npm run start -- --port 3001
~~~

In another terminal:

~~~sh
npx --yes --package @playwright/cli playwright-cli -s=between open http://127.0.0.1:3001 --browser chrome
npx --yes --package @playwright/cli playwright-cli -s=between run-code --filename=scripts/qa/visual.js
~~~

Windows batch runner:

~~~powershell
.\scripts\qa\run-checks.ps1
.\scripts\qa\run-checks.ps1 -Checks scrollytelling,touch-scroll
~~~

| Check | Coverage |
| --- | --- |
| startup | Only threshold imagery loads before entry; deferred opening and memories decode |
| visual | Eight chapters at 1440 x 900, 1366 x 768, 390 x 844, 360 x 800; typography, overflow, release, replay |
| scrollytelling | Lenis interpolation, no interaction gates, four memories forward/backward, touch reveal, contrast switching, keyboard navigation, modal pause/resume, motion toggle, replay |
| touch-scroll | Native Chromium touch scrolling, chapter taps after fling settles, reduced-motion cleanup |
| fallbacks | System/manual reduced motion, no-JavaScript story, CSS light fallback, context loss |
| camera | Visible sculpture after reverse jumps to Inner and Connection |
| accessibility | Axe WCAG 2 A/AA and 2.1 AA in the static story, illuminated finale, and Afterglow inset |
| entry-readiness | Wait for the opening mobile image to decode |
| entry-handoff | No late gate flicker, including delayed chunks and CPU throttling |
| supplied-audio | Real supplied MP3 playback and duration |
| audio | Isolated fixture: play, mute, hidden-tab pause, resume, replay, ending, rejection, delay |

For the audio mechanics check:

~~~sh
node scripts/qa/audio-fixture.mjs
npx --yes --package @playwright/cli playwright-cli -s=between run-code --filename=scripts/qa/audio.js
~~~

The eight-second silent WAV is intercepted only inside the test browser; it never replaces the recording served by the site. Close the test session when finished:

~~~sh
npx --yes --package @playwright/cli playwright-cli -s=between close
~~~

Screenshots go to `output/playwright/`; batch logs go to `output/qa-*.log`.

Run Lighthouse without another active browser test:

~~~sh
npx --yes lighthouse http://127.0.0.1:3001 --output=json --output-path=output/lighthouse-scroll-final.json --chrome-flags="--headless=new --no-first-run --no-default-browser-check" --quiet
~~~

On Windows, Chrome profile cleanup may emit EPERM after saving a valid report. Check the report's runtimeError and complete category/audit results before interpreting the command exit code.
