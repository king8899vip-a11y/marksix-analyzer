let snapshot=null,historyCache=null;
const Z={马:[1,13,25,37,49],蛇:[2,14,26,38],龙:[3,15,27,39],兔:[4,16,28,40],虎:[5,17,29,41],牛:[6,18,30,42],鼠:[7,19,31,43],猪:[8,20,32,44],狗:[9,21,33,45],鸡:[10,22,34,46],猴:[11,23,35,47],羊:[12,24,36,48]};
function colorFor(n){const r=[1,2,7,8,12,13,18,19,23,24,29,30,34,35,40,45,46],b=[3,4,9,10,14,15,20,25,26,31,36,37,41,42,47,48];return r.includes(n)?'red':b.includes(n)?'blue':'green'}
function ball(n,s=false){const d=document.createElement('div');d.className=`ball ${colorFor(n)}`;d.textContent=String(n).padStart(2,'0');if(s)d.title='特别号';return d}
function setText(s,v){const e=document.querySelector(s);if(e)e.textContent=v}
function payout(name){return name==='马'?.8:1.08}
function roi(h,n,name){const o=payout(name);return((h*o-(n-h))/n)*100}
function hit(draw,nums){return nums.some(x=>[...draw.main,draw.special].includes(x))}
function zodiacStats(draws){
 const n=draws.length;
 return Object.entries(Z).map(([name,nums])=>{
  const hits=draws.filter(d=>hit(d,nums)).length;
  const recent=draws.slice(-10).filter(d=>hit(d,nums)).length;
  const hitRate=hits/n*100,R=roi(hits,n,name);
  const score=hitRate*.4+Math.max(0,Math.min(100,50+R*2))*.25+recent*10*.1+Math.max(0,100-Math.abs(recent*10-hitRate)*2)*.05;
  return{name,nums,hits,hitRate,R,recent,score}
 }).sort((a,b)=>b.score-a.score)
}
function recalc(history){
 const draws=history.draws.filter(d=>d.issue>='26/047'&&d.issue<='26/999').sort((a,b)=>a.issue.localeCompare(b.issue)),n=draws.length;
 if(!n)return snapshot;
 const counts=Object.fromEntries(Array.from({length:49},(_,i)=>[i+1,0]));draws.forEach(d=>d.main.forEach(x=>counts[x]++));
 const zs=zodiacStats(draws);
 const nr=Object.entries(counts).map(([k,v])=>({n:+k,v,label:Object.keys(Z).find(z=>Z[z].includes(+k))})).sort((a,b)=>b.v-a.v).slice(0,10),latest=draws.at(-1);
 return{...snapshot,checkedAt:history.checkedAt||new Date().toISOString(),latest,sampleCount:n,hotNumber:nr[0].n,hotZodiac:zs[0].name,numberRanking:nr.map((x,i)=>({n:x.n,label:x.label,score:`${x.v}次 / ${n}期`,note:i?'第五代累计':'当前正选频率最高'})),zodiacRanking:zs.map(x=>({name:x.name,nums:x.nums.map(v=>String(v).padStart(2,'0')).join(' · '),note:`命中 ${x.hits}/${n} (${x.hitRate.toFixed(1)}%) · 近10期 ${x.recent}/10 · ROI ${x.R>=0?'+':''}${x.R.toFixed(1)}%`,trend:`评分 ${x.score.toFixed(1)}`})),specialPool:nr.slice(0,6).map(x=>x.n)}
}
function walkForwardBacktest(history,minTrain=15){
 const draws=history.draws.filter(d=>d.issue>='26/047'&&d.issue<='26/999').sort((a,b)=>a.issue.localeCompare(b.issue));
 const rows=[];
 for(let i=minTrain;i<draws.length;i++){
  const train=draws.slice(0,i),target=draws[i],rank=zodiacStats(train),pick=rank[0];
  const won=hit(target,pick.nums),profit=won?payout(pick.name):-1;
  rows.push({issue:target.issue,date:target.date,pick:pick.name,won,profit,score:pick.score});
 }
 const total=rows.length,wins=rows.filter(x=>x.won).length,profit=rows.reduce((a,b)=>a+b.profit,0),roiPct=total?profit/total*100:0;
 let cur=0,maxLose=0;rows.forEach(r=>{if(r.won)cur=0;else{cur++;maxLose=Math.max(maxLose,cur)}});
 const last20=rows.slice(-20),lastWins=last20.filter(x=>x.won).length,lastProfit=last20.reduce((a,b)=>a+b.profit,0),lastRoi=last20.length?lastProfit/last20.length*100:0;
 const byPick={};rows.forEach(r=>byPick[r.pick]=(byPick[r.pick]||0)+1);
 return{rows,total,wins,hitRate:total?wins/total*100:0,roiPct,maxLose,last20:last20.length,lastWins,lastHitRate:last20.length?lastWins/last20.length*100:0,lastRoi,byPick}
}
async function loadHistory(){const r=await fetch('./data/history.json?t='+Date.now(),{cache:'no-store'});if(!r.ok)throw Error('history');return r.json()}
function renderLatest(){setText('#sampleCount',snapshot.sampleCount);setText('#hotNumber',String(snapshot.hotNumber).padStart(2,'0'));setText('#hotZodiac',snapshot.hotZodiac);setText('#latestMeta',`${snapshot.latest.date} · ${snapshot.latest.issue}`);const w=document.querySelector('#latestBalls');w.innerHTML='';snapshot.latest.main.forEach(n=>w.appendChild(ball(n)));const sp=document.querySelector('#specialBall');sp.innerHTML='';sp.appendChild(ball(snapshot.latest.special,true))}
function renderRankings(){const nr=document.querySelector('#numberRanking');nr.innerHTML='';snapshot.numberRanking.forEach((x,i)=>nr.insertAdjacentHTML('beforeend',`<div class="rank-row"><div class="rank-no">${i+1}</div><div class="rank-main"><b>${String(x.n).padStart(2,'0')} · ${x.label}</b><small>${x.note}</small></div><div class="rank-value">${x.score}</div></div>`));const zr=document.querySelector('#zodiacRanking');zr.innerHTML='';snapshot.zodiacRanking.forEach((x,i)=>zr.insertAdjacentHTML('beforeend',`<div class="rank-row"><div class="rank-no">${i+1}</div><div class="rank-main"><b>${x.name} · ${x.nums}</b><small>${x.note}</small></div><div class="rank-value">${x.trend}</div></div>`));const sp=document.querySelector('#specialPool');sp.innerHTML='';snapshot.specialPool.forEach(n=>sp.insertAdjacentHTML('beforeend',`<span class="chip">${String(n).padStart(2,'0')}</span>`))}
function renderBacktest(h){
 const bt=walkForwardBacktest(h);
 let card=document.querySelector('#backtestCard');
 if(!card){card=document.createElement('div');card.id='backtestCard';card.className='card explanation';document.querySelector('.latest-card').after(card)}
 const edge=bt.roiPct>0&&bt.lastRoi>0;
 card.innerHTML=`<h3>滚动样本外回测</h3>
 <p class="fineprint">每一期只使用当时之前的数据选“第一名生肖”，再检查下一期是否命中，避免偷看未来。</p>
 <div class="metric-grid">
  <div class="metric card"><span>累计命中</span><strong>${bt.wins}/${bt.total}</strong></div>
  <div class="metric card"><span>累计命中率</span><strong>${bt.hitRate.toFixed(1)}%</strong></div>
  <div class="metric card"><span>累计ROI</span><strong>${bt.roiPct>=0?'+':''}${bt.roiPct.toFixed(1)}%</strong></div>
  <div class="metric card"><span>最大连输</span><strong>${bt.maxLose}期</strong></div>
 </div>
 <p><b>最近${bt.last20}期：</b>${bt.lastWins}/${bt.last20} 命中（${bt.lastHitRate.toFixed(1)}%），ROI ${bt.lastRoi>=0?'+':''}${bt.lastRoi.toFixed(1)}%。</p>
 <p class="notice">${edge?'回测目前为正，但仍不足以证明下一期有可重复优势。':'目前没有稳定样本外优势，不应把历史第一名当成高概率预测。'}</p>`;
}
function renderHistory(h){let p=document.querySelector('#historyPanel');if(!p){p=document.createElement('details');p.id='historyPanel';p.className='card explanation';document.querySelector('#home').append(p)}p.innerHTML='<summary>历史开奖记录</summary>';const years=[...new Set(h.draws.map(d=>d.date.slice(0,4)))];const label=document.createElement('label');label.textContent='选择年份： ';const sel=document.createElement('select');years.forEach(y=>{const o=document.createElement('option');o.value=y;o.textContent=y+'年';sel.append(o)});label.append(sel);p.append(label);const rows=document.createElement('div');p.append(rows);function draw(){rows.innerHTML='';const ds=h.draws.filter(d=>d.date.startsWith(sel.value));const c=document.createElement('p');c.className='fineprint';c.textContent=`共 ${ds.length} 期 · 由新到旧`;rows.append(c);ds.forEach(d=>{const r=document.createElement('p');r.textContent=`${d.date} · ${d.issue}：${d.main.map(n=>String(n).padStart(2,'0')).join(' ')} ｜ 特别号 ${String(d.special).padStart(2,'0')}`;rows.append(r)})}sel.addEventListener('change',draw);draw()}
let pickMode='random';
function sampleUnique(pool,count,weights=null){const items=[...pool],out=[];for(let k=0;k<count;k++){let idx;if(weights){const w=items.map(n=>weights[n]||1),sum=w.reduce((a,b)=>a+b,0);let r=Math.random()*sum;idx=0;for(;idx<w.length;idx++){r-=w[idx];if(r<=0)break}if(idx>=items.length)idx=items.length-1}else idx=Math.floor(Math.random()*items.length);out.push(items[idx]);items.splice(idx,1)}return out.sort((a,b)=>a-b)}
function generatePick(){const pool=Array.from({length:49},(_,i)=>i+1),weights={};(snapshot?.numberRanking||[]).forEach((x,i)=>weights[x.n]=Math.max(1.2,3.6-i*.3));const main=sampleUnique(pool,6,pickMode==='weighted'?weights:null),remain=pool.filter(n=>!main.includes(n)),special=sampleUnique(remain,1,pickMode==='weighted'?weights:null)[0],w=document.querySelector('#pickResult');w.innerHTML='';main.forEach(n=>w.appendChild(ball(n)));const plus=document.createElement('span');plus.textContent='+';w.appendChild(plus);w.appendChild(ball(special,true))}
function showPage(id){document.querySelectorAll('.page').forEach(p=>p.classList.toggle('active',p.id===id));document.querySelectorAll('.nav-item').forEach(b=>b.classList.toggle('active',b.dataset.target===id));window.scrollTo({top:0,behavior:'smooth'})}
function bindUI(){document.addEventListener('click',e=>{const nav=e.target.closest('[data-target]');if(nav)showPage(nav.dataset.target);if(e.target.closest('.back'))showPage('home')});document.querySelectorAll('.seg').forEach(b=>b.addEventListener('click',()=>{document.querySelectorAll('.seg').forEach(x=>x.classList.remove('active'));b.classList.add('active');pickMode=b.dataset.mode;generatePick()}));document.querySelector('#pickBtn').addEventListener('click',generatePick);document.querySelector('#themeBtn').addEventListener('click',()=>document.body.classList.toggle('dark'))}
function renderStatus(){let s=document.querySelector('#updateStatus');if(!s){s=document.createElement('p');s.id='updateStatus';s.className='notice';document.querySelector('.latest-card').after(s)}s.textContent=`开奖来源：香港赛马会 · 第五代样本 ${snapshot.sampleCount} 期 · 已自动重算号码/生肖/ROI/滚动回测。`}
async function refreshResults(){try{snapshot=await window.MarkSixData.getSnapshot();historyCache=await loadHistory();snapshot=recalc(historyCache);renderLatest();renderRankings();renderBacktest(historyCache);renderHistory(historyCache);generatePick();renderStatus()}catch(e){console.error(e)}}
async function boot(){bindUI();await refreshResults();startOfficialSync()}boot();
if('serviceWorker'in navigator)window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}));
function verifiedOfficialDraws(rows){if(!Array.isArray(rows))throw Error('官方数据格式异常');const completed=rows.filter(r=>r.status==='Result').map(r=>{const main=r.drawResult?.drawnNo,special=r.drawResult?.xDrawnNo;if(!/^\d{4}$/.test(String(r.year))||!Number.isInteger(r.no)||r.no<1||r.no>999||!Array.isArray(main)||main.length!==6||![...main,special].every(n=>Number.isInteger(n)&&n>=1&&n<=49)||new Set([...main,special]).size!==7)throw Error('官方号码未完整确认');const date=String(r.drawDate).slice(0,10);if(!/^\d{4}-\d{2}-\d{2}$/.test(date))throw Error('开奖日期异常');return{issue:String(r.year).slice(-2)+'/'+String(r.no).padStart(3,'0'),date,main:[...main].sort((a,b)=>a-b),special}});if(!completed.length)throw Error('暂未取得已确认结果');return completed.sort((a,b)=>b.date.localeCompare(a.date)||b.issue.localeCompare(a.issue))}
function startOfficialSync(){const card=document.createElement('div');card.className='card explanation';const title=document.createElement('h3');title.textContent='官方结果同步';const status=document.createElement('p');status.setAttribute('role','status');status.textContent='正在核对香港赛马会结果…';const note=document.createElement('p');note.className='fineprint';note.textContent='网页可见时每30秒检查；官方发布完整结果后更新。号码按大小排列，不代表出球顺序。';const button=document.createElement('button');button.className='primary';button.textContent='立即核对';card.append(title,status,note,button);document.querySelector('.latest-card').after(card);let busy=false,timer=null,lastChecked=null;
const request={variables:{lastNDraw:100},query:'query marksixResult($lastNDraw: Int){lotteryDraws(lastNDraw:$lastNDraw){year no drawDate status drawResult{drawnNo xDrawnNo}}}'};
async function check(){if(busy||document.hidden)return;clearTimeout(timer);busy=true;button.disabled=true;try{const controller=new AbortController();const timeout=setTimeout(()=>controller.abort(),12000);let response;try{response=await fetch('https://info.cld.hkjc.com/graphql/base/',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(request),signal:controller.signal})}finally{clearTimeout(timeout)}if(!response.ok)throw Error('官方连接暂不可用');const body=await response.json();if(body.errors)throw Error('官方服务暂不可用');const draws=verifiedOfficialDraws(body.data?.lotteryDraws),latest=draws[0];const changed=JSON.stringify(snapshot?.latest)!==JSON.stringify(latest);if(snapshot&&changed){snapshot.latest=latest;if(historyCache?.draws){const merged=new Map(historyCache.draws.map(d=>[d.issue,d]));draws.forEach(d=>merged.set(d.issue,d));historyCache={...historyCache,draws:[...merged.values()].sort((a,b)=>b.date.localeCompare(a.date)||b.issue.localeCompare(a.issue)),checkedAt:new Date().toISOString()};snapshot=recalc(historyCache);renderRankings();renderBacktest(historyCache);renderHistory(historyCache)}renderLatest();renderStatus()}lastChecked=new Date().toLocaleString('zh-CN',{timeZone:'Asia/Hong_Kong',hour12:false});status.textContent='已连接官方 · 最新确认 '+latest.issue+'期 · 核对时间 '+lastChecked+'（香港时间）'}catch(e){status.textContent='暂时无法核对官方结果，保留原显示数据。'+(lastChecked?'上次成功核对：'+lastChecked+'。':'')+'30秒后重试。'}finally{busy=false;button.disabled=false;if(!document.hidden)timer=setTimeout(check,30000)}}
button.addEventListener('click',check);document.addEventListener('visibilitychange',()=>{clearTimeout(timer);if(!document.hidden)check()});check()}
