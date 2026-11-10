// Emergency recovery: retire old offline caches; never intercept live pages.
self.addEventListener('install',event=>event.waitUntil(self.skipWaiting()));
self.addEventListener('activate',event=>event.waitUntil((async()=>{
 const keys=await caches.keys();
 await Promise.all(keys.filter(k=>k.startsWith('marksix-analyzer-')).map(k=>caches.delete(k)));
 await self.clients.claim();
 await self.registration.unregister();
})()));
