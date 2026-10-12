import {readFile,writeFile} from 'node:fs/promises';
const base='/marksix-analyzer/';
const names={horse:'马',snake:'蛇',dragon:'龙',rabbit:'兔',tiger:'虎',ox:'牛',mouse:'鼠',pig:'猪',dog:'狗',rooster:'鸡',monkey:'猴',goat:'羊'};
const item=(href,title,note='')=>`<a class="card catalog-item" href="${base}${href}"><b>${title}</b><small>${note}</small></a>`;
const hero=(title,description)=>`<section class="hero card"><div class="hero-kicker">资料导航</div><h1>${title}</h1><p>${description}</p></section>`;
export async function generatePortal(h,put,shell){
 const draws=[...h.draws].sort((a,b)=>b.date.localeCompare(a.date)||b.issue.localeCompare(a.issue));
 const years=[...new Set(draws.map(d=>d.date.slice(0,4)))];
 const fifth=d=>d.issue>='26/047'&&d.issue<='26/999';
 const href=d=>fifth(d)?`draw/${d.issue.replace('/','-')}/`:`archive/${d.date.slice(0,4)}/#draw-${d.issue.replace('/','-')}`;
 const record=d=>`<article class="archive-row" id="draw-${d.issue.replace('/','-')}"><b>${fifth(d)?`<a href="${base}${href(d)}">${d.issue} 期</a>`:`${d.issue} 期`}</b><time datetime="${d.date}">${d.date}</time><p>正选：${d.main.map(n=>String(n).padStart(2,'0')).join(' · ')}<br>特别号：<b>${String(d.special).padStart(2,'0')}</b></p></article>`;
 await put('draw/index.html',shell('开奖记录导航｜六合彩数据中心','最新开奖结果及历年开奖记录目录。',hero('开奖记录','按期号查看最新记录，按年份浏览完整历史资料。')+`<p class="portal-note">数据来源：香港赛马会。共 ${draws.length.toLocaleString('zh-CN')} 期；最新 ${draws[0].issue}（${draws[0].date}）。</p><h2>历年开奖记录</h2><div class="catalog-grid">${years.map(y=>item(`archive/${y}/`,`${y} 年`,`${draws.filter(d=>d.date.startsWith(y)).length} 期记录`)).join('')}</div><h2>最近 20 期</h2><div class="card">${draws.slice(0,20).map(record).join('')}</div>`));
 for(const y of years){const rows=draws.filter(d=>d.date.startsWith(y));await put(`archive/${y}/index.html`,shell(`${y} 年开奖记录｜六合彩数据中心`,`${y} 年 ${rows.length} 期开奖记录、正选号码及特别号。`,hero(`${y} 年开奖记录`,`${rows.length} 期 · 由新到旧`)+`<p><a href="${base}draw/">查看其他年份</a></p><div class="card">${rows.map(record).join('')}</div>`))}
 const numberItems=Array.from({length:49},(_,i)=>{const n=String(i+1).padStart(2,'0');return item(`number/${n}/`,`${n} 号`,'正选与特别号历史次数')}).join('');
 await put('number/index.html',shell('49 号码资料导航｜六合彩数据中心','01–49 号码独立历史统计和生肖对应资料。',hero('号码资料','选择 01–49 号码，查看其历史记录。')+`<div class="catalog-grid">${numberItems}</div>`));
 const zodiacItems=Object.entries(names).map(([slug,name])=>item(`zodiac/${slug}/`,`${name} 生肖`,'号码对照与历史命中统计')).join('');
 await put('zodiac/index.html',shell('12 生肖资料导航｜六合彩数据中心','12 生肖的号码对照与历史数据目录。',hero('生肖资料','选择生肖，查看号码对照及历史统计。')+`<p class="portal-note">号码对照采用本站 2026 年映射；统计页使用第五代样本，不将该映射套用到全部历史年份。</p><div class="catalog-grid">${zodiacItems}</div>`));
 await put('search/index.html',shell('搜索资料｜六合彩数据中心','按号码、生肖、期号、日期或年份搜索开奖记录与历史资料。',hero('搜索资料','号码、生肖、期号、日期、年份都能查。')+`<form class="portal-search card" action="" method="get" role="search"><label for="searchQuery">输入要找的资料</label><div><input id="searchQuery" name="q" type="search" maxlength="40" placeholder="例如 07、鼠、26/108、2026-10-10" required><button class="primary">查找</button></div></form><p id="searchStatus" role="status">输入关键词开始查找。</p><ul id="searchResults" class="search-results"></ul><noscript><p>搜索需要启用 JavaScript；也可直接浏览下面的分类。</p></noscript><div class="catalog-grid">${item('draw/','开奖记录')}${item('number/','号码资料')}${item('zodiac/','生肖资料')}${item('special/','特别号统计')}</div><script src="${base}search.js?v=3.1.0" defer></script>`));
 // Keep the homepage catalog useful before JavaScript or remote data is available.
 const homeUrl=new URL('../index.html',import.meta.url);let home=await readFile(homeUrl,'utf8');
 home=home.replace(/(<div id="numberHub"[^>]*>)[\s\S]*?(<\/div>)/,'$1'+Array.from({length:49},(_,i)=>{const n=String(i+1).padStart(2,'0');return `<a class="hub-num" href="./number/${n}/">${n}</a>`}).join('')+'$2');
 home=home.replace(/(<div id="zodiacHub"[^>]*>)[\s\S]*?(<\/div>)/,'$1'+Object.entries(names).map(([slug,name])=>`<a class="hub-zodiac" href="./zodiac/${slug}/">${name}</a>`).join('')+'$2');
 home=home.replace(/(<div id="trafficHub"[^>]*>)[\s\S]*?(<\/div>)/,'$1'+item(href(draws[0]),'最新开奖记录',draws[0].issue+' · '+draws[0].date)+item('machine/5th-gen/','第五代统计专题')+'$2');
 await writeFile(homeUrl,home);
 return ['/draw/','/number/','/zodiac/','/search/',...years.map(y=>`/archive/${y}/`)];
}
