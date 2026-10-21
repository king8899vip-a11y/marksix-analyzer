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
  const today=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Hong_Kong',year:'numeric',month:'2-digit',day:'2-digit'}).format(now);
  if(!next||next.basedOnIssue!==latest?.issue||!validDate(next.date||'')||next.issue<=latest.issue||next.date<today)return '下期期号、开奖日期、星期及开奖时间：待官方公布';
  return '下期 '+next.issue+' · '+next.date+' '+next.weekday+' · 开奖时间：'+(next.status==='confirmed'&&/^([01]\d|2[0-3]):[0-5]\d$/.test(next.time||'')?next.time:'待官方公布')+'（香港时间）';
 }
 const api={parse,pending,text};if(typeof module==='object')module.exports=api;else root.MarkSixSchedule=api;
})(globalThis);
