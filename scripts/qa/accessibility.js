async (page) => {
 await page.setViewportSize({width:390,height:844});
 await page.emulateMedia({reducedMotion:'reduce'});
 await page.goto('http://127.0.0.1:3001');
 await page.getByRole('button',{name:'Enter quietly',exact:true}).click();
 await page.locator('[data-stage="active"]').waitFor();
 await page.addScriptTag({path:'node_modules/axe-core/axe.min.js'});
 const result=await page.evaluate(async()=>{const r=await window.axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa']}});return r.violations.map(v=>({id:v.id,impact:v.impact,nodes:v.nodes.map(n=>({target:n.target,summary:n.failureSummary}))}));});
 if(result.length)throw new Error(JSON.stringify(result));
 await page.emulateMedia({reducedMotion:'no-preference'});
 await page.reload();
 await page.getByRole('button',{name:'Enter quietly',exact:true}).click();
 await page.locator('[data-smooth="true"]').waitFor();
 await page.evaluate(()=>{const s=document.getElementById('connection');scrollTo(0,s.offsetTop+(s.offsetHeight-innerHeight)*.98);});
 await page.waitForTimeout(800);
 await page.addScriptTag({path:'node_modules/axe-core/axe.min.js'});
 const release=await page.evaluate(async()=>{const r=await window.axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa']}});return r.violations.map(v=>({id:v.id,impact:v.impact,nodes:v.nodes.map(n=>({target:n.target,summary:n.failureSummary}))}));});
 if(release.length)throw new Error(JSON.stringify(release));
 await page.evaluate(()=>{const s=document.getElementById('afterglow');scrollTo(0,s.offsetTop+(s.offsetHeight-innerHeight)*.15);});
 await page.waitForTimeout(800);
 const afterglow=await page.evaluate(async()=>{const r=await window.axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa']}});return r.violations.map(v=>({id:v.id,impact:v.impact,nodes:v.nodes.map(n=>({target:n.target,summary:n.failureSummary}))}));});
 if(afterglow.length)throw new Error(JSON.stringify(afterglow));
 await page.screenshot({path:'output/playwright/final-afterglow-inset-mobile.png'});
 return {violations:0,states:['static story','illuminated finale','afterglow inset'],chapters:await page.locator('[data-chapter]').count()};
}
