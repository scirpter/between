async (page) => {
  const reports = [];
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.emulateMedia({reducedMotion:'no-preference'});
  await page.setViewportSize({width:1440,height:900});
  await page.goto('http://127.0.0.1:3001');
  await page.getByRole('button',{name:'Enter quietly',exact:true}).click();
  await page.locator('[data-smooth="true"]').waitFor();
  if(await page.locator('main button').count()!==2 || await page.locator('main input').count()) throw new Error('Story still has interaction gates');
  await page.mouse.move(720,450);
  await page.mouse.wheel(0,650);
  await page.waitForTimeout(60);
  const during=await page.evaluate(()=>scrollY);
  await page.waitForTimeout(1300);
  const settled=await page.evaluate(()=>scrollY);
  if(!(during>0 && during<settled && settled>=640 && settled<=660))throw new Error(JSON.stringify({lenisFailed:true,during,settled}));
  reports.push({smoothWheel:{during,settled}});
  const seek=async(id,p)=>{
    await page.evaluate(({id,p})=>{const s=document.getElementById(id);scrollTo(0,s.offsetTop+(s.offsetHeight-innerHeight)*p);},{id,p});
    await page.waitForTimeout(750);
  };
  const memories=[['room',.22],['rain',.41],['sea',.6],['dance',.8]];
  for(const [width,height] of [[1440,900],[390,844]]) {
    await page.setViewportSize({width,height});
    await page.waitForTimeout(600);
    for(const [memory,p] of [...memories,...memories.slice().reverse()]){
      await seek('thought',p);
      const result=await page.locator('.memory-'+memory).evaluate(shot=>{
        const caption=shot.querySelector('.memory-caption'),title=caption.querySelector('h3'),r=title.getBoundingClientRect();
        return {visible:getComputedStyle(shot).visibility==='visible'&&Number(getComputedStyle(shot).opacity)>.99,
          caption:Number(getComputedStyle(caption).opacity)>.99,framed:r.left>=0&&r.right<=innerWidth&&r.top>=70&&r.bottom<=innerHeight-60,
          source:shot.querySelector('img').currentSrc,ready:shot.querySelector('img').naturalWidth>0};
      });
      if(!result.visible||!result.caption||!result.framed||!result.ready)throw new Error(JSON.stringify({width,memory,p,...result}));
      await page.screenshot({path:'output/playwright/memory-'+memory+'-'+width+'.png'});
      reports.push({width,memory,...result});
    }
    await seek('touch',.82);
    if(Number(await page.locator('.touch-answer').evaluate(el=>getComputedStyle(el).opacity))<.99)throw new Error('Touch did not unfold with scroll');
    await page.screenshot({path:'output/playwright/touch-answer-'+width+'.png'});
    await seek('connection',.94);
    if(await page.locator('.experience').getAttribute('data-tone')!=='light')throw new Error('Release chrome lacks contrast');
    await seek('afterglow',.65);
    if(await page.locator('.experience').getAttribute('data-tone')!=='dark')throw new Error('Photo chrome failed to restore');
  }
  await page.setViewportSize({width:1440,height:900});
  await page.getByRole('link',{name:'What we carry',exact:true}).focus();
  await page.keyboard.press('Enter');
  await page.waitForTimeout(1900);
  if(await page.evaluate(()=>document.activeElement.id)!=='thought-title')throw new Error('Chapter keyboard navigation did not transfer focus');
  if(await page.getByRole('link',{name:'What we carry',exact:true}).getAttribute('aria-current')!=='location')throw new Error('Chapter indicator incorrect');
  await page.getByRole('link',{name:'What remains',exact:true}).click();
  await page.waitForTimeout(1900);
  await page.getByRole('button',{name:'About this experience',exact:true}).click();
  await page.getByRole('dialog').waitFor();
  const paused=await page.evaluate(()=>scrollY);
  await page.mouse.move(50,400);
  await page.mouse.wheel(0,-700);
  await page.waitForTimeout(450);
  if(Math.abs(await page.evaluate(()=>scrollY)-paused)>2)throw new Error('Credits did not lock background scroll');
  await page.keyboard.press('Escape');
  await page.mouse.wheel(0,-400);
  await page.waitForTimeout(1200);
  if(await page.evaluate(()=>scrollY)>=paused-300)throw new Error('Scroll did not resume after credits');
  await page.getByRole('button',{name:'Reduce motion',exact:true}).click();
  await page.waitForTimeout(500);
  if(await page.locator('.pin-spacer').count()||await page.locator('html.lenis').count())throw new Error('Reduced mode retained smooth scroll/pins');
  await page.getByRole('button',{name:'Enable motion',exact:true}).click();
  await page.locator('[data-smooth="true"]').waitFor();
  await page.getByRole('link',{name:'What remains',exact:true}).click();
  await page.waitForTimeout(1900);
  await page.getByRole('button',{name:'Experience again',exact:true}).click();
  await page.waitForTimeout(350);
  if(await page.evaluate(()=>scrollY)!==0)throw new Error('Replay retains Lenis inertia');
  if(errors.length)throw new Error(JSON.stringify(errors));
  return {errors,checks:reports.length,reports,keyboardNavigation:true,modalPauseResume:true,motionToggle:true,replay:true};
}
