const ENDPOINT='https://info.cld.hkjc.com/graphql/base/';
const QUERY={variables:{lastNDraw:100},query:'query marksixResult($lastNDraw:Int){lotteryDraws(lastNDraw:$lastNDraw){year no drawDate status drawResult{drawnNo xDrawnNo}}}'};
export function validateRows(rows){
 if(!Array.isArray(rows))throw Error('Invalid official response');
 const draws=rows.filter(r=>r.status==='Result').map(r=>{
  const main=r.drawResult?.drawnNo,special=r.drawResult?.xDrawnNo;
  if(!Array.isArray(main)||main.length!==6||![...main,special].every(n=>Number.isInteger(n)&&n>=1&&n<=49)||new Set([...main,special]).size!==7)throw Error('Invalid numbers');
  const year=String(r.year),no=Number(r.no),date=String(r.drawDate).slice(0,10);
  if(!/^\d{4}$/.test(year)||!Number.isInteger(no)||no<1||no>999||!/^\d{4}-\d{2}-\d{2}$/.test(date)||!date.startsWith(year)||new Date(date+'T00:00:00Z').toISOString().slice(0,10)!==date||date>new Date().toISOString().slice(0,10))throw Error('Invalid issue');
  return {issue:year.slice(-2)+'/'+String(no).padStart(3,'0'),date,main:[...main].sort((a,b)=>a-b),special};
 }).sort((a,b)=>b.date.localeCompare(a.date)||b.issue.localeCompare(a.issue));
 if(!draws.length||new Set(draws.map(d=>d.issue)).size!==draws.length)throw Error('No valid results');
 return draws;
}
export default {async fetch(request,env,ctx){
 const headers={'Content-Type':'application/json; charset=utf-8','Access-Control-Allow-Origin':'https://yjyq.com','Vary':'Origin','Cache-Control':'no-store'};
 if(request.method==='OPTIONS')return new Response(null,{headers:{...headers,'Access-Control-Allow-Methods':'GET, OPTIONS'}});
 if(request.method!=='GET')return new Response('{"error":"method"}',{status:405,headers});
 if(new URL(request.url).pathname!=='/latest')return new Response('{"error":"not_found"}',{status:404,headers});
 const key=new Request(new URL('/cache/verified-results',request.url));
 const cached=await caches.default.match(key);if(cached)return new Response(await cached.text(),{headers});
 try{
  const response=await fetch(ENDPOINT,{method:'POST',headers:{'Content-Type':'application/json','Accept':'application/json','Origin':'https://bet.hkjc.com','Referer':'https://bet.hkjc.com/'},body:JSON.stringify(QUERY),signal:AbortSignal.timeout(10000)});
  if(!response.ok)throw Error('Official unavailable');const json=await response.json();if(json.errors?.length)throw Error('Official error');
  const draws=validateRows(json.data?.lotteryDraws),body=JSON.stringify({latest:draws[0],draws,checkedAt:new Date().toISOString(),source:'香港赛马会'});
  ctx.waitUntil(caches.default.put(key,new Response(body,{headers:{'Content-Type':'application/json','Cache-Control':'public, max-age=15'}})));
  return new Response(body,{headers});
 }catch{return new Response('{"error":"official_unavailable"}',{status:503,headers});}
}};

