async (page) => {
  const result={};
  await page.setViewportSize({width:390,height:844});
  await page.emulateMedia({reducedMotion:'no-preference'});
  await page.goto('http://127.0.0.1:3001');
  await page.getByRole('button',{name:'Enter quietly',exact:true}).click();
  await page.locator('[data-stage="active"]').waitFor();
  await page.waitForTimeout(900);
  await page.getByRole('button',{name:'Reduce motion',exact:true}).click();
  await page.locator('[data-reduced="true"]').waitFor();
  result.reduced=await page.evaluate(()=>({pins:document.querySelectorAll('.pin-spacer').length,canvases:document.querySelectorAll('.light-canvas').length,chapters:document.querySelectorAll('[data-chapter]').length}));
  if(result.reduced.pins||result.reduced.canvases||result.reduced.chapters!==8)throw new Error('Reduced-motion cleanup failed');
  await page.getByRole('link',{name:'What remains',exact:true}).click();
  await page.getByRole('button',{name:'About this experience',exact:true}).click();
  await page.getByRole('dialog').waitFor();
  await page.keyboard.press('Escape');
  if(await page.getByRole('dialog').isVisible())throw new Error('Dialog Escape failed');
  await page.getByRole('button',{name:'Experience again',exact:true}).click();
  result.replay=await page.evaluate(()=>scrollY===0);
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.reload();
  await page.getByRole('button',{name:'Enter quietly',exact:true}).focus();
  await page.keyboard.press('Enter');
  await page.locator('[data-stage="active"][data-reduced="true"]').waitFor();
  result.keyboardEntry=true;
  result.reducedMemories=await page.locator('.memory-shot').evaluateAll(shots=>shots.length===4&&shots.every(shot=>getComputedStyle(shot).visibility==='visible'&&shot.offsetHeight>=700));
  result.reducedNative=await page.locator('.experience').getAttribute('data-smooth')===null;

  const browser=page.context().browser();
  const plain=await browser.newContext({javaScriptEnabled:false,viewport:{width:390,height:844}});
  const plainPage=await plain.newPage();
  await plainPage.goto('http://127.0.0.1:3001');
  result.noJs=await plainPage.locator('main').isVisible()&&(await plainPage.locator('[data-chapter]').count())===8;
  if(!result.noJs||await plainPage.locator('.entry-gate').isVisible())throw new Error('No-JS story blocked');
  await plain.close();

  const noGpu=await browser.newContext({viewport:{width:1366,height:768}});
  await noGpu.addInitScript(()=>{const native=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(type,...args){return String(type).includes('webgl')?null:native.call(this,type,...args);};});
  const noGpuPage=await noGpu.newPage();
  await noGpuPage.goto('http://127.0.0.1:3001');
  await noGpuPage.getByRole('button',{name:'Enter quietly',exact:true}).click();
  await noGpuPage.locator('[data-stage="active"]').waitFor();
  await noGpuPage.getByRole('link',{name:'An inner universe',exact:true}).click();
  await noGpuPage.mouse.wheel(0,600);
  await noGpuPage.waitForTimeout(1200);
  result.noWebGL=await noGpuPage.locator('.inner-fallback').evaluate(el=>getComputedStyle(el).opacity!=='0'&&el.querySelectorAll('i').length===22);
  await noGpuPage.screenshot({path:'output/playwright/no-webgl.png'});
  await noGpu.close();

  await page.emulateMedia({reducedMotion:'no-preference'});
  await page.reload();
  await page.getByRole('button',{name:'Enter quietly',exact:true}).click();
  await page.locator('[data-webgl="true"]').waitFor();
  result.contextLoss=await page.locator('.light-canvas canvas').evaluate(canvas=>{const gl=canvas.getContext('webgl2');const ext=gl.getExtension('WEBGL_lose_context');if(!ext)return false;ext.loseContext();return true;});
  await page.waitForTimeout(300);
  result.contextLossFallback=await page.locator('.experience').getAttribute('data-webgl')===null;
  if(Object.values(result).some(value=>value===false))throw new Error(JSON.stringify(result));
  return result;
}
