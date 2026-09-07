import {readFile,writeFile,mkdir} from 'node:fs/promises';
import assert from 'node:assert/strict';
const root=new URL('../',import.meta.url);
const template=JSON.parse(await readFile(new URL('scripts/hkjc-request.json',root),'utf8'));
const cache=new URL('../../history-cache/',import.meta.url);await mkdir(cache,{recursive:true});
const periods=[];
for(let year=1993;year<=2026;year++)for(let q=0;q<4;q++){
 const startDate=`${year}${String(q*3+1).padStart(2,'0')}01`;
 if(startDate>'20260907')continue;
 const endDate=`${year}${String(q*3+3).padStart(2,'0')}${q===0||q===3?'31':'30'}`;
 periods.push({startDate,endDate:endDate>'20260907'?'20260907':endDate,drawType:'All'});
}
let cursor=0;const results=[];
async function worker(){while(cursor<periods.length){const variables=periods[cursor++];const file=new URL(variables.startDate+'.json',cache);let rows;
 try{rows=JSON.parse(await readFile(file,'utf8'));}catch{
  for(let attempt=0;attempt<3;attempt++)try{
   const res=await fetch('https://info.cld.hkjc.com/graphql/base/',{method:'POST',headers:{'Content-Type':'application/json',Origin:'https://bet.hkjc.com',Referer:'https://bet.hkjc.com/'},body:JSON.stringify({...template,variables}),signal:AbortSignal.timeout(45000)});
   assert(res.ok);const body=await res.json();assert(!body.errors,JSON.stringify(body.errors));rows=body.data.lotteryDraws;assert(Array.isArray(rows));await writeFile(file,JSON.stringify(rows));break;
  }catch(e){if(attempt===2)throw e;await new Promise(r=>setTimeout(r,2000));}
 }
 results.push(...rows);console.log(variables.startDate,rows.length);
}}
await Promise.all([worker(),worker(),worker()]);
const draws=new Map();
for(const r of results){if(r.status!=='Result')continue;const main=r.drawResult?.drawnNo,special=r.drawResult?.xDrawnNo;
 assert(Array.isArray(main)&&main.length===6&&new Set([...main,special]).size===7&&[...main,special].every(n=>Number.isInteger(n)&&n>=1&&n<=49),'Invalid draw');
 const date=r.drawDate.slice(0,10),issue=`${String(r.year).slice(-2)}/${String(r.no).padStart(3,'0')}`;
 const key=`${r.year}/${r.no}`;const draw={issue,date,main:[...main].sort((a,b)=>a-b),special};
 if(draws.has(key))assert.deepEqual(draws.get(key),draw);draws.set(key,draw);
}
const sorted=[...draws.values()].sort((a,b)=>b.date.localeCompare(a.date)||b.issue.localeCompare(a.issue));
const gaps=[];for(let year=1993;year<=2026;year++){const nums=sorted.filter(d=>d.date.startsWith(String(year))).map(d=>Number(d.issue.split('/')[1])).sort((a,b)=>a-b);for(let n=1;n<=Math.max(...nums);n++)if(!nums.includes(n))gaps.push(`${year}/${n}`);}
assert(sorted.length>3000);const history={source:'香港赛马会',sourceUrl:'https://bet.hkjc.com/ch/marksix/results',checkedAt:new Date().toISOString(),coverage:{from:sorted.at(-1).date,to:sorted[0].date,missingIssues:gaps},draws:sorted};
await writeFile(new URL('data/history.json',root),JSON.stringify(history,null,2)+'\n');
console.log(JSON.stringify({count:sorted.length,coverage:history.coverage}));

