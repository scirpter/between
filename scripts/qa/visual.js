async (page) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  const reports = [];
  const scenes = [['within',.12],['inner',.35],['thought',.04],['distance',.12],['encounter',.6],['touch',.22],['connection',.27],['afterglow',.65]];
  for (const [width,height] of [[1440,900],[1366,768],[390,844],[360,800]]) {
    await page.setViewportSize({width,height});
    await page.goto('http://127.0.0.1:3001');
    await page.getByRole('button',{name:'Enter quietly',exact:true}).waitFor();
    await page.waitForFunction(()=>document.querySelector('main').inert);
    await page.screenshot({path:`output/playwright/gate-${width}.png`});
    await page.getByRole('button',{name:'Enter quietly',exact:true}).click();
    await page.locator('[data-stage="active"]').waitFor();
    await page.waitForTimeout(700);
    for (const [id,p] of scenes) {
      await page.evaluate(({id,p}) => {const s=document.getElementById(id);window.scrollTo(0,s.offsetTop+(s.offsetHeight-innerHeight)*p);},{id,p});
      await page.waitForTimeout(1300);
      await page.screenshot({path:`output/playwright/${id}-${width}.png`});
      reports.push(await page.evaluate(({id,width}) => {
        const s=document.getElementById(id),h=s.querySelector('h1,h2'),rects=[...h.children].map(span=>span.getBoundingClientRect());
        let opacity=1;for(let n=h;n&&n!==s;n=n.parentElement)opacity*=Number(getComputedStyle(n).opacity);
        return {width,id,overflow:document.documentElement.scrollWidth>innerWidth,headingVisible:rects.every(r=>r.top>=-1&&r.bottom<=innerHeight+1&&r.left>=-1&&r.right<=innerWidth+1)&&opacity>.9,imagesReady:[...s.querySelectorAll('img')].every(i=>i.complete&&i.naturalWidth>0)};
      },{id,width}));
    }
    // Reverse traversal must restore the early chapter's title.
    await page.evaluate(()=>{const s=document.getElementById('inner');window.scrollTo(0,s.offsetTop+(s.offsetHeight-innerHeight)*.35);});
    await page.waitForTimeout(1400);
    const restored=await page.locator('.inner-copy').evaluate(el=>getComputedStyle(el).opacity==='1');
    if(!restored)throw new Error('Reverse scroll failed');
    await page.evaluate(()=>{const s=document.getElementById('connection');window.scrollTo(0,s.offsetTop+(s.offsetHeight-innerHeight)*.94);});
    await page.waitForTimeout(1400);
    await page.screenshot({path:`output/playwright/release-${width}.png`});
    const release=await page.locator('.connection-postscript').evaluate(el=>getComputedStyle(el).opacity);
    if(Number(release)<.9)throw new Error('Final release absent');
    await page.getByRole('link',{name:'What remains',exact:true}).click();
    await page.waitForTimeout(1700);
    await page.getByRole('button',{name:'Experience again',exact:true}).click();
    if(await page.evaluate(()=>scrollY)!==0)throw new Error('Replay scroll failed');
  }
  const failures=reports.filter(r=>r.overflow||!r.headingVisible||!r.imagesReady);
  if(errors.length||failures.length)throw new Error(JSON.stringify({errors,failures}));
  return {errors,checks:reports.length,reports};
}
