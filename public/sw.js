/* global importScripts, workbox */
const pageCache='breathe-pages-v2',assetCache='breathe-assets-v2';
const localAsset=url=>url.origin===self.location.origin&&(url.pathname.startsWith('/_next/static/')||url.pathname.startsWith('/textures/')||url.pathname==='/manifest.webmanifest'||url.pathname==='/api/icon');
try{
 importScripts('https://storage.googleapis.com/workbox-cdn/releases/7.3.0/workbox-sw.js');
 workbox.setConfig({debug:false});
 workbox.core.setCacheNameDetails({prefix:'breathe',suffix:'v2'});
 workbox.core.clientsClaim();
 workbox.routing.registerRoute(({url,request})=>url.origin===self.location.origin&&request.mode==='navigate',new workbox.strategies.NetworkFirst({cacheName:pageCache,networkTimeoutSeconds:5,plugins:[new workbox.expiration.ExpirationPlugin({maxEntries:12,maxAgeSeconds:7*86400})]}));
 workbox.routing.registerRoute(({url})=>localAsset(url),new workbox.strategies.CacheFirst({cacheName:assetCache,plugins:[new workbox.expiration.ExpirationPlugin({maxEntries:100,maxAgeSeconds:30*86400})]}));
 workbox.routing.setCatchHandler(async({request})=>{if(request.mode==='navigate'){const page=await caches.match(new Request(self.location.origin+'/'),{ignoreSearch:true});if(page)return page;return new Response('BREATHE is offline. Open it online once to prepare offline access.',{status:503,headers:{'Content-Type':'text/plain'}})}return Response.error()});
}catch{
 // A minimal native shell fallback keeps CDN failure from preventing registration.
 self.addEventListener('activate',event=>event.waitUntil(self.clients.claim()));
 self.addEventListener('fetch',event=>{
  const request=event.request,url=new URL(request.url);if(request.method!=='GET'||url.origin!==self.location.origin)return;
  if(request.mode==='navigate')event.respondWith(fetch(request).then(async response=>{if(response.ok)(await caches.open(pageCache)).put(request,response.clone());return response}).catch(async()=>await caches.match(request)??await caches.match(self.location.origin+'/')??new Response('BREATHE is offline. Reconnect once to prepare access.',{status:503})));
  else if(localAsset(url))event.respondWith(caches.match(request).then(cached=>cached??fetch(request).then(async response=>{if(response.ok)(await caches.open(assetCache)).put(request,response.clone());return response})));
 });
}
// Seed the shell on installation: the initial navigation predates service-worker control.
self.addEventListener('install',event=>event.waitUntil((async()=>{try{const cache=await caches.open(pageCache);await cache.add('/')}catch{/* Initial online access is still usable. */}})()));
// The page offers already-loaded hashed assets so the first visit can prepare offline reload.
self.addEventListener('message',event=>{
 if(event.data?.type!=='BREATHE_CACHE'||!Array.isArray(event.data.urls))return;
 const urls=event.data.urls.slice(0,100).flatMap(value=>{try{if(typeof value!=='string')return [];const url=new URL(value,self.location.origin);return localAsset(url)?[url.href]:[]}catch{return []}});
 event.waitUntil((async()=>{const cache=await caches.open(assetCache);await Promise.allSettled(urls.map(async url=>{if(!await cache.match(url))await cache.add(url)}));const keys=await cache.keys();await Promise.all(keys.slice(0,Math.max(0,keys.length-100)).map(key=>cache.delete(key)))} )());
});
// API data and radio streams bypass this worker; IndexedDB fallbacks label stored data STALE.
