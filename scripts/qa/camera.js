async (page) => {
 await page.emulateMedia({reducedMotion:'no-preference'});
 await page.setViewportSize({width:1440,height:900});
 await page.goto("http://127.0.0.1:3001");
 await page.getByRole("button",{name:"Enter quietly",exact:true}).click();
 await page.locator('[data-webgl="true"]').waitFor();
 const results=[];
 for(const [id,p] of [['afterglow',.65],['inner',.35],['connection',.55],['within',.65]]) {
   await page.evaluate(({id,p})=>{const s=document.getElementById(id);window.scrollTo(0,s.offsetTop+(s.offsetHeight-innerHeight)*p);},{id,p});
   await page.waitForTimeout(1600);
   await page.screenshot({path:`output/playwright/revised-${id}.png`});
   if(id==='inner'||id==='connection') {
     const pixels=await page.locator('.light-canvas canvas').evaluate(canvas=>new Promise(resolve=>requestAnimationFrame(()=>{const gl=canvas.getContext('webgl2');const pixels=new Uint8Array(gl.drawingBufferWidth*gl.drawingBufferHeight*4);gl.readPixels(0,0,gl.drawingBufferWidth,gl.drawingBufferHeight,gl.RGBA,gl.UNSIGNED_BYTE,pixels);let lit=0;for(let i=3;i<pixels.length;i+=4)if(pixels[i]>2)lit++;resolve(lit);})));
     results.push({id,pixels});
   }
 }
 if(results.some(result=>result.pixels<1000))throw new Error('Light sculpture disappeared after reverse navigation');
 for(const width of [1440,390]) {
   await page.setViewportSize({width,height:width===390?844:900});
   await page.waitForTimeout(350);
   await page.evaluate(()=>scrollTo(0,0));
   await page.waitForTimeout(350);
   await page.evaluate(()=>{const s=document.getElementById('distance');scrollTo(0,s.offsetTop+(s.offsetHeight-innerHeight)*.12);});
   await page.waitForTimeout(350);
   const regions=await page.locator('.light-canvas canvas').evaluate(canvas=>new Promise(resolve=>{
     const gl=canvas.getContext('webgl2'),w=gl.drawingBufferWidth,h=gl.drawingBufferHeight,pixels=new Uint8Array(w*h*4);
     let attempts=0;
     // The 30 fps canvas has no preserved drawing buffer between rendered frames.
     const sample=()=>{
       gl.readPixels(0,0,w,h,gl.RGBA,gl.UNSIGNED_BYTE,pixels);
       let left=0,right=0,center=0;
       for(let y=0;y<h;y++)for(let x=0;x<w;x++)if(pixels[(y*w+x)*4+3]>2){if(x<w*.4)left++;if(x>w*.6)right++;if(x>w*.43&&x<w*.57)center++;}
       if(left+right+center>0||++attempts>=12)resolve({left,right,center});else requestAnimationFrame(sample);
     };
     requestAnimationFrame(sample);
   }));
   if(regions.left<100||regions.right<100||regions.center>regions.left*.1)throw new Error('Camera lag after rapid jump '+JSON.stringify({width,...regions}));
   await page.screenshot({path:`output/playwright/final-distance-${width}.png`});
   results.push({width,rapidJump:regions});
 }
 return results;
}
