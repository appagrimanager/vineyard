const CACHE="vineyard-manager-stock-v23";
const ASSETS=["./","./index.html","./manifest.webmanifest","./apple-touch-icon.png"];
self.addEventListener("install",event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS)).then(()=>self.skipWaiting())));
self.addEventListener("activate",event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim())));
self.addEventListener("fetch",event=>{
 if(event.request.method!=="GET")return;
 const url=new URL(event.request.url);
 // Only same-origin files and the Firebase SDK scripts (gstatic) are cached.
 // Firestore/Auth API calls (googleapis.com etc.) always go straight to the network.
 const ok=url.origin===location.origin||url.hostname==="www.gstatic.com";
 if(!ok)return;
 event.respondWith(caches.match(event.request).then(cached=>cached||fetch(event.request).then(response=>{
  if(response&&response.status===200){const copy=response.clone();caches.open(CACHE).then(cache=>cache.put(event.request,copy))}return response;
 }).catch(()=>caches.match("./index.html"))));
});
