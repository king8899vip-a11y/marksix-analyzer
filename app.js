let snapshot = null;

function colorFor(n){
  const red=[1,2,7,8,12,13,18,19,23,24,29,30,34,35,40,45,46];
  const blue=[3,4,9,10,14,15,20,25,26,31,36,37,41,42,47,48];
  return red.includes(n)?'red':blue.includes(n)?'blue':'green';
}
function ball(n, special=false){
  const d=document.createElement('div'); d.className=`ball ${colorFor(n)}`;
  d.textContent=String(n).padStart(2,'0'); if(special)d.title='特别号'; return d;
}
function setText(sel,val){ const el=document.querySelector(sel); if(el) el.textContent=val; }
function renderLatest(){
  setText('#sampleCount',snapshot.sampleCount);
  setText('#hotNumber',String(snapshot.hotNumber||7).padStart(2,'0'));
  setText('#hotZodiac',snapshot.hotZodiac||'—');
  setText('#latestMeta',`${snapshot.latest.date} · ${snapshot.latest.issue}`);
  const wrap=document.querySelector('#latestBalls'); wrap.innerHTML=''; snapshot.latest.main.forEach(n=>wrap.appendChild(ball(n)));
  const sp=document.querySelector('#specialBall'); sp.innerHTML=''; sp.appendChild(ball(snapshot.latest.special,true));
}
function renderRankings(){
  const nr=document.querySelector('#numberRanking'); nr.innerHTML='';
  snapshot.numberRanking.forEach((x,i)=>nr.insertAdjacentHTML('beforeend',`<div class="rank-row"><div class="rank-no">${i+1}</div><div class="rank-main"><b>${String(x.n).padStart(2,'0')} · ${x.label}</b><small>${x.note}</small></div><div class="rank-value">${x.score}</div></div>`));
  const zr=document.querySelector('#zodiacRanking'); zr.innerHTML='';
  snapshot.zodiacRanking.forEach((x,i)=>zr.insertAdjacentHTML('beforeend',`<div class="rank-row"><div class="rank-no">${i+1}</div><div class="rank-main"><b>${x.name} · ${x.nums}</b><small>${x.note}</small></div><div class="rank-value">${x.trend}</div></div>`));
  const sp=document.querySelector('#specialPool'); sp.innerHTML=''; snapshot.specialPool.forEach(n=>sp.insertAdjacentHTML('beforeend',`<span class="chip">${String(n).padStart(2,'0')}</span>`));
}
let pickMode='random';
function sampleUnique(pool,count,weights=null){
  const items=[...pool], out=[];
  for(let k=0;k<count;k++){
    let idx;
    if(weights){
      const w=items.map(n=>weights[n]||1), sum=w.reduce((a,b)=>a+b,0); let r=Math.random()*sum; idx=0;
      for(;idx<w.length;idx++){r-=w[idx]; if(r<=0)break;}
      if(idx>=items.length) idx=items.length-1;
    } else idx=Math.floor(Math.random()*items.length);
    out.push(items[idx]); items.splice(idx,1);
  }
  return out.sort((a,b)=>a-b);
}
function generatePick(){
  const pool=Array.from({length:49},(_,i)=>i+1);
  const weights={};
  (snapshot?.numberRanking||[]).forEach((x,i)=>weights[x.n]=Math.max(1.2,3.6-i*.45));
  (snapshot?.specialPool||[]).forEach(n=>weights[n]=Math.max(weights[n]||1,1.5));
  const main=sampleUnique(pool,6,pickMode==='weighted'?weights:null);
  const remain=pool.filter(n=>!main.includes(n));
  const special=sampleUnique(remain,1,pickMode==='weighted'?weights:null)[0];
  const wrap=document.querySelector('#pickResult'); wrap.innerHTML=''; main.forEach(n=>wrap.appendChild(ball(n)));
  const plus=document.createElement('span'); plus.textContent='+'; plus.style.alignSelf='center'; plus.style.color='var(--muted)'; wrap.appendChild(plus); wrap.appendChild(ball(special,true));
}
function showPage(id){
  document.querySelectorAll('.page').forEach(p=>p.classList.toggle('active',p.id===id));
  document.querySelectorAll('.nav-item').forEach(b=>b.classList.toggle('active',b.dataset.target===id));
  window.scrollTo({top:0,behavior:'smooth'});
}
function bindUI(){
  document.addEventListener('click',e=>{
    const nav=e.target.closest('[data-target]'); if(nav) showPage(nav.dataset.target);
    if(e.target.closest('.back')) showPage('home');
  });
  document.querySelectorAll('.seg').forEach(b=>b.addEventListener('click',()=>{
    document.querySelectorAll('.seg').forEach(x=>x.classList.remove('active')); b.classList.add('active'); pickMode=b.dataset.mode; generatePick();
  }));
  document.querySelector('#pickBtn').addEventListener('click',generatePick);
  document.querySelector('#themeBtn').addEventListener('click',()=>document.body.classList.toggle('dark'));
}
async function boot(){
  bindUI();
  try{
    snapshot = await window.MarkSixData.getSnapshot();
  }catch(err){
    console.error(err);
    document.querySelector('.subtitle').textContent='数据暂时无法读取 · 请稍后刷新';
    return;
  }
  renderLatest(); renderRankings(); generatePick();
  await renderUpdateStatus();
  setInterval(refreshResults, 30*60*1000);
}
async function renderUpdateStatus(){
  let status=document.querySelector('#updateStatus');
  if(!status){status=document.createElement('p');status.id='updateStatus';status.className='notice';document.querySelector('.latest-card').after(status);}
  status.textContent=snapshot.checkedAt ? `开奖来源：香港赛马会 · 最近核对：${new Date(snapshot.checkedAt).toLocaleString('zh-CN',{timeZone:'Asia/Hong_Kong'})}（香港时间）。约每30分钟检查；排程可能延迟。` : '正在等待官方数据同步';
  let warning=document.querySelector('#statisticsNotice');
  if(!warning){warning=document.createElement('p');warning.id='statisticsNotice';warning.className='notice';document.querySelector('main').prepend(warning);}
  warning.textContent='开奖记录自动更新；号码、生肖、机器分析仍为原示例快照（2026-09-05），尚未按新开奖重新计算。';
  try{
    const res=await fetch('./data/history.json?t='+Date.now(),{cache:'no-store'});if(!res.ok)throw new Error('History unavailable');const history=await res.json();
    let panel=document.querySelector('#historyPanel');if(!panel){panel=document.createElement('details');panel.id='historyPanel';panel.className='card explanation';document.querySelector('#home').append(panel);}
    panel.replaceChildren();const summary=document.createElement('summary');summary.textContent=`官方开奖记录（已保存 ${history.draws.length} 期）`;panel.append(summary);
    history.draws.forEach(d=>{const row=document.createElement('p');row.textContent=`${d.date} · ${d.issue}：${d.main.map(n=>String(n).padStart(2,'0')).join(' ')} ｜ 特别号 ${String(d.special).padStart(2,'0')}`;panel.append(row);});
  }catch(e){status.textContent+=' 历史记录暂时无法读取，请稍后刷新。';}
}
async function refreshResults(){try{snapshot=await window.MarkSixData.getSnapshot();renderLatest();await renderUpdateStatus();}catch(e){const status=document.querySelector('#updateStatus');if(status)status.textContent='更新读取失败，当前保留上次数据。请检查网络后刷新。';}}
boot();
if('serviceWorker' in navigator){window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}));}
