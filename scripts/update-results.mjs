import {readFile, writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
const root = new URL('../', import.meta.url);
export function normalize(rows) {
  assert(Array.isArray(rows), 'Missing results');
  const draws = rows.filter(r => r.status === 'Result').map(r => {
    const main = r.drawResult?.drawnNo;
    const special = r.drawResult?.xDrawnNo;
    assert(Array.isArray(main) && main.length === 6, 'Invalid main numbers');
    assert([...main,special].every(n=>Number.isInteger(n)&&n>=1&&n<=49), 'Invalid number');
    assert(new Set([...main,special]).size === 7, 'Duplicate number');
    const date = r.drawDate.slice(0,10);
    assert(/^\d{4}-\d{2}-\d{2}$/.test(date) && date <= new Date().toISOString().slice(0,10), 'Invalid date');
    assert(/^\d{4}$/.test(String(r.year)) && Number.isInteger(r.no) && r.no>0, 'Invalid issue');
    return {issue: `${String(r.year).slice(-2)}/${String(r.no).padStart(3,'0')}`,date,main:[...main].sort((a,b)=>a-b),special};
  });
  assert(draws.length>0, 'No completed draws');
  assert(new Set(draws.map(d=>d.issue)).size===draws.length, 'Duplicate issue');
  return draws.sort((a,b)=>b.date.localeCompare(a.date)||b.issue.localeCompare(a.issue));
}
async function run(){
  const request=JSON.parse(await readFile(new URL('scripts/hkjc-request.json',root),'utf8'));
  let response;
  for(let attempt=0;attempt<3;attempt++){
    try {
      const res=await fetch('https://info.cld.hkjc.com/graphql/base/',{method:'POST',headers:{'Content-Type':'application/json',Origin:'https://bet.hkjc.com',Referer:'https://bet.hkjc.com/'},body:JSON.stringify(request),signal:AbortSignal.timeout(45000)});
      assert(res.ok, `HKJC HTTP ${res.status}`); response=await res.json(); assert(!response.errors, JSON.stringify(response.errors)); break;
    }catch(e){if(attempt===2)throw e; await new Promise(r=>setTimeout(r,3000));}
  }
  const fetched=normalize(response.data?.lotteryDraws);
  const snapshot=JSON.parse(await readFile(new URL('data/snapshot.json',root),'utf8'));
  let previous=[]; try{previous=JSON.parse(await readFile(new URL('data/history.json',root),'utf8')).draws;}catch(e){if(e.code!=='ENOENT')throw e;}
  assert(!previous.length || fetched[0].date>=previous[0].date,'Source regressed');
  const merged=new Map(previous.map(d=>[d.issue,d])); fetched.forEach(d=>merged.set(d.issue,d));
  const draws=[...merged.values()].sort((a,b)=>b.date.localeCompare(a.date)||b.issue.localeCompare(a.issue));
  const checkedAt=new Date().toISOString();
  snapshot.latest=draws[0]; snapshot.checkedAt=checkedAt; snapshot.source='香港赛马会'; snapshot.sourceUrl='https://bet.hkjc.com/ch/marksix/results';
  snapshot.statisticsAsOf ||= '2026-09-05';
  await writeFile(new URL('data/history.json',root),JSON.stringify({source:snapshot.source,sourceUrl:snapshot.sourceUrl,checkedAt,draws},null,2)+'\n');
  await writeFile(new URL('data/snapshot.json',root),JSON.stringify(snapshot,null,2)+'\n');
  console.log(`Verified ${draws.length} draws; latest ${draws[0].issue} ${draws[0].date}`);
}
if(process.argv.includes('--test')){
  const valid={status:'Result',year:'2026',no:1,drawDate:'2026-01-01',drawResult:{drawnNo:[1,2,3,4,5,6],xDrawnNo:7}};
  assert.equal(normalize([valid])[0].special,7);
  assert.throws(()=>normalize([{...valid,drawResult:{drawnNo:[1,1,3,4,5,6],xDrawnNo:7}}]));
  assert.throws(()=>normalize([])); assert.throws(()=>normalize([valid,valid]));
  console.log('Validation tests passed');
}else await run();
