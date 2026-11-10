/* Shared light/dark theme for main and generated detail pages. */
(()=>{
 const key='marksix-theme';
 let stored=null;
 try{stored=localStorage.getItem(key)}catch{}
 if(stored==='dark'||stored==='light')document.body.classList.toggle('dark',stored==='dark');
 const btn=document.getElementById('themeBtn');
 if(!btn)return;
 btn.setAttribute('aria-pressed',String(document.body.classList.contains('dark')));
 btn.addEventListener('click',()=>{
  const dark=document.body.classList.toggle('dark');
  btn.setAttribute('aria-pressed',String(dark));
  try{localStorage.setItem(key,dark?'dark':'light')}catch{}
 });
})();
