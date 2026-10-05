async (page) => {
 await page.setViewportSize({width:390,height:844});
 await page.emulateMedia({reducedMotion:'no-preference'});
 await page.route('**/images/iris-mobile.avif',async route=>{await page.waitForTimeout(1800);await route.continue();});
 await page.goto('http://127.0.0.1:3001');
 const format=await page.locator('.gate-image img').evaluate(img=>img.currentSrc);
 await page.getByRole('button',{name:'Enter quietly',exact:true}).click();
 await page.waitForTimeout(200);
 const preparing=await page.getByRole('button',{name:'Preparing experience',exact:true}).isVisible();
 await page.locator('[data-stage="active"]').waitFor();
 const ready=await page.locator('.within-wide img').evaluate(img=>img.complete&&img.naturalWidth===900);
 await page.screenshot({path:'output/playwright/final-mobile-opening.png'});
 await page.unroute('**/images/iris-mobile.avif');
 if(!preparing||!ready||!format.endsWith('.avif'))throw new Error(JSON.stringify({preparing,ready,format}));
 return {preparing,ready,format};
}