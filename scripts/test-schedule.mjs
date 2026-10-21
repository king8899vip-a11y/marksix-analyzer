import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
import schedule from '../schedule.js';
const latest={issue:'26/112',date:'2026-10-20'};
const row={year:2026,no:113,status:'Defined',drawDate:'2026-10-22+08:00',closeDate:'2026-10-22T21:15:00+08:00'};
const next=schedule.parse([row],latest);
assert.equal(next.issue,'26/113');assert.equal(next.weekday,'星期四');assert.equal(next.time,null);
assert.match(schedule.text(next,latest,new Date('2026-10-21')),/21点30分/);
assert.doesNotMatch(schedule.text(next,latest,new Date('2026-10-21')),/21:15/);
assert.equal(schedule.parse([{...row,drawDate:'2026-02-30'}],latest).date,null);
assert.equal(schedule.parse([{...row,status:'Cancelled'}],latest).date,null);
assert.equal(schedule.parse([],latest).issue,null);
assert.equal(schedule.parse([{...row,no:112}],latest).issue,null);
assert.match(schedule.text(next,{issue:'26/113'},new Date('2026-10-21')),/^下期开奖时间：待官方公布$/);
assert.match(schedule.text(next,latest,new Date('2026-10-23')),/^下期开奖时间：待官方公布$/);
assert.equal(schedule.parse([{...row,year:2027,no:1,drawDate:'2027-01-02'}],{issue:'26/150',date:'2026-12-31'}).issue,'27/001');
const sandbox={Intl,Date};vm.runInNewContext(await readFile(new URL('../schedule.js',import.meta.url),'utf8'),sandbox);assert.equal(sandbox.MarkSixSchedule.parse([row],latest).issue,next.issue);
const app=await readFile(new URL('../app.js',import.meta.url),'utf8');assert.match(app,/nextDraw:history.nextDraw/);assert.match(app,/nextDraw:data.nextDraw/);
const html=await readFile(new URL('../index.html',import.meta.url),'utf8');assert.match(html,/class="official-live-link" href="https:\/\/www.hkjc.com\/jctv\/"/);assert.match(html,/官方演示短片（非直播）/);
console.log('Schedule tests passed: official dates, pending time, rollover, cancellation, invalid dates, stale pairing, browser parity and live entry');
const confirmed=schedule.parse([{...row,drawDate:'2026-10-22T21:30:00+08:00'}],latest);
assert.equal(confirmed.time,'21:30');assert.match(schedule.text(confirmed,latest,new Date('2026-10-21')),/21点30分/);
assert.equal(schedule.parse([{...row,drawDate:'2026-10-22T00:00:00+08:00'}],latest).time,null);
assert.equal(schedule.text(confirmed,latest,new Date('2026-10-21')), '下期开奖时间：2026年10月22日 21点30分，星期四');
assert.equal(schedule.text(next,latest,new Date('2026-10-21')), '下期开奖时间：2026年10月22日 21点30分，星期四');
for(const time of ['20:45','19:05','22:00']){
 const n=schedule.parse([{...row,drawDate:'2026-10-22T'+time+':00+08:00'}],latest);
 assert.equal(schedule.text(n,latest,new Date('2026-10-21')), '下期开奖时间：2026年10月22日 21点30分，星期四');
}
assert.equal(schedule.text({...confirmed,weekday:'星期一'},latest,new Date('2026-10-21')),schedule.text(confirmed,latest,new Date('2026-10-21')));
assert.equal(schedule.text(confirmed,latest,new Date('2026-10-22T13:30:00Z')),'下期开奖时间：2026年10月22日 21点30分，星期四');
assert.equal(schedule.text(next,latest,new Date('2026-10-22T16:01:00Z')),'下期开奖时间：待官方公布');
assert.match(schedule.text(next,latest,new Date('2026-10-21T16:01:00Z')),/2026年10月22日/);
assert.equal(schedule.text({...next,timeZone:'UTC'},latest,new Date('2026-10-21')),'下期开奖时间：待官方公布');
console.log('Fixed display time, official dates, weekday and Hong Kong midnight PASS');

// Exercise the actual updater with official response fixtures, including result rollover and outages.
const {updateNextDraw}=await import('./update-next-draw.mjs');
const originalFetch=globalThis.fetch;
try{
 for(const drawDate of ['2026-10-22+08:00','2026-10-22T20:45:00+08:00']){
  globalThis.fetch=async(url,options)=>{
   assert.equal(url,'https://info.cld.hkjc.com/graphql/base/');
   assert.deepEqual(JSON.parse(options.body).variables,{});
   return {ok:true,json:async()=>({data:{lotteryDraws:[{...row,drawDate}]}})};
  };
  const parsed=await updateNextDraw(latest);
  assert.equal(parsed.time,drawDate.includes('T')?'20:45':null);
 }
 globalThis.fetch=async()=>({ok:true,json:async()=>({data:{lotteryDraws:[{...row,status:'Result'}]}})});
 assert.equal((await updateNextDraw(latest)).status,'pending');
 globalThis.fetch=async()=>{throw Error('test outage')};
 assert.equal((await updateNextDraw(latest)).status,'pending');
}finally{globalThis.fetch=originalFetch}
console.log('Official updater fixtures and unavailable source PASS');

const delayed=schedule.parse([{...row,drawDate:'2026-10-24+08:00'}],latest);
assert.equal(schedule.text(delayed,latest,new Date('2026-10-21')),'下期开奖时间：2026年10月24日 21点30分，星期六');
