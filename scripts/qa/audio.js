async (page) => {
  const browser=page.context().browser();
  const results={};
  const setup=async({reject=false,delay=0}={})=>{
    const context=await browser.newContext({viewport:{width:1366,height:768},reducedMotion:'reduce'});
    await context.route('http://127.0.0.1:3001/',async route=>{
      const response=await route.fetch();
      const body=await response.text();
      const replacement=body.replaceAll('audioAvailable\\":false','audioAvailable\\":true').replaceAll(' · coming soon','');
      if(!replacement.includes('audioAvailable')) throw new Error('Audio flag missing');
      await route.fulfill({response,body:replacement});
    });
    await context.route('**/audio/inner-light-instrumental.mp3',async route=>{
      if(delay) await page.waitForTimeout(delay);
      await route.fulfill({path:'output/playwright/silence.wav',contentType:'audio/wav'});
    });
    await context.addInitScript((reject)=>{
      const NativeAudio=window.Audio;
      window.Audio=function(...args){const audio=new NativeAudio(...args);window.__testAudio=audio;return audio;};
      window.Audio.prototype=NativeAudio.prototype;
      if(reject) HTMLMediaElement.prototype.play=function(){return Promise.reject(new DOMException('Test autoplay rejection','NotAllowedError'));};
    },reject);
    const test=await context.newPage();
    test.on('pageerror',error=>console.log('AUDIO QA PAGE ERROR',error.message));
    await test.goto('http://127.0.0.1:3001');
    return {context,test};
  };
  const {context,test}=await setup();
  await test.getByRole('button',{name:'Enter with sound',exact:true}).click();
  await test.getByRole('button',{name:'Mute sound',exact:true}).waitFor();
  await test.waitForTimeout(350);
  results.play=await test.evaluate(()=>window.__testAudio.currentTime>0&&!window.__testAudio.paused);
  await test.getByRole('button',{name:'Mute sound',exact:true}).click();
  results.mute=await test.getByRole('button',{name:'Enable sound',exact:true}).getAttribute('aria-pressed')==='false';
  await test.getByRole('button',{name:'Enable sound',exact:true}).click();
  await test.getByRole('button',{name:'Mute sound',exact:true}).waitFor();
  await test.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,get:()=>true});document.dispatchEvent(new Event('visibilitychange'));});
  results.pauseOnHide=await test.evaluate(()=>window.__testAudio.paused);
  await test.evaluate(()=>{delete document.hidden;document.dispatchEvent(new Event('visibilitychange'));});
  await test.getByRole('button',{name:'Enable sound',exact:true}).click();
  await test.getByRole('button',{name:'Mute sound',exact:true}).waitFor();
  await test.getByRole('link',{name:'What remains',exact:true}).click();
  await test.getByRole('button',{name:'Experience again',exact:true}).click();
  results.replay=await test.evaluate(()=>scrollY===0&&window.__testAudio.currentTime<1);
  await test.getByRole('button',{name:'Enable sound',exact:true}).waitFor();
  results.naturalEnd=await test.evaluate(()=>window.__testAudio.ended);
  await context.close();

  const failed=await setup({reject:true});
  await failed.test.getByRole('button',{name:'Enter with sound',exact:true}).click();
  await failed.test.locator('[data-stage="active"]').waitFor();
  results.rejection=await failed.test.locator('.audio-message').innerText();
  if(!results.rejection.includes('Tap Sound')) throw new Error('Playback rejection message absent');
  await failed.context.close();

  const slow=await setup({delay:2500});
  await slow.test.getByRole('button',{name:'Enter with sound',exact:true}).click();
  await slow.test.locator('[data-stage="active"]').waitFor();
  results.delayedLoading=await slow.test.getByText('Sound loading',{exact:true}).isVisible();
  await slow.test.getByRole('button',{name:'Mute sound',exact:true}).waitFor();
  results.delayedSuccess=true;
  await slow.context.close();
  if(Object.values(results).some(value=>value===false)) throw new Error(JSON.stringify(results));
  return results;
}
