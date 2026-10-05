async (page) => {
  const reports=[];
  for(const [width,height] of [[1440,900],[390,844]]) {
    const context=await page.context().browser().newContext({viewport:{width,height}});
    const tab=await context.newPage();
    const images=[];
    tab.on('request',req=>{if(req.resourceType()==='image')images.push(req.url().replace('http://127.0.0.1:3001',''));});
    await tab.goto('http://127.0.0.1:3001');
    await tab.waitForFunction(()=>document.querySelector('main').inert);
    await tab.waitForTimeout(800);
    const beforeEntry=[...images];
    if(beforeEntry.some(src=>/memory-|iris|encounter|connection|afterglow|touch/.test(src)))throw new Error(JSON.stringify({width,unnecessaryImages:beforeEntry}));
    await tab.getByRole('button',{name:'Enter quietly',exact:true}).click();
    await tab.locator('[data-stage="active"]').waitFor();
    await tab.waitForTimeout(1200);
    if(!await tab.locator('main').isVisible())throw new Error('Story did not reveal');
    if(!await tab.locator('.within-wide img').evaluate(img=>img.complete&&img.naturalWidth>0))throw new Error('Opening not ready');
    await tab.screenshot({path:`output/playwright/final-entry-${width}.png`});
    await tab.evaluate(()=>{const s=document.getElementById('thought');scrollTo(0,s.offsetTop+(s.offsetHeight-innerHeight)*.4)});
    await tab.waitForTimeout(1500);
    const decoded=await tab.locator('.memory-reel img').evaluateAll(images=>images.length===4&&images.every(i=>i.complete&&i.naturalWidth>0));
    if(!decoded)throw new Error('Deferred memories failed to load');
    reports.push({width,beforeEntry,openingReady:true,deferredMemoriesReady:true});
    await context.close();
  }
  return reports;
}
