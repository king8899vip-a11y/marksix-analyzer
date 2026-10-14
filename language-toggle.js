(()=>{
 if(document.getElementById('languageToggle'))return;
 let mode='cn',convert=null,loading=null,pending=false;
 try{mode=localStorage.getItem('marksix-language')==='tw'?'tw':'cn'}catch{}
 const textMemory=new WeakMap(),attributeMemory=new WeakMap();
 const button=document.createElement('button');button.id='languageToggle';button.type='button';button.className='icon-btn';button.dataset.noConvert='true';button.style.cssText='width:auto;min-width:58px;padding:8px 10px;white-space:nowrap;font:inherit;font-size:13px;flex-shrink:0';
 const top=document.querySelector('.topbar,header');if(top){const theme=top.querySelector('#themeBtn');top.insertBefore(button,theme||null)}else{button.style.position='fixed';button.style.top='12px';button.style.right='12px';button.style.zIndex='100';document.body.append(button)}
 const observer=new MutationObserver(()=>{if(pending)return;pending=true;requestAnimationFrame(()=>{pending=false;apply()})});
 function observe(){observer.observe(document.documentElement,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['placeholder','aria-label','title','alt']})}
 function value(current,record){if(!record||current!==record.last)record={original:current,last:current};const next=mode==='tw'&&convert?convert(record.original):record.original;record.last=next;return [next,record]}
 function apply(){observer.disconnect();const walker=document.createTreeWalker(document.documentElement,NodeFilter.SHOW_TEXT);let node;while(node=walker.nextNode()){if(node.parentElement?.closest('script,style,code,pre,[data-no-convert],.ignore-opencc'))continue;const [next,record]=value(node.nodeValue,textMemory.get(node));textMemory.set(node,record);if(node.nodeValue!==next)node.nodeValue=next}
  document.querySelectorAll('[placeholder],[aria-label],[title],[alt]').forEach(el=>{if(el.closest('[data-no-convert],script,style'))return;const records=attributeMemory.get(el)||{};for(const name of ['placeholder','aria-label','title','alt']){if(!el.hasAttribute(name))continue;const [next,record]=value(el.getAttribute(name),records[name]);records[name]=record;if(el.getAttribute(name)!==next)el.setAttribute(name,next)}attributeMemory.set(el,records)});
  document.documentElement.lang=mode==='tw'?'zh-Hant':'zh-Hans';button.textContent=mode==='tw'?'简体':'繁體';button.setAttribute('aria-label',mode==='tw'?'切换为简体中文':'切換為繁體中文');button.setAttribute('aria-pressed',String(mode==='tw'));observe();
 }
 function load(){if(convert)return Promise.resolve();if(loading)return loading;loading=new Promise((resolve,reject)=>{const script=document.createElement('script');script.src='https://cdn.jsdelivr.net/npm/opencc-js@1.0.5/dist/umd/cn2t.js';script.onload=()=>{try{convert=OpenCC.Converter({from:'cn',to:'tw'});resolve()}catch(e){reject(e)}};script.onerror=()=>reject(Error('转换服务暂不可用'));document.head.append(script)}).catch(e=>{loading=null;throw e});return loading}
 button.addEventListener('click',async()=>{button.disabled=true;try{if(mode==='cn')await load();mode=mode==='cn'?'tw':'cn';try{localStorage.setItem('marksix-language',mode)}catch{}apply()}catch{button.textContent='重试';button.title='简繁转换暂时无法加载，请稍后重试'}finally{button.disabled=false}});
 apply();if(mode==='tw')load().then(apply).catch(()=>{mode='cn';apply();button.title='简繁转换暂时无法加载，请稍后重试'});
})();

