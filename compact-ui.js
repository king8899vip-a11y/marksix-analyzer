/* Compact layout: keep results and next-draw predictions visible; fold optional detail. */
(()=>{
 const style=document.createElement('style');
 style.textContent=`
 .compact-fold{margin:12px 0;border:1px solid rgba(128,128,128,.22);border-radius:13px;background:var(--card,#fff);color:var(--text,#162033);overflow:hidden}
 .compact-fold>summary{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:15px 16px;cursor:pointer;font-weight:650;list-style:none;color:var(--text,#162033)}
 .compact-fold>summary::-webkit-details-marker{display:none}
 .compact-fold>summary::after{content:'⌄';font-size:20px;line-height:1;opacity:.65;transition:transform .15s}
 .compact-fold[open]>summary::after{transform:rotate(180deg)}
 .compact-fold>.compact-body{padding:0 12px 14px}
 .compact-fold .section-head{margin-top:0}
 .compact-fold .number-hub,.compact-fold .zodiac-hub,.compact-fold .traffic-grid{margin-top:4px}
 .compact-fold .forecast-card{margin-top:0}
 .recent-draws-host{display:block;width:100%;margin-bottom:12px}
 .recent-draws-panel{grid-column:1/-1;border:1px solid var(--line,#e6ebf2);border-radius:12px;background:var(--card,#fff);overflow:hidden;color:var(--text,#162033)}
 .recent-draws-panel>summary{padding:13px 12px;cursor:pointer;list-style:none;display:flex;justify-content:space-between;align-items:center;gap:8px;font-weight:700}
 .recent-draws-panel>summary::-webkit-details-marker{display:none}
 .recent-draws-panel>summary::after{content:'⌄';font-size:20px;opacity:.7}
 .recent-draws-panel[open]>summary::after{content:'⌃'}
 .recent-draws-panel>summary small{font-size:11px;font-weight:400;color:var(--muted,#718096)}
 .recent-draw-list{padding:0 8px 8px;display:grid;gap:6px}
 .recent-draw-item{display:block;text-decoration:none;color:var(--text,#162033);border:1px solid var(--line,#e6ebf2);border-radius:10px;padding:10px;background:var(--card,#fff)}
 .recent-draw-meta{display:flex;justify-content:space-between;gap:8px;align-items:center;font-size:12px}
 .recent-draw-meta time{color:var(--muted,#718096)}
 .recent-draw-balls{display:flex;flex-wrap:wrap;gap:5px;margin-top:9px;align-items:center}
 .recent-draw-balls span,.recent-draw-balls strong{display:grid;place-items:center;width:30px;height:30px;border-radius:50%;background:var(--bg,#f4f7fb);border:1px solid var(--line,#e6ebf2);color:var(--text,#162033);font-size:12px;font-weight:700}
 .recent-draw-balls strong{background:#b91c1c;border-color:#b91c1c;color:#fff}
 @media(max-width:380px){.recent-draw-balls span,.recent-draw-balls strong{width:27px;height:27px;font-size:11px}}

 .compact-fold:focus-within{outline-offset:2px}
 @media(max-width:480px){.compact-fold>summary{padding:13px 14px}.compact-fold>.compact-body{padding:0 10px 12px}}
 `;
 document.head.append(style);
 function fold(content,title,id,heading=null){
  if(!content||document.getElementById(id))return;
  const parent=heading?.parentNode||content.parentNode;
  if(!parent)return;
  const d=document.createElement('details');d.className='compact-fold';d.id=id;
  const summary=document.createElement('summary');summary.textContent=title;
  const body=document.createElement('div');body.className='compact-body';
  parent.insertBefore(d,heading||content);d.append(summary,body);
  if(heading)body.append(heading);
  body.append(content);
 }
 function apply(){
  const numbers=document.getElementById('numberHub'),zodiac=document.getElementById('zodiacHub');
  if(numbers)fold(numbers,'49个号码数据库 · 点击展开','fold-number-directory',numbers.previousElementSibling?.classList.contains('section-head')?numbers.previousElementSibling:null);
  if(zodiac)fold(zodiac,'12生肖数据库 · 点击展开','fold-zodiac-directory',zodiac.previousElementSibling?.classList.contains('section-head')?zodiac.previousElementSibling:null);
  const machine=document.getElementById('machine');
  const note=machine?.querySelector('.page-title + .explanation');
  if(note)fold(note,'换机对比说明','fold-machine-explanation');
  for(const [id,title] of [['backtestCard','生肖历史回测数据'],['modelSummary','模型评分与验证说明'],['specialValidation','特别号历史滚动回测']]){
   const el=document.getElementById(id);if(el)fold(el,title,'fold-'+id);
  }
  const dash=document.getElementById('specialPredictionDashboard');
  if(dash&&!document.getElementById('fold-special-history')){
   const heading=[...dash.querySelectorAll(':scope > .section-head')].find(x=>x.textContent.includes('上一期预测验证'));
   const stat=[...dash.querySelectorAll(':scope > .forecast-card')].find(x=>x.textContent.includes('最近20期已存档预测验证'));
   // Keep last draw verification and its red hit visible. Only fold detailed performance.
   if(stat)fold(stat,'最近20期预测命中统计 · 点击展开','fold-special-history');
  }
 }
 apply();
 let queued=false;
 const observer=new MutationObserver(()=>{
  if(queued)return;queued=true;
  queueMicrotask(()=>{queued=false;apply()});
 });
 observer.observe(document.querySelector('main')||document.body,{subtree:true,childList:true});
})();
