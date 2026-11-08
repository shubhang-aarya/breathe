/* global importScripts, workbox */
// Workbox is restricted to shell/assets. Data fallbacks are explicitly labeled in IndexedDB.
importScripts('https://storage.googleapis.com/workbox-cdn/releases/7.3.0/workbox-sw.js');
workbox.setConfig({debug:false});
workbox.core.setCacheNameDetails({prefix:'breathe',suffix:'v1'});
workbox.routing.registerRoute(({url,request})=>url.origin===self.location.origin&&request.mode==='navigate',new workbox.strategies.NetworkFirst({cacheName:'breathe-pages-v1',networkTimeoutSeconds:5,plugins:[new workbox.expiration.ExpirationPlugin({maxEntries:12,maxAgeSeconds:7*86400})]}));
workbox.routing.registerRoute(({url})=>url.origin===self.location.origin&&(url.pathname.startsWith('/_next/static/')||url.pathname.startsWith('/textures/')||url.pathname==='/manifest.webmanifest'),new workbox.strategies.CacheFirst({cacheName:'breathe-assets-v1',plugins:[new workbox.expiration.ExpirationPlugin({maxEntries:100,maxAgeSeconds:30*86400})]}));
// Never intercept /api/*, radio streams or click registration.

workbox.routing.setCatchHandler(async({request})=>{if(request.mode==='navigate'){const page=await caches.match(new Request(self.location.origin+'/'),{ignoreSearch:true});if(page)return page;return new Response('BREATHE is offline. Open it online once to prepare offline access.',{status:503,headers:{'Content-Type':'text/plain'}})}return Response.error()});
