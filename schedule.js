(function(root){
 const sourceUrl='https://bet.hkjc.com/ch/marksix';
 const issue=r=>/^\d{4}$/.test(String(r?.year))&&Number.isInteger(Number(r.no))&&Number(r.no)>0&&Number(r.no)<1000?String(r.year).slice(-2)+'/'+String(r.no).padStart(3,'0'):null;
 const validDate=d=>/^\d{4}-\d{2}-\d{2}$/.test(d)&&Number.isFinite(Date.parse(d+'T00:00:00Z'))&&new Date(d+'T00:00:00Z').toISOString().slice(0,10)===d;
 function pending(latest,checkedAt=new Date().toISOString()){return {basedOnIssue:latest.issue,issue:null,date:null,weekday:null,time:null,timeZone:'Asia/Hong_Kong',status:'pending',source:'香港赛马会',sourceUrl,checkedAt};}
 function parse(rows,latest,checkedAt=new Date().toISOString()){
  const result=pending(latest,checkedAt);
  if(!Array.isArray(rows))return result;
  // Only accept the official sale/defined schedule, never cancelled or completed draws.
  const candidates=rows.filter(r=>['Defined','Selling','Open'].includes(r.status)).map(r=>({r,issue:issue(r),date:String(r.drawDate||'').slice(0,10)})).filter(x=>x.issue>latest.issue&&validDate(x.date)&&x.date>=latest.date&&x.date.startsWith(String(x.r.year))).sort((a,b)=>a.date.localeCompare(b.date)||a.issue.localeCompare(b.issue));
  const next=candidates[0];if(!next)return result;
  const stamp=/^\d{4}-\d{2}-\d{2}T([01]\d|2[0-3]):([0-5]\d):[0-5]\d\+08:00$/.exec(String(next.r.drawDate));
  const time=stamp&&stamp[1]+':'+stamp[2]!=='00:00'?stamp[1]+':'+stamp[2]:null;
  return {...result,time,issue:next.issue,date:next.date,weekday:new Intl.DateTimeFormat('zh-CN',{timeZone:'Asia/Hong_Kong',weekday:'long'}).format(new Date(next.date+'T12:00:00+08:00')),status:time?'confirmed':'date_confirmed'};
 }
 function text(next,latest,now=new Date()){
  const parts=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Hong_Kong',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(now);
  const value=type=>parts.find(p=>p.type===type).value;
  const today=value('year')+'-'+value('month')+'-'+value('day');
  const pendingText='下期开奖时间：待官方公布';
  if(!next||next.basedOnIssue!==latest?.issue||!validDate(next.date||'')||!/^\d{2}\/\d{3}$/.test(next.issue||'')||next.issue<=latest.issue||next.date<today||!['confirmed','date_confirmed'].includes(next.status)||next.timeZone!=='Asia/Hong_Kong')return pendingText;
  const [year,month,day]=next.date.split('-').map(Number);
  // Recompute the weekday in Hong Kong instead of trusting a cached label.
  const weekday=new Intl.DateTimeFormat('zh-CN',{timeZone:'Asia/Hong_Kong',weekday:'long'}).format(new Date(next.date+'T12:00:00+08:00'));
  // Fixed display time requested by the site owner; the date still comes from HKJC.
  const time='21点30分';
  return '下期开奖时间：'+year+'年'+month+'月'+day+'日 '+time+'，'+weekday;
 }
 const api={parse,pending,text};if(typeof module==='object')module.exports=api;else root.MarkSixSchedule=api;
})(globalThis);
