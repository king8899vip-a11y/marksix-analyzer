import {readFile,writeFile} from 'node:fs/promises';
const root=new URL('../',import.meta.url);
export async function updateNextDraw(){
 const request=JSON.parse(await readFile(new URL('scripts/hkjc-request.json',root),'utf8'));request.variables={};
 const response=await fetch('https://info.cld.hkjc.com/graphql/base/',{method:'POST',headers:{'content-type':'application/json',origin:'https://bet.hkjc.com',referer:'https://bet.hkjc.com/'},body:JSON.stringify(request),signal:AbortSignal.timeout(20000)});
 if(!response.ok)throw Error('Schedule HTTP '+response.status);
 const json=await response.json();if(json.errors)throw Error('Official schedule unavailable');
 const today=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Hong_Kong',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
 const row=json.data?.lotteryDraws?.filter(r=>r.status!=='Result'&&String(r.drawDate).slice(0,10)>=today).sort((a,b)=>a.drawDate.localeCompare(b.drawDate))[0];
 let content='下期开奖时间：等待官方公布',date='';
 if(row){date=String(row.drawDate).slice(0,10);if(!/^\d{4}-\d{2}-\d{2}$/.test(date))throw Error('Invalid schedule date');const d=new Date(date+'T00:00:00+08:00');const label=new Intl.DateTimeFormat('zh-CN',{timeZone:'Asia/Hong_Kong',year:'numeric',month:'long',day:'numeric',weekday:'long'}).format(d);const close=/T(\d{2}:\d{2}):\d{2}\+08:00$/.exec(String(row.closeDate));content='下期开奖：'+label+'<br><small>摇珠时刻待官方确认'+(close?' · 售票截止 '+close[1]+'（香港时间）':'')+'</small>';}
 const url=new URL('index.html',root);let html=await readFile(url,'utf8');html=html.replace(/<p id="nextDrawSchedule"[^>]*>[\s\S]*?<\/p>/,'<p id="nextDrawSchedule" class="next-draw-schedule" data-draw-date="'+date+'">'+content+'</p>');await writeFile(url,html);
}
