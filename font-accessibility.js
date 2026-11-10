/* Persistent two-stage font-size control. */
(()=>{
 const themeButton=document.getElementById('themeBtn');
 if(!themeButton)return;
 const control=document.createElement('div');
 control.className='font-scale-control';
 const button=document.createElement('button');
 button.type='button';
 button.id='fontScaleBtn';
 button.setAttribute('aria-label','切换全站字号：小字体、大字体');
 button.title='切换全站字体大小';
 control.append(button);
 themeButton.parentNode.insertBefore(control,themeButton);
 const keys=['normal','large'],labels=['小字体','大字体'];
 let value='normal';
 try{const stored=localStorage.getItem('marksix-font-size');if(stored==='extra')value='large';else if(keys.includes(stored))value=stored;}catch{}
 function apply(){
  document.body.classList.toggle('font-large',value==='large');
  button.textContent='字号：'+labels[keys.indexOf(value)];
  button.setAttribute('aria-label','当前'+labels[keys.indexOf(value)]+'，点击切换至'+labels[(keys.indexOf(value)+1)%2]);
  button.setAttribute('aria-pressed',String(value!=='normal'));
 }
 button.addEventListener('click',()=>{value=keys[(keys.indexOf(value)+1)%2];try{localStorage.setItem('marksix-font-size',value)}catch{}apply()});
 apply();
})();
