(()=>{const base=new URL('.',document.currentScript.src);const script=document.createElement('script');script.src=new URL('language-toggle.js?v=2',base).href;script.defer=true;document.head.append(script)})();
(()=>{
 const token=window.APP_CONFIG?.CLOUDFLARE_ANALYTICS_TOKEN;
 if(!/^[a-f0-9]{32}$/i.test(token||'')||document.querySelector('[data-cf-beacon]'))return;
 const details=document.createElement('details');details.className='fineprint';const summary=document.createElement('summary');summary.textContent='访问统计与隐私';const note=document.createElement('p');note.textContent='本站统计页面浏览、来源与独立 IP 数。IP 只以带密钥的摘要保存，用于去重，最多保留 30 天；不保存完整 IP，不使用统计 Cookie，不记录生成的号码或搜索内容。统计结果仅由站长在私有后台查看。搜索页不加载统计脚本。';details.append(summary,note);document.querySelector('main')?.append(details);
 // Do not measure search-page visits or local development.
 if(location.pathname.includes('/search/')||['localhost','127.0.0.1'].includes(location.hostname))return;
 const script=document.createElement('script');script.type='module';script.src='https://static.cloudflareinsights.com/beacon.min.js';script.setAttribute('data-cf-beacon',JSON.stringify({token,spa:false}));script.onerror=()=>{script.dataset.loadStatus='unavailable'};document.head.append(script);
})();

(() => {
 if(window.__marksixIpReported)return;
 if(!['yjyq.com','www.yjyq.com','king8899vip-a11y.github.io'].includes(location.hostname))return;
 if(location.pathname.includes('/search/')||navigator.globalPrivacyControl||navigator.doNotTrack==='1')return;
 window.__marksixIpReported=true;
 let referrer='';
 try{referrer=new URL(document.referrer).origin;}catch{}
 const id=crypto.randomUUID();
 fetch('https://marksix-traffic.king8899vip.workers.dev/collect',{
  method:'POST',body:JSON.stringify({site:'marksix',id,referrer}),
  headers:{'Content-Type':'text/plain'},credentials:'omit',keepalive:true
 }).catch(()=>{});
})();
