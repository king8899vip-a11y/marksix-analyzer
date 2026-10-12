(()=>{
 const token=window.APP_CONFIG?.CLOUDFLARE_ANALYTICS_TOKEN;
 if(!/^[a-f0-9]{32}$/i.test(token||'')||document.querySelector('[data-cf-beacon]'))return;
 const details=document.createElement('details');details.className='fineprint';const summary=document.createElement('summary');summary.textContent='访问统计与隐私';const note=document.createElement('p');note.textContent='本站使用 Cloudflare Web Analytics 统计页面访问与来源，不使用统计 Cookie，不记录生成的号码。搜索页不加载统计脚本。';details.append(summary,note);document.querySelector('main')?.append(details);
 // Do not measure search-page visits or local development.
 if(location.pathname.includes('/search/')||['localhost','127.0.0.1'].includes(location.hostname))return;
 const script=document.createElement('script');script.type='module';script.src='https://static.cloudflareinsights.com/beacon.min.js';script.setAttribute('data-cf-beacon',JSON.stringify({token,spa:false}));script.onerror=()=>{script.dataset.loadStatus='unavailable'};document.head.append(script);
})();
