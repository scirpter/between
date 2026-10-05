async (page) => {
  const context=await page.context().browser().newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,deviceScaleFactor:1});
  const tab=await context.newPage();
  try {
    await tab.goto('http://127.0.0.1:3001');
    await tab.getByRole('button',{name:'Enter quietly',exact:true}).tap();
    await tab.locator('[data-smooth="true"]').waitFor();
    const cdp=await context.newCDPSession(tab);
    await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:190,y:650}]});
    for(let y=620;y>=220;y-=40){
      await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:190,y}]});
      await tab.waitForTimeout(20);
    }
    await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
    await tab.waitForTimeout(500);
    const moved=await tab.evaluate(()=>scrollY);
    if(moved<300)throw new Error('Native touch cannot scroll through scene');
    // A tap during a native fling only stops the fling in Chromium. Wait for rest.
    await tab.waitForFunction(()=>{
      const state=window.__touchRest??(window.__touchRest={y:scrollY,since:performance.now()});
      if(Math.abs(scrollY-state.y)>1){state.y=scrollY;state.since=performance.now();}
      return performance.now()-state.since>350;
    },null,{polling:100,timeout:10000});
    await tab.getByRole('link',{name:'What we carry',exact:true}).tap();
    await tab.waitForTimeout(1800);
    if(await tab.evaluate(()=>document.activeElement.id)!=='thought-title')throw new Error('Touch chapter navigation failed '+JSON.stringify(await tab.evaluate(()=>({focus:document.activeElement.outerHTML.slice(0,200),hash:location.hash,scroll:scrollY,target:document.getElementById('thought').offsetTop,smooth:document.querySelector('.experience').dataset.smooth,active:document.querySelector('[aria-current="location"]').getAttribute('href')}))));
    const overflow=await tab.evaluate(()=>document.documentElement.scrollWidth>innerWidth);
    if(overflow)throw new Error('Mobile horizontal overflow');
    await tab.getByRole('button',{name:'Reduce motion',exact:true}).tap();
    await tab.waitForTimeout(400);
    if(await tab.locator('html.lenis').count())throw new Error('Lenis retained under reduced motion');
    return {nativeTouchScroll:moved,chapterNavigation:true,reducedCleanup:true,overflow};
  } finally {await context.close();}
}
