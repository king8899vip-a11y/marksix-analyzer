const CACHE='marksix-analyzer-v1.7.0';
const SHELL=['./','./index.html','./styles.css?v=1.7.0','./app.js?v=1.7.0','./config.js?v=1.7.0','./data-service.js?v=1.7.0','./manifest.webmanifest'];
self.addEventListener('install',e=>{self.skipWaiting();e.waitUntil(caches.open(CACHE).then(c=>c.addAll(SHELL)))});
self.addEventListener('activate',e=>e.waitUntil(Promise.all([self.clients.claim(),caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k))))])));
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET') return;
  const u=new URL(e.request.url);
  if(u.origin!==self.location.origin)return;
  const isData=u.pathname.endsWith('/data/snapshot.json')||u.pathname.endsWith('/data/history.json');
  const isNav=e.request.mode==='navigate';
  const isApp=/\.(js|css)$/.test(u.pathname);
  if(isData||isNav||isApp){
    e.respondWith(fetch(e.request,{cache:'no-store'}).then(r=>{const copy=r.clone();caches.open(CACHE).then(c=>c.put(e.request,copy));return r}).catch(()=>caches.match(e.request).then(r=>r||caches.match('./index.html'))));
    return;
  }
  e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request)));
});
