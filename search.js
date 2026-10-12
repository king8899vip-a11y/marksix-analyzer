(async()=>{
 const input=document.getElementById('searchQuery'),status=document.getElementById('searchStatus'),list=document.getElementById('searchResults');
 const q=(new URLSearchParams(location.search).get('q')||'').trim().slice(0,40);input.value=q;if(!q)return;
 const base=new URL('./',document.currentScript.src).pathname;
 const add=(path,title,note)=>{const li=document.createElement('li'),a=document.createElement('a'),b=document.createElement('b'),small=document.createElement('small');a.className='card catalog-item';a.href=base+path;b.textContent=title;small.textContent=note;a.append(b,small);li.append(a);list.append(li)};
 const number=q.match(/^(?:号码\s*)?(\d{1,2})\s*(?:号)?$/);if(number&&+number[1]>=1&&+number[1]<=49){const n=String(+number[1]).padStart(2,'0');add('number/'+n+'/',n+' 号资料','正选与特别号历史次数')}
 const names={horse:'马',snake:'蛇',dragon:'龙',rabbit:'兔',tiger:'虎',ox:'牛',mouse:'鼠',pig:'猪',dog:'狗',rooster:'鸡',monkey:'猴',goat:'羊'};
 for(const [slug,name] of Object.entries(names))if(q.includes(name)||q.toLowerCase()===slug)add('zodiac/'+slug+'/',name+' 生肖资料','2026 年号码对照与第五代样本统计');
 if(q.includes('特别'))add('special/','特别号统计','独立历史次数');if(q.includes('机器')||q.includes('第五代'))add('machine/5th-gen/','第五代搅珠机专题','独立样本说明');
 if(q==='号码')add('number/','号码资料目录','01–49 号码');if(q==='生肖')add('zodiac/','生肖资料目录','12 生肖');if(q.includes('开奖'))add('draw/','开奖记录目录','最新结果与历年记录');status.textContent='正在检索开奖记录…';
 try{const response=await fetch(base+'data/history.json',{cache:'no-store'});if(!response.ok)throw Error('data');const h=await response.json();const term=q.replace(/期$/,'').replace(/-/g,'/');const rows=number?[]:h.draws.filter(d=>d.issue===term||d.issue.includes(q)||d.date.includes(q)||d.date.slice(0,4)===q);const years=new Set();
 if(/^\d{4}$/.test(q)&&rows.length){add('archive/'+q+'/',q+' 年开奖记录',rows.length+' 期');years.add(q)}
 for(const d of rows.slice(0,60)){const fifth=d.issue>='26/047'&&d.issue<='26/999';add(fifth?'draw/'+d.issue.replace('/','-')+'/':'archive/'+d.date.slice(0,4)+'/#draw-'+d.issue.replace('/','-'),d.issue+' 期开奖结果',d.date+' · 特别号 '+String(d.special).padStart(2,'0'))}
 status.textContent=list.children.length?'找到 '+list.children.length+' 个资料入口'+(rows.length>60?'；开奖匹配 '+rows.length+' 期，显示前 60 期，可进入年份页查看更多。':'。'):'没有找到匹配资料，请试试号码 07、生肖 鼠、期号 26/108 或年份 2026。';
 }catch{status.textContent=list.children.length?'已找到分类资料；开奖记录暂时无法读取，可从开奖记录目录按年份浏览。':'开奖记录暂时无法读取，请从下方分类入口浏览。'}
})().catch(()=>{document.getElementById('searchStatus').textContent='搜索暂不可用，请从下方分类入口浏览。'});
