/* Configure GA4_MEASUREMENT_ID in config.js before enabling analytics. */
(()=>{
  const id=window.APP_CONFIG?.GA4_MEASUREMENT_ID;
  if(!/^G-[A-Z0-9]+$/.test(id||''))return;
  const key='marksix-analytics-consent';
  let enabled=false;
  const preference=()=>{try{return localStorage.getItem(key);}catch{return null;}};
  function start(){
    if(enabled)return;enabled=true;
    window.dataLayer=window.dataLayer||[];
    window.gtag=function(){window.dataLayer.push(arguments);};
    gtag('consent','default',{analytics_storage:'granted',ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied'});
    gtag('js',new Date());
    let referrer='';try{referrer=new URL(document.referrer).origin;}catch{}
    gtag('config',id,{send_page_view:true,page_location:location.origin+location.pathname,page_referrer:referrer,allow_google_signals:false,allow_ad_personalization_signals:false});
    const script=document.createElement('script');script.async=true;script.src='https://www.googletagmanager.com/gtag/js?id='+id;document.head.append(script);
  }
  function track(name,params={}){if(enabled)gtag('event',name,params);}
  const box=document.createElement('aside');box.className='notice';box.setAttribute('aria-label','访问统计设置');
  const copy=document.createElement('p');copy.textContent='允许使用 Google Analytics 统计访问量、来源和功能使用情况吗？同意后会使用统计 Cookie，并向 Google 发送设备和访问数据。不记录生成的号码。';box.append(copy);
  for(const [text,value] of [['允许统计','yes'],['不允许','no']]){const button=document.createElement('button');button.textContent=text;button.type='button';button.style.marginRight='12px';button.onclick=()=>{try{localStorage.setItem(key,value);}catch{}box.hidden=true;if(value==='yes')start();else if(enabled){window['ga-disable-'+id]=true;enabled=false;gtag('consent','update',{analytics_storage:'denied'});location.reload();}};box.append(button);}
  const settings=document.createElement('button');settings.textContent='隐私与访问统计设置';settings.type='button';settings.onclick=()=>{box.hidden=false;box.scrollIntoView({block:'center'});};
  document.querySelector('main').append(settings,box);
  box.hidden=preference()!==null;if(preference()==='yes')start();
  document.addEventListener('click',e=>{
    const nav=e.target.closest('[data-target]');if(nav)track('feature_view',{feature:nav.dataset.target});
    if(e.target.closest('#pickBtn'))track('generate_pick');
    const mode=e.target.closest('[data-mode]');if(mode)track('pick_mode_change',{mode:mode.dataset.mode});
    if(e.target.closest('#themeBtn'))track('theme_change');
  });
  document.addEventListener('toggle',e=>{if(e.target.id==='historyPanel'&&e.target.open)track('history_open');},true);
  document.addEventListener('change',e=>{if(e.target.getAttribute('aria-label')==='开奖记录年份')track('history_year_select',{year:e.target.value});});
})();

