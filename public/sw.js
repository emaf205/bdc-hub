const VERSION='bdc-shell-v4-20261023-boxes';
const SHELL=['/','/app.js','/app.css','/drive.js','/pwa.js','/storage.js','/boxes.js','/assets/mark.svg','/assets/plus.svg','/assets/settings.svg','/assets/checklist.svg','/assets/note.svg','/assets/metrics.svg','/assets/drive.svg','/manifest.webmanifest','/assets/apps.svg','/assets/repos.svg','/assets/articles.svg','/assets/links.svg','/assets/chart.svg','/assets/circuit-grid.svg','/assets/neural-eye.svg','/assets/icon-192.png','/assets/icon-512.png','/assets/icon-maskable.svg'];
self.addEventListener('install',e=>e.waitUntil(caches.open(VERSION).then(cache=>cache.addAll(SHELL))));
self.addEventListener('activate',e=>e.waitUntil((async()=>{for(const key of await caches.keys())if(key.startsWith('bdc-shell-')&&key!==VERSION)await caches.delete(key);await self.clients.claim();})()));
self.addEventListener('message',e=>{if(e.data?.type==='SKIP_WAITING')self.skipWaiting();});
self.addEventListener('fetch',e=>{const u=new URL(e.request.url);if(e.request.method!=='GET'||u.origin!==self.location.origin||u.pathname.startsWith('/api/')||u.pathname.startsWith('/__data_cache/'))return;
if(e.request.mode==='navigate'){e.respondWith(caches.open(VERSION).then(async c=>(await c.match('/'))||fetch(e.request)).catch(()=>new Response('Riapri BDC HUB online una prima volta.',{status:503})));return;}
if(SHELL.includes(u.pathname))e.respondWith(caches.open(VERSION).then(async c=>(await c.match(u.pathname))||fetch(e.request)));
});
