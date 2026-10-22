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
      items.push(...batch.map(r => ({name:r.name, description:r.description || '', url:safeURL(r.html_url), date:r.pushed_at, topics:r.topics || []})));
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
const html = `<!doctype html>
<html lang="it"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="theme-color" content="#f6f6f2"><title>BDC HUB</title><style>
:root{font-family:Arial,Helvetica,sans-serif;color:#101010;background:#f6f6f2;color-scheme:light}*{box-sizing:border-box}body{margin:0}main{max-width:1600px;margin:auto;padding:32px}header{display:flex;justify-content:space-between;align-items:center;gap:20px;margin-bottom:40px}h1{font-size:clamp(38px,6vw,72px);letter-spacing:-.07em;margin:0;line-height:1}button,select,input{font:inherit;color:inherit;background:transparent;border:1px solid #101010;border-radius:0;padding:10px;min-height:44px}button{cursor:pointer;font-weight:700}button:hover,a:hover{background:#efff36}button:disabled{opacity:.5;cursor:wait}.grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:24px}section{border-top:3px solid;padding-top:16px;min-width:0}h2{font-size:26px;letter-spacing:-.04em;margin:0 0 18px}a{color:inherit;text-decoration:none}h2 a:focus-visible,a:focus-visible,button:focus-visible{outline:3px solid #777;outline-offset:3px}.tools{display:flex;gap:8px;margin-bottom:12px}.tools input{width:100%;min-width:0}.tools select{max-width:48%}.item{display:block;padding:16px 0;border-bottom:1px solid #ccc;overflow-wrap:anywhere}.name{font-size:20px;font-weight:800;letter-spacing:-.03em;line-height:1.2}.description{margin:7px 0 0;font-size:16px;line-height:1.4;color:#444}.date{display:block;margin-top:7px;font-size:14px;color:#555}.status{font-size:15px;line-height:1.4;color:#555}.status:empty{display:none}.list{max-height:70vh;overflow:auto;scrollbar-width:thin}footer{margin-top:28px;font-size:14px;color:#555} @media(max-width:1000px){.grid{grid-template-columns:1fr}.list{max-height:460px}main{padding:24px 20px}header{margin-bottom:32px}h2{margin-bottom:12px}} @media(prefers-reduced-motion:no-preference){a,button{transition:background .12s}}
</style></head><body><main><header><h1>BDC HUB.</h1><button id="refresh">Aggiorna</button></header><div class="grid">
<section aria-labelledby="apps-title"><h2 id="apps-title"><a href="https://emabdc-app-hub.emagumroad.workers.dev/" target="_blank" rel="noopener noreferrer">APP ↗</a></h2><p class="status" id="apps-status" role="status">Caricamento…</p><div class="list" id="apps-list"></div></section>
<section aria-labelledby="repos-title"><h2 id="repos-title"><a href="https://github.com/emaf205?tab=repositories" target="_blank" rel="noopener noreferrer">GITHUB ↗</a></h2><div class="tools"><input id="search" type="search" placeholder="Cerca repo" aria-label="Cerca repository"><select id="topic" aria-label="Filtra per topic"><option value="">Tutti i topic</option></select></div><p class="status" id="repos-status" role="status">Caricamento…</p><div class="list" id="repos-list"></div></section>
<section aria-labelledby="articles-title"><h2 id="articles-title"><a href="https://emanuelebdc.com/blog/" target="_blank" rel="noopener noreferrer">ARTICOLI ↗</a></h2><p class="status" id="articles-status" role="status">Caricamento…</p><div class="list" id="articles-list"></div></section>
</div><footer>Dati pubblici · <span id="synced">Sincronizzazione in corso</span></footer></main><script type="module">
const state = {}; const $ = id => document.getElementById(id);
function date(value){const d=new Date(value);return Number.isNaN(+d)?'':d.toLocaleDateString('it-IT');}
function render(kind){const root=$(kind+'-list');root.replaceChildren();let items=state[kind]?.items||[];
if(kind==='repos'){const q=$('search').value.trim().toLocaleLowerCase();const tag=$('topic').value;items=items.filter(i=>(i.name+' '+i.description).toLocaleLowerCase().includes(q)&&(!tag||(tag==='__none'? !i.topics.length:i.topics.includes(tag))));}
for(const i of items){const a=document.createElement('a');a.className='item';a.href=i.url;a.target='_blank';a.rel='noopener noreferrer';const title=document.createElement('div');title.className='name';title.textContent=i.name+' ↗';a.append(title);if(i.description){const p=document.createElement('p');p.className='description';p.textContent=i.description;a.append(p);}if(i.date&&date(i.date)){const d=document.createElement('time');d.className='date';d.textContent=date(i.date);d.dateTime=i.date;a.append(d);}root.append(a);}
if(!items.length){const p=document.createElement('p');p.className='status';p.textContent='Nessun risultato.';root.append(p);}}
async function load(kind){try{const r=await fetch('/api/'+kind);const data=await r.json();if(!r.ok)throw new Error(data.error||'Fonte non disponibile');state[kind]=data;
if(kind==='repos'){const selected=$('topic').value;const tags=[...new Set(data.items.flatMap(i=>i.topics))].sort();$('topic').replaceChildren();for(const [value,label] of [['','Tutti i topic'],['__none','Senza tag'],...tags.map(t=>[t,t])]){const o=document.createElement('option');o.value=value;o.textContent=label;$('topic').append(o);}if([...$('topic').options].some(o=>o.value===selected))$('topic').value=selected;}
render(kind);$(kind+'-status').textContent=data.notice||'';return true;
}catch(e){$(kind+'-status').textContent=(state[kind]?'Dati precedenti. ':'')+e.message;return false;}}
async function refresh(){if($('refresh').disabled)return;$('refresh').disabled=true;const results=await Promise.all(['apps','repos','articles'].map(load));$('synced').textContent=(results.every(Boolean)?'Aggiornato':'Aggiornamento parziale')+' alle '+new Date().toLocaleTimeString('it-IT',{hour:'2-digit',minute:'2-digit'});$('refresh').disabled=false;}
$('refresh').addEventListener('click',refresh);$('search').addEventListener('input',()=>render('repos'));$('topic').addEventListener('change',()=>render('repos'));refresh();setInterval(()=>{if(!document.hidden)refresh();},300000);
</script></body></html>`;
export default {async fetch(request) {
  const path=new URL(request.url).pathname;
  if(path.startsWith('/api/')){
    const kind=path.slice(5);
    if(!['apps','repos','articles'].includes(kind))return new Response('Not found',{status:404});
    try{return Response.json({...await getData(kind),fetchedAt:new Date().toISOString()},{headers:{'Cache-Control':'public, max-age=120','X-Content-Type-Options':'nosniff'}});}
    catch(e){return Response.json({error:e.message},{status:502,headers:{'Cache-Control':'no-store'}});}
  }
  if(path!=='/')return new Response('Not found',{status:404});
  return new Response(html,{headers:{'Content-Type':'text/html; charset=utf-8','X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer','Content-Security-Policy':"default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; base-uri 'none'; frame-ancestors 'none'; object-src 'none'"}});
}};
