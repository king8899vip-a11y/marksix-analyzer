const CACHE='marksix-analyzer-v1.5.0';
const SHELL=['./','./index.html','./styles.css','./app.js','./config.js','./data-service.js','./manifest.webmanifest','./data/snapshot.json'];
self.addEventListener('install',e=>{self.skipWaiting();e.waitUntil(caches.open(CACHE).then(c=>c.addAll(SHELL)))});
self.addEventListener('activate',e=>e.waitUntil(Promise.all([self.clients.claim(),caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k))))])));
self.addEventListener('fetch',e=>{
  const u=new URL(e.request.url);
  if(u.origin!==self.location.origin)return;
  if(u.pathname.endsWith('/data/snapshot.json') || u.pathname.endsWith('/data/history.json')){
    e.respondWith(fetch(e.request).then(r=>{const copy=r.clone();caches.open(CACHE).then(c=>c.put(u.pathname,copy));return r}).catch(()=>caches.match(u.pathname))); return;
  }
  e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request)));
});

