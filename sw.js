const CACHE="vineyard-manager-stock-v75";
const ASSETS=["./","./index.html","./manifest.webmanifest","./apple-touch-icon.png"];
// install: always fetch fresh copies (bypass the browser HTTP cache) so a new version never stores a stale index.html
self.addEventListener("install",event=>event.waitUntil(caches.open(CACHE).then(cache=>Promise.all(ASSETS.map(u=>fetch(new Request(u,{cache:"reload"})).then(r=>{if(r&&r.ok)return cache.put(u,r)}).catch(()=>{})))).then(()=>self.skipWaiting())));
self.addEventListener("activate",event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim())));
self.addEventListener("message",e=>{if(e.data==="skipWaiting")self.skipWaiting()});
self.addEventListener("fetch",event=>{
 if(event.request.method!=="GET")return;
 const url=new URL(event.request.url);
 const same=url.origin===location.origin,gst=url.hostname==="www.gstatic.com";
 if(!same&&!gst)return;
 if(same){
  // network-first (revalidate) so updates show immediately; fall back to cache when offline
  event.respondWith(fetch(new Request(event.request,{cache:"no-cache"})).then(response=>{
   if(response&&response.status===200){const copy=response.clone();caches.open(CACHE).then(c=>c.put(event.request,copy))}return response;
  }).catch(()=>caches.match(event.request).then(c=>c||caches.match("./index.html"))));
  return;
 }
 event.respondWith(caches.match(event.request).then(cached=>cached||fetch(event.request).then(response=>{
  if(response&&response.status===200){const copy=response.clone();caches.open(CACHE).then(cache=>cache.put(event.request,copy))}return response;
 })));
});
