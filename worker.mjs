import { shellHTML } from './shell.mjs';
const SOURCES = {
  apps: 'https://emabdc-app-hub.emagumroad.workers.dev/',
  articles: 'https://emanuelebdc.com/feed.json'
};
const safeURL = value => { try { const u = new URL(value); return ['https:', 'http:'].includes(u.protocol) ? u.href : null; } catch { return null; } };
async function request(url) {
  const response = await fetch(url, {headers: {'User-Agent': 'BDC-Hub', 'Accept': 'application/json, text/html'}, signal: AbortSignal.timeout(12000)});
  if (!response.ok) throw new Error(`Fonte non disponibile (${response.status})`);
  return response;
}
export async function getData(kind) {
  if (kind === 'repos') {
    const items = [];
    for (let page = 1; page <= 100; page++) {
      const batch = await (await request(`https://api.github.com/users/emaf205/repos?per_page=100&type=owner&sort=pushed&page=${page}`)).json();
      if (!Array.isArray(batch)) throw new Error('Risposta GitHub non valida');
      items.push(...batch.map(r => ({name:r.name, description:r.description || '', url:safeURL(r.html_url), date:r.pushed_at, topics:r.topics || [], language:r.language || '',stars:r.stargazers_count,forks:r.forks_count,openIssues:r.open_issues_count,archived:r.archived===true,isFork:r.fork===true,homepage:r.homepage||'',license:r.license?.spdx_id||'',createdAt:r.created_at,sizeKB:r.size,defaultBranch:r.default_branch})));
      if (batch.length < 100) return {items};
    }
    return {items, notice:'Limite di lettura raggiunto: elenco parziale.'};
  }
  if (kind === 'articles') {
    const feed = await (await request(SOURCES.articles)).json();
    if (!Array.isArray(feed.items)) throw new Error('Feed non valido');
    return {items:feed.items.map(i => ({name:i.title || 'Articolo', url:safeURL(i.url), date:i.date_published})).filter(i=>i.url).sort((a,b)=>Date.parse(b.date)-Date.parse(a.date))};
  }
  if (kind === 'apps') {
    const html = await (await request(SOURCES.apps)).text();
    const items = [];
    for (const match of html.matchAll(/<a\b([^>]*\bclass=["'][^"']*\bapp\b[^"']*["'][^>]*)>([\s\S]*?)<\/a>/gi)) {
      const href = match[1].match(/\bhref=["']([^"']+)["']/i)?.[1];
      const name = match[2].match(/<span\b[^>]*>([\s\S]*?)<\/span>/i)?.[1]?.replace(/<[^>]*>/g,'').trim();
      const url = safeURL(href);
      if (name && url && !items.some(i=>i.url===url)) items.push({name,url});
    }
    if (!items.length) throw new Error('Nessuna app leggibile nella fonte');
    return {items, notice:html.includes('ELENCO PARZIALE') ? 'Elenco parziale nella fonte Cloudflare.' : ''};
  }
  throw new Error('Fonte sconosciuta');
}
const html = shellHTML;
export default {async fetch(request, env, ctx) {
  const path=new URL(request.url).pathname;
  if(path.startsWith('/api/')){
    const kind=path.slice(5);
    if(!['apps','repos','articles'].includes(kind))return new Response('Not found',{status:404});
    const cache = typeof caches !== 'undefined' ? caches.default : null;
    const cacheKey = new Request(new URL('/__data_cache/v2/'+kind, request.url).href);
    let previous;
    try { const cached=cache && await cache.match(cacheKey); if(cached)previous=await cached.json(); } catch {}
    if(previous && Date.now()-Date.parse(previous.fetchedAt)<600000)return Response.json(previous,{headers:{'Cache-Control':'public, max-age=120'}});
    try {
      const data={...await getData(kind),fetchedAt:new Date().toISOString()};
      if(cache){const task=cache.put(cacheKey,Response.json(data,{headers:{'Cache-Control':'public, max-age=86400'}})).catch(()=>{});if(ctx?.waitUntil)ctx.waitUntil(task);else await task;}
      return Response.json(data,{headers:{'Cache-Control':'public, max-age=120','X-Content-Type-Options':'nosniff'}});
    } catch(e){
      if(previous)return Response.json({...previous,stale:true,notice:'Ultimi dati salvati: fonte temporaneamente non disponibile.'},{headers:{'Cache-Control':'no-store'}});
      return Response.json({error:e.message},{status:502,headers:{'Cache-Control':'no-store'}});
    }
  }
  if(path!=='/')return new Response('Not found',{status:404});
  return new Response(html,{headers:{'Content-Type':'text/html; charset=utf-8','X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer','Cache-Control':'no-cache','Cross-Origin-Opener-Policy':'same-origin-allow-popups','Content-Security-Policy':"default-src 'self'; connect-src 'self' https://api.github.com https://www.googleapis.com https://accounts.google.com https://oauth2.googleapis.com; script-src 'self' https://accounts.google.com; style-src 'self' 'unsafe-inline'; base-uri 'none'; frame-ancestors 'none'; object-src 'none'; frame-src https://accounts.google.com; worker-src 'self'; manifest-src 'self'"}});
}};
