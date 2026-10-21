import {readFile} from 'node:fs/promises';
import schedule from '../schedule.js';
export async function updateNextDraw(latest){
 try{
 const request=JSON.parse(await readFile(new URL('hkjc-request.json',import.meta.url),'utf8'));request.variables={};
 const response=await fetch('https://info.cld.hkjc.com/graphql/base/',{method:'POST',cache:'no-store',headers:{'content-type':'application/json',origin:'https://bet.hkjc.com',referer:'https://bet.hkjc.com/'},body:JSON.stringify(request),signal:AbortSignal.timeout(20000)});
 if(!response.ok)throw Error('Schedule HTTP '+response.status);
 const json=await response.json();if(json.errors)throw Error('Official schedule unavailable');
 const rows=json.data?.lotteryDraws;
 // Reject a response in which this supposed next draw has already completed.
 if(rows?.some(r=>r.status==='Result'&&String(r.year).slice(-2)+'/'+String(r.no).padStart(3,'0')>latest.issue))return schedule.pending(latest);
 return schedule.parse(rows,latest);
 }catch(e){console.warn('Schedule pending:',e.message);return schedule.pending(latest);}
}
