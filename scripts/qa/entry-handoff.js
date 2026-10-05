async (page) => {
  const results = [];
  const browser = page.context().browser();
  const cases = [
    { name: 'desktop quiet', width: 1440, height: 900, sound: false },
    { name: 'desktop sound', width: 1366, height: 768, sound: true },
    { name: 'mobile slow chunks', width: 390, height: 844, sound: false, slow: true },
    { name: 'reduced keyboard', width: 360, height: 800, sound: false, reduced: true },
  ];
  for (const testCase of cases) {
    const context = await browser.newContext({
      viewport: { width: testCase.width, height: testCase.height },
      reducedMotion: testCase.reduced ? 'reduce' : 'no-preference',
    });
    try {
      await context.addInitScript(() => {
        window.__entryHandoff = { flashes: [], cleanupFlashes: [], frames: 0, faded: false, removed: false, sawGate: false, stop: false };
        const inspect = (cleanup = false) => {
          const probe = window.__entryHandoff;
          const gate = document.querySelector('.entry-gate');
          const opacity = gate ? Number(getComputedStyle(gate).opacity) : 0;
          if (gate) probe.sawGate = true;
          if (gate && opacity < .01) probe.faded = true;
          if (probe.sawGate && !gate) probe.removed = true;
          if ((probe.faded || probe.removed) && gate && opacity > .05) {
            (cleanup ? probe.cleanupFlashes : probe.flashes).push({ opacity, stage: document.querySelector('.experience')?.dataset.stage });
          }
        };
        const originalCancel = Animation.prototype.cancel;
        Animation.prototype.cancel = function (...args) {
          const result = originalCancel.apply(this, args);
          // Also observe a transient visible state between animation cleanup and React's commit.
          inspect(true);
          return result;
        };
        const sample = () => {
          inspect();
          window.__entryHandoff.frames++;
          if (!window.__entryHandoff.stop) requestAnimationFrame(sample);
        };
        requestAnimationFrame(sample);
      });
      let entering = false;
      let delayedChunks = 0;
      if (testCase.slow) {
        await context.route('**/_next/static/chunks/**', async route => {
          if (entering && route.request().resourceType() === 'script') {
            delayedChunks++;
            await page.waitForTimeout(1600);
          }
          await route.continue();
        });
      }
      const test = await context.newPage();
      const errors = [];
      test.on('pageerror', error => errors.push(error.message));
      if (testCase.slow) {
        const cdp = await context.newCDPSession(test);
        await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
      }
      await test.goto('http://127.0.0.1:3001');
      const entry = test.getByRole('button', { name: testCase.sound ? 'Enter with sound' : 'Enter quietly', exact: true });
      entering = true;
      if (testCase.reduced) {
        await entry.focus();
        await test.keyboard.press('Enter');
      } else await entry.click();
      await test.locator('[data-stage="active"]').waitFor();
      // Covers the reported late flash and late-loading motion components.
      await test.waitForTimeout(testCase.slow ? 3200 : 2400);
      const result = await test.evaluate(() => {
        const probe = window.__entryHandoff;
        probe.stop = true;
        const entryAnimations = document.getAnimations().filter(animation => animation.effect?.target?.closest?.('.entry-gate,.within-copy'));
        return {
          flashes: probe.flashes.length,
          cleanupFlashes: probe.cleanupFlashes.length,
          frames: probe.frames,
          gateRemoved: !document.querySelector('.entry-gate'),
          ready: !document.querySelector('main').inert,
          leftoverEntryAnimations: entryAnimations.length,
        };
      });
      if (testCase.sound) await test.getByRole('button', { name: 'Mute sound', exact: true }).waitFor();
      if (errors.length || result.flashes || result.cleanupFlashes || !result.gateRemoved || !result.ready || result.leftoverEntryAnimations) {
        throw new Error(JSON.stringify({ case: testCase.name, errors, ...result }));
      }
      if (testCase.slow && !delayedChunks) throw new Error('Slow-loading case did not delay motion chunks');
      results.push({ case: testCase.name, ...result, delayedChunks });
    } finally {
      await context.close();
    }
  }
  return results;
}
