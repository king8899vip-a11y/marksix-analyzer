const {chromium}=require('C:/Users/江江/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({channel:'msedge',headless:true});
 const base=process.env.VERIFY_URL||'https://yjyq.com/';
 try{
  const context=await browser.newContext();
  const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
  for(const width of [320,390,1440]){
   await page.setViewportSize({width,height:900});
   const response=await page.goto(base+'?verify='+Date.now());assert.equal(response.status(),200);
   await page.waitForSelector('#latestBalls .ball');
   const state=await page.evaluate(()=>({text:document.querySelector('#nextDrawSchedule').textContent,overflow:document.documentElement.scrollWidth>innerWidth,version:document.querySelector('script[src*=schedule]').getAttribute('src')}));
   assert.match(state.text,/^下期开奖时间：(?:待官方公布|\d{4}年\d{1,2}月\d{1,2}日 (?:\d{1,2}点\d{2}分|时间待官方公布)，星期[一二三四五六日])$/);
   assert.equal(state.overflow,false);assert.match(state.version,/3\.3\.1/);
   console.log(JSON.stringify({width,...state}));
   await page.screenshot({path:'../schedule-verified-'+width+'.png'});
  }
  const h=await(await page.request.get(base+'data/history.json?t='+Date.now())).json();
  const s=await(await page.request.get(base+'data/snapshot.json?t='+Date.now())).json();
  assert.deepEqual(h.nextDraw,s.nextDraw);assert.equal(h.nextDraw.basedOnIssue,h.draws[0].issue);
  await page.evaluate(async()=>{await navigator.serviceWorker.ready});
  await page.reload();await page.waitForSelector('#latestBalls .ball');
  assert.ok((await page.evaluate(()=>caches.keys())).includes('marksix-analyzer-v3.3.1'));
  assert.deepEqual(errors,[]);console.log('Published data pairing, new service worker cache and browser errors PASS');
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
