async (page) => {
 const ctx=await page.context().browser().newContext({viewport:{width:1440,height:900}});
 await ctx.addInitScript(()=>{const Native=window.Audio;window.Audio=function(...args){const a=new Native(...args);window.__qaAudio=a;return a;};window.Audio.prototype=Native.prototype;});
 const p=await ctx.newPage();
 await p.goto('http://127.0.0.1:3001');
 await p.getByRole('button',{name:'Enter with sound',exact:true}).click();
 await p.getByRole('button',{name:'Mute sound',exact:true}).waitFor();
 await p.waitForTimeout(800);
 const result=await p.evaluate(()=>({duration:window.__qaAudio.duration,time:window.__qaAudio.currentTime,paused:window.__qaAudio.paused,src:window.__qaAudio.currentSrc}));
 await ctx.close();
 if(!Number.isFinite(result.duration)||result.time<=0||result.paused)throw new Error(JSON.stringify(result));
 return result;
}