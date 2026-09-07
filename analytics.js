/* Cookieless analytics; waits for the owner's Cloudflare site token. */
(()=>{
  window['ga-disable-G-HDWHHR5079']=true;
  try { localStorage.removeItem('marksix-analytics-consent'); } catch {}
  for(const item of document.cookie.split(';')){
    const name=item.trim().split('=')[0];
    if(!/^_ga(?:_|$)/.test(name))continue;
    for(const path of ['/', '/marksix-analyzer', '/marksix-analyzer/'])
      for(const domain of ['', '; domain='+location.hostname, '; domain=.'+location.hostname])
        document.cookie=name+'=; Max-Age=0; path='+path+domain+'; SameSite=Lax';
  }
  const token=window.APP_CONFIG?.CLOUDFLARE_ANALYTICS_TOKEN;
  const details=document.createElement('details');details.className='fineprint';
  const title=document.createElement('summary');title.textContent='隐私说明';details.append(title);
  const note=document.createElement('p');
  note.textContent=token?'本站使用 Cloudflare Web Analytics 统计页面访问、来源、设备及大致地区，不使用统计 Cookie 或浏览器存储来识别访客，不记录生成的号码。':'本站已停用 Google Analytics，目前基础访问统计尚未启用。';
  details.append(note);document.querySelector('main').append(details);
  if(!/^[a-f0-9]{32}$/i.test(token||''))return;
  const script=document.createElement('script');script.defer=true;
  script.src='https://static.cloudflareinsights.com/beacon.min.js';
  script.setAttribute('data-cf-beacon',JSON.stringify({token,spa:false}));
  document.head.append(script);
})();
