import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import worker from './worker.mjs';
const root=path.resolve(fileURLToPath(new URL('./public/',import.meta.url)));
const types={'.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.webmanifest':'application/manifest+json','.svg':'image/svg+xml','.png':'image/png'};
const port=Number(process.env.BDC_HUB_PORT||8787);
createServer(async(req,res)=>{try{const url=new URL(req.url,'http://localhost:'+port);let route;try{route=decodeURIComponent(url.pathname);}catch{res.writeHead(400);res.end('Bad request');return;}if(route!=='/'&&!route.startsWith('/api/')){const target=path.resolve(root,'.'+route);if(!target.startsWith(root+path.sep)&&target!==root){res.writeHead(404);res.end();return;}try{const data=await readFile(target);res.writeHead(200,{'Content-Type':types[path.extname(target)]||'application/octet-stream','Cache-Control':'no-cache'});res.end(data);return;}catch{}}
const r=await worker.fetch(new Request(url,{method:req.method}),{}, {waitUntil:p=>p.catch(()=>{})});res.writeHead(r.status,Object.fromEntries(r.headers));res.end(Buffer.from(await r.arrayBuffer()));}catch{res.writeHead(500);res.end('Errore del server locale');}}).listen(port,'127.0.0.1',()=>console.log('BDC HUB: http://localhost:'+port+' · Ctrl+C per chiudere'));
