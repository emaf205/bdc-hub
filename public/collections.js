import {dbGet,dbPut} from './storage.js';
const $=id=>document.getElementById(id);
const el=(tag,value,cls)=>{const n=document.createElement(tag);if(value)n.textContent=value;if(cls)n.className=cls;return n;};
const url=v=>{try{const u=new URL(v);return /^https?:$/.test(u.protocol)&&!u.username&&!u.password?u.href:null;}catch{return null;}};
const labels={repos:'Repository',apps:'App',articles:'Articolo',links:'Link'};
export function validateCollections(raw){
 if(raw===undefined)return [];
 if(!Array.isArray(raw)||raw.length>100)throw Error('Cartelle nel backup non valide (massimo 100).');
 const ids=new Set();return raw.map(f=>{
  if(!f||typeof f.id!=='string'||!/^col-[a-zA-Z0-9-]{5,80}$/.test(f.id)||ids.has(f.id)||typeof f.name!=='string'||!f.name.trim()||f.name.length>80||!Array.isArray(f.items)||f.items.length>500)throw Error('Cartella nel backup non valida.');
  ids.add(f.id);const seen=new Set();const items=f.items.map(i=>{if(!i||!labels[i.kind]||typeof i.name!=='string'||!i.name.trim()||i.name.length>1000||typeof i.url!=='string'||i.url.length>2048||!url(i.url))throw Error('Elemento della cartella non valido.');return {kind:i.kind,name:i.name,url:url(i.url)};}).filter(i=>{const k=i.kind+'|'+i.url;if(seen.has(k))return false;seen.add(k);return true;});
  return {id:f.id,name:f.name.trim(),items};
 });
}
export function createCollections({getItems,getQuery,showMessage}){
 let folders=[];try{folders=validateCollections(JSON.parse(localStorage.getItem('bdc-collections-v1')||'[]'));}catch{}
 let editing=null,selected=new Map(),openId=null,undo=null,revision=0;
 const key=i=>i.kind+'|'+i.url;
 function persist(){revision++;dbPut('collections',folders);try{localStorage.setItem('bdc-collections-v1',JSON.stringify(folders));}catch{showMessage('Salvataggio cartelle non disponibile. Esporta un backup prima di chiudere.');}}
 function btn(label,fn,cls='button'){const b=el('button',label,cls);b.type='button';b.addEventListener('click',fn);return b;}
 function feedback(message,restore){const root=$('collections-feedback');root.replaceChildren(el('span',message));if(restore)root.append(btn('Annulla',()=>{restore();persist();render();root.replaceChildren(el('span','Operazione annullata.'));}));}
 function remove(fn,message){const snapshot=structuredClone(folders);fn();persist();const at=revision;feedback(message,()=>{if(revision===at)folders=snapshot;else {for(const f of snapshot){const now=folders.find(x=>x.id===f.id);if(!now)folders.push(f);else for(const i of f.items)if(!now.items.some(x=>key(x)===key(i)))now.items.push(i);}}});render();}
 function render(){const root=$('collections-list');root.replaceChildren();const all=new Map(getItems().map(i=>[key(i),i]));const q=getQuery().trim().toLocaleLowerCase();
  if(!folders.length){const empty=el('div','','empty');empty.append(el('p','Un progetto, tutte le sue risorse.'),btn('Crea la prima cartella',()=>open()));root.append(empty);return;}
  let shown=0;for(const f of folders){const nameMatch=f.name.toLocaleLowerCase().includes(q);const items=f.items.map(i=>({...i,...all.get(key(i))}));const visible=items.filter(i=>!q||nameMatch||(i.name+' '+i.url+' '+labels[i.kind]).toLocaleLowerCase().includes(q));if(q&&!nameMatch&&!visible.length)continue;shown++;
   const card=el('article','','collection-card');const head=el('div','','collection-head');const toggle=btn(f.name+' · '+items.length,()=>{openId=openId===f.id?null:f.id;render();},'collection-toggle');toggle.setAttribute('aria-expanded',String(openId===f.id||!!q));const bodyId=f.id+'-contents';toggle.setAttribute('aria-controls',bodyId);head.append(toggle,btn('Modifica',()=>open(f),'quiet-button'),btn('Elimina',()=>remove(()=>{folders=folders.filter(x=>x.id!==f.id);},'Cartella rimossa. Gli elementi originali sono conservati.'),'quiet-button'));card.append(head);
   const body=el('div','','collection-content');body.id=bodyId;body.hidden=openId!==f.id&&!q;
   if(!visible.length)body.append(el('p','Cartella vuota. Usa Modifica per aggiungere elementi.','empty'));
   for(const i of visible){const row=el('div','','row');const main=el('div','','row-main');const a=el('a',i.name+' ↗','title');a.href=i.url;a.target='_blank';a.rel='noopener noreferrer';main.append(a,el('span',labels[i.kind],'meta'));if(i.date)main.append(el('span',new Date(i.date).toLocaleDateString('it-IT'),'meta'));const rm=btn('Rimuovi',()=>remove(()=>{f.items=f.items.filter(x=>key(x)!==key(i));},'Elemento rimosso dalla cartella.'),'quiet-button');rm.setAttribute('aria-label','Rimuovi '+i.name+' da '+f.name);row.append(main,rm);body.append(row);}card.append(body);root.append(card);
  }if(!shown)root.append(el('p','Nessuna cartella corrispondente. Azzera la ricerca per rivederle.','empty'));
 }
 function picker(){const root=$('collection-picker');root.replaceChildren();const query=$('collection-search').value.trim().toLocaleLowerCase();const all=new Map([...getItems(),...selected.values()].map(i=>[key(i),i]));let count=0;
  for(const i of all.values()){if(query&&!(i.name+' '+i.url+' '+labels[i.kind]).toLocaleLowerCase().includes(query))continue;count++;const line=el('label','','collection-choice');const check=document.createElement('input');check.type='checkbox';check.checked=selected.has(key(i));check.addEventListener('change',()=>{if(check.checked)selected.set(key(i),{kind:i.kind,name:i.name,url:i.url});else selected.delete(key(i));$('collection-selection').textContent=selected.size+' elementi selezionati';});line.append(check,el('span',i.name),el('small',labels[i.kind]));root.append(line);}
  if(!count)root.append(el('p',query?'Nessun elemento corrispondente.':'Le fonti non sono ancora disponibili. Puoi creare una cartella vuota.','empty'));$('collection-selection').textContent=selected.size+' elementi selezionati';
 }
 function open(folder){editing=folder?.id||null;selected=new Map((folder?.items||[]).map(i=>[key(i),i]));$('collection-form-title').textContent=folder?'Modifica cartella':'Nuova cartella';$('collection-name').value=folder?.name||'';$('collection-search').value='';$('collection-error').textContent='';picker();$('collection-dialog').showModal();$('collection-name').focus();}
 $('new-collection').addEventListener('click',()=>open());$('collection-search').addEventListener('input',picker);$('collection-cancel').addEventListener('click',()=>$('collection-dialog').close());
 $('collection-form').addEventListener('submit',e=>{e.preventDefault();const name=$('collection-name').value.trim();if(!name){$('collection-error').textContent='Inserisci un nome.';return;}if(folders.some(f=>f.id!==editing&&f.name.toLocaleLowerCase()===name.toLocaleLowerCase())){$('collection-error').textContent='Esiste già una cartella con questo nome.';return;}if(!editing&&folders.length>=100){$('collection-error').textContent='Massimo 100 cartelle.';return;}if(selected.size>500){$('collection-error').textContent='Massimo 500 elementi per cartella.';return;}
  const f={id:editing||'col-'+crypto.randomUUID(),name,items:[...selected.values()]};folders=editing?folders.map(old=>old.id===editing?f:old):[...folders,f];openId=f.id;persist();render();$('collection-dialog').close();feedback('Cartella salvata su questo dispositivo.');
 });
 const startRevision=revision;dbGet('collections').then(data=>{if(revision!==startRevision||localStorage.getItem('bdc-collections-v1')||!data)return;try{folders=validateCollections(data);render();}catch{}});
 render();return {render,exportConfig:()=>structuredClone(folders),validateImport:validateCollections,importConfig:incoming=>{for(const f of incoming){const old=folders.find(x=>x.id===f.id);if(old){for(const i of f.items)if(!old.items.some(x=>key(x)===key(i))&&old.items.length<500)old.items.push(i);}else if(folders.length<100)folders.push(f);}persist();render();}};
}
