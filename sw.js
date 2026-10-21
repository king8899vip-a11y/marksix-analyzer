const CACHE='marksix-analyzer-v3.3.2';
const SHELL=['./','./index.html','./styles.css?v=3.1.0','./app.js?v=3.1.0','./config.js?v=3.1.0','./data-service.js?v=3.1.0','./schedule.js?v=3.3.2','./app.js?v=3.3.2','./draw-video.js?v=3.3.2','./manifest.webmanifest'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>e.waitUntil(Promise.all([self.clients.claim(),caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('marksix-analyzer-')&&k!==CACHE).map(k=>caches.delete(k))))])));
self.addEventListener('fetch',e=>{
 const u=new URL(e.request.url);if(e.request.method!=='GET'||u.origin!==self.location.origin||!u.pathname.startsWith(new URL(self.registration.scope).pathname))return;
 const isData=/\/data\/(snapshot|history)\.json$/.test(u.pathname);
 // Strip only the timestamp: offline JSON keeps its own response and content type.
 const key=isData?new Request(u.origin+u.pathname):e.request;
 e.respondWith((async()=>{const cache=await caches.open(CACHE);try{const r=await fetch(e.request,{cache:'no-store'});if(r.ok)await cache.put(key,r.clone());return r}catch(err){const saved=await cache.match(key);if(saved)return saved;throw err}})());
});
