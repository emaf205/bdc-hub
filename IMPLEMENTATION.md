# BDC HUB 1.1 — PWA e Drive

## Consegnato

- Interfaccia e backend separati: shell.mjs, public/app.js, app.css e moduli storage, Drive, PWA.
- Manifest installabile, icone PNG 192/512 e SVG maskable, service worker con cache della sola interfaccia.
- Avviso nuova versione con attivazione scelta dall'utente. Aggiornare VERSION in public/sw.js a ogni release frontend.
- IndexedDB per copie delle fonti pubbliche e preferenze; compatibilità con localStorage precedente.
- Indicatore online/offline, dati salvati consultabili senza rete, link e preferiti modificabili offline.
- Google Drive opzionale, OAuth Google Identity Services nel browser, scope drive.metadata.readonly. Token esclusivamente in memoria.
- Cartelle salvabili anche senza OAuth, associazione manuale a URL repo/app, ricerca nei nomi dei file caricati.
- Metadati dei primi 30 elementi direttamente in ogni cartella, ordinati per modifiedTime. Nessuna scansione ricorsiva, nessuna modifica ai file.
- Conservazione offline dei metadati Drive solo su scelta esplicita, esclusa dalle cache HTTP pubbliche.
- Backup versione 2 compatibile con cartelle e associazioni. Nessun token, client secret o snapshot Drive incluso.
- Server locale Node, npm start, loopback 127.0.0.1:8787, senza necessità di un account Cloudflare.

## Configurazione Google necessaria al proprietario

1. Creare/selezionare un progetto Google Cloud e abilitare Google Drive API.
2. Configurare il consenso OAuth e i test user se l'app è in modalità test.
3. Creare credenziali OAuth di tipo Applicazione web, registrando le origini esatte della dashboard HTTPS e di http://localhost:8787.
4. Inserire il solo Client ID nel pannello Drive → Configura. Non serve il client secret.
5. Premere Collega Drive, autorizzare il proprio account e aggiungere i link alle cartelle.

Lo scope metadata.readonly riguarda i metadati dell'intero Drive ed è classificato restricted da Google. La scelta delle cartelle nella UI non riduce l'ambito OAuth. Eventuale distribuzione pubblica dell'integrazione può richiedere verifica Google. Controllare le regole del proprio account Workspace.

## Test eseguiti

- Sintassi dei moduli e packaging Wrangler con asset statici.
- DOM: fonti, ricerca, topic, preferiti, link, import/export, grafici, pannelli mobile e recupero errori.
- Drive simulato: cartella prima dell'autorizzazione, richiesta autenticata in sola lettura, nessuna persistenza del token, cache privata opt-in, disconnessione e importazioni non valide.
- Service worker simulato: risorse di precache esistenti, shell offline, esclusione di API e Google dalla cache.
- Server locale: root, moduli, manifest, service worker e icone con status e MIME corretti.

## Da verificare con account e dispositivi reali

- Consenso OAuth Google e lettura di una cartella reale: richiedono Client ID e autorizzazione del proprietario.
- Installazione e uso su iPhone/Android reali. Il supporto e la voce di installazione dipendono dal browser.
- Offline completo dopo aver visitato almeno una volta la versione online: non sono disponibili nuovi dati remoti o contenuti dei documenti.
