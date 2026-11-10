/* Immutable next-draw special-number prediction dashboard. */
(()=>{
 const section=document.getElementById('special');
 if(!section)return;
 const root=document.createElement('div');
 root.id='specialPredictionDashboard';
 const head=section.querySelector('.section-head');
 section.insertBefore(root,head||section.firstChild);
 const css=document.createElement('style');
 css.textContent=`
 #specialPredictionDashboard{margin:12px 0 24px}
 #specialPredictionDashboard .forecast-card{background:var(--card,#fff);color:var(--text,#162033);border:1px solid var(--line,rgba(125,125,125,.22));border-radius:14px;padding:16px;margin:12px 0}
 #specialPredictionDashboard .forecast-pool{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:9px;margin-top:12px}
 #specialPredictionDashboard .forecast-number{color:var(--text,#162033);border-radius:11px;border:1px solid rgba(125,125,125,.23);text-align:center;padding:12px 2px;background:rgba(125,125,125,.07)}
 #specialPredictionDashboard .forecast-number b{display:block;font-size:24px;font-variant-numeric:tabular-nums}
 #specialPredictionDashboard .forecast-number small{display:block;font-size:11px;opacity:.75}
 #specialPredictionDashboard .forecast-number.hit{background:#b91c1c!important;border-color:#991b1b!important;color:#fff!important}
 #specialPredictionDashboard .forecast-meta{font-size:13px;color:var(--muted,#718096);opacity:1;line-height:1.6}
 #specialPredictionDashboard .forecast-history{display:flex;gap:9px;flex-wrap:wrap}
 #specialPredictionDashboard .forecast-history span{border:1px solid rgba(125,125,125,.25);padding:5px 8px;border-radius:8px}
 #specialPredictionDashboard .forecast-error{color:var(--text,#162033);border:1px solid #dc2626;border-radius:9px;padding:12px}
 #specialPredictionDashboard h2,#specialPredictionDashboard h3,#specialPredictionDashboard p{color:inherit}
 #specialPredictionDashboard .forecast-card .forecast-meta{color:var(--muted,#718096)}
 body.dark #specialPredictionDashboard .forecast-number{background:#202b3d;color:#edf3ff;border-color:#36455e}
 body.dark #specialPredictionDashboard .forecast-number.hit{color:#fff!important}
 `;
 document.head.append(css);
 const fmt=n=>String(n).padStart(2,'0');
 const safe=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const numbers=(top,hit)=>top.map((x,i)=>`<div class="forecast-number ${x.number===hit?'hit':''}"><b>${fmt(x.number)}</b><small>Top ${i+1}</small></div>`).join('');
 function render(data){
   const current=data.current, previous=data.previous, stats=data.recent20||{};
   let html='<div class="section-head"><h2>特别号观察池 · 下一期预测</h2></div>';
   if(current){
    html+=`<div class="forecast-card"><h3>第 ${safe(current.targetIssue)} 期 · 开奖前锁定预测</h3><p class="forecast-meta">依据截至 ${safe(current.sourceThroughIssue)} 期历史记录 · 预测锁定时间：${safe(current.generatedAt?.replace('T',' ').slice(0,19))} UTC · 重点观察前6码，完整保留Top10</p><div class="forecast-pool">${numbers(current.top10,null)}</div><p class="forecast-meta">此处为历史数据模型排序，不代表公平开奖的客观命中概率提高。</p></div>`;
   }else{
    html+='<div class="forecast-card forecast-error">下一期预测档案尚未生成或资料不同步。不会以旧版静态号码冒充本期预测。</div>';
   }
   html+='<div class="section-head"><h2>上一期预测验证</h2></div>';
   if(previous){
    const hit=previous.hitRank;
    html+=`<div class="forecast-card"><h3>第 ${safe(previous.targetIssue)} 期 · 实际特别号 ${fmt(previous.actualSpecial)}</h3><p>${hit?'命中 Top '+hit+'（红色标记）':'未命中 Top10'}</p><div class="forecast-pool">${numbers(previous.top10,previous.actualSpecial)}</div><p class="forecast-meta">本期号码沿用开奖前保存的预测档案，未按开奖结果重新排序。</p></div>`;
   }else html+='<p class="forecast-meta">目前尚无可验证的旧期预测档案；不补造历史命中记录。</p>';
   html+='<div class="forecast-card"><h3>最近20期已存档预测验证</h3><div class="forecast-history">';
   for(const k of [1,3,6,10]){let r=stats[k];html+=`<span>Top${k}：${r?.total?`${r.hits}/${r.total} (${r.rate}%)`:'暂无完整记录'}</span>`;}
   html+='</div><p class="forecast-meta">只统计开奖前真实存档的预测，样本少于20期时显示实际样本数。</p></div>';
   root.innerHTML=html;
   const oldPool=document.querySelector('#specialPool'),oldRank=document.querySelector('#specialRanking');
   for(const el of [oldPool,oldRank]){if(el){el.style.display='none';if(el.previousElementSibling?.classList.contains('section-head'))el.previousElementSibling.style.display='none';}}
 }
 async function reload(){
  try{
   const r=await fetch('./data/predictions/summary.json?ts='+Date.now(),{cache:'no-store'});
   if(!r.ok)throw Error('HTTP '+r.status);
   const data=await r.json();
   if(!data||!Array.isArray(data.current?.top10)&&!Array.isArray(data.verifiedHistory))throw Error('预测档案格式错误');
   render(data);
  }catch(e){root.innerHTML='<div class="forecast-card forecast-error">特别号预测档案暂时无法加载：'+safe(e.message)+'。不展示旧版号码，请稍后刷新。</div>';
   const p=document.getElementById('specialPool');if(p)p.style.display='none';
  }
 }
 reload();
 document.addEventListener('visibilitychange',()=>{if(!document.hidden)reload()});
 setInterval(()=>{if(!document.hidden)reload()},5*60*1000);
})();