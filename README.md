# BDC HUB

Dashboard di Emanuele BDC: App, GitHub, Articoli, Link e Google Drive opzionale. PWA installabile con dati offline. Le fonti pubbliche non richiedono token; Drive usa autorizzazione Google nel browser e non invia dati privati al server.

## Pubblicare su Cloudflare

Workers & Pages → Create application → importare la repository GitHub `emaf205/bdc-hub` come **Worker**.

- Ramo di produzione: `main`
- Directory principale: radice della repo
- Comando di build: lasciare vuoto
- Comando di deploy: `npx wrangler deploy`

La connessione Git attiva gli aggiornamenti dopo i push. Non selezionare Pages: il Worker recupera i dati lato server e serve la pagina e le API senza problemi CORS.

## Fonti e aggiornamenti

- App: legge i link dalla pagina esistente https://emabdc-app-hub.emagumroad.workers.dev/ e conserva l'avviso di elenco parziale. Non accede all'account Cloudflare e non conosce lo stato dei deploy. Se cambia il markup della pagina sorgente, potrebbe essere necessario aggiornare il parser.
- GitHub: repository pubbliche di `emaf205`, ordinate per ultimo push; tutte le pagine vengono lette. Ricerca e filtro per Topics, compresa l'opzione Senza tag. In GitHub si assegnano i Topics dal riquadro About della repository, tramite l'ingranaggio. Una repo può appartenere a più topic.
- Articoli: feed JSON pubblico https://emanuelebdc.com/feed.json, individuato dal sito Publii. Mostra gli articoli presenti nel feed, che potrebbe non includere l'intero archivio.

Aggiornamento all'apertura, ogni cinque minuti mentre la pagina è visibile e con il pulsante Aggiorna. Risposte API cacheabili per due minuti. Le tre fonti sono indipendenti: un errore non blocca le altre e i dati già visualizzati restano visibili con avviso. GitHub applica limiti alle richieste non autenticate: in caso di limite raggiunto il blocco segnala l'errore.

La dashboard è pubblica se pubblicata su workers.dev. Non inserire segreti nei file. Per una dashboard privata, configurare Cloudflare Access separatamente.

## Sviluppo

Node.js 22 o successivo, `npm install`, `npm run dev`. `npm run check` verifica la sintassi. `npm run deploy` pubblica usando un account Cloudflare autenticato.

## Dashboard V2

- Layout responsive con navigazione laterale, quattro pannelli e conteggi delle fonti.
- Ricerca globale in nomi, descrizioni, topic, URL e categorie.
- GitHub: filtri per topic e senza tag, ordinamento per data o nome, linguaggio e topic cliccabili.
- Stato della sincronizzazione e ora per ogni fonte; avvisi parziali e di errore visibili.
- Link utili raggruppati: Gestione, I miei spazi, Strumenti e Documentazione. I link predefiniti sono scorciatoie pubbliche, non attestano account collegati. Publii è un programma desktop: il relativo link apre la documentazione, non un pannello di amministrazione web.
- Aggiunta ed eliminazione con conferma dei link personali; i link predefiniti restano disponibili.
- Preferiti trasversali con filtro dedicato.
- Esportazione JSON di link personali, preferiti e snapshot delle fonti. Importazione JSON che unisce link e preferiti, validando gli indirizzi HTTP/HTTPS, senza importare le fonti remote.
- Link personali e preferiti usano localStorage: restano nel browser/dispositivo e non vengono inviati al server o salvati su GitHub. In navigazione privata possono andare persi. Il backup permette di trasferirli. La dashboard non sincronizza preferenze tra dispositivi.

## Verifiche V2

Sintassi del Worker e JavaScript della pagina; pacchetto Wrangler con deploy dry-run; test DOM su caricamento, ricerca globale, topic, preferiti, aggiunta ed eliminazione link, escaping dei testi e conservazione dei dati precedenti in caso di errore. Controllo visivo in un browser reale e deploy sull'account Cloudflare non eseguiti in questa sessione.

## Mobile first e continuità dei dati

Su schermi fino a 700 px, navigazione inferiore fissa tra App, GitHub, Articoli e Link; un solo pannello visibile e scorrimento della pagina senza liste annidate. Supporto safe area, controlli touch e caratteri da 16 px nei campi per evitare lo zoom automatico. Su desktop restano visibili tutti i pannelli.

La Cache API del Worker riutilizza le fonti per 10 minuti e conserva una copia fino a 24 ore per rispondere agli errori upstream. La cache è locale al data center e non garantita. Se la chiamata server a GitHub fallisce, il browser prova direttamente l'API pubblica, con i limiti associati alla propria connessione. Le ultime risposte valide vengono salvate anche in localStorage e mostrate con avviso in caso di indisponibilità. Nessun token necessario: restano possibili limiti GitHub su entrambe le connessioni. La CSP consente la sola API GitHub come destinazione esterna delle richieste del browser.

Verificati anche navigazione tra pannelli e recupero da un 403 simulato; controllo visivo su telefono reale non eseguito.

## Design e grafici

Nuovo stile bianco e nero ispirato alla reference; sette asset SVG separati in public/assets (cinque icone, occhio astratto, circuito decorativo). Nessuna immagine raster generata. Asset statici serviti da Wrangler tramite public.

Quattro grafici a barre con selettore e export CSV/SVG: linguaggio principale per repo, topic (una repo può avere più topic), repo per settimana dell’ultimo push nelle ultime 8 settimane UTC (non numero di commit), articoli del feed per mese negli ultimi 6 mesi UTC (feed potenzialmente parziale). I grafici usano tutti i dati disponibili della fonte, indipendentemente dai filtri delle liste. Data della fonte sempre visibile. Valori numerici leggibili anche senza le barre.

Verificati quattro grafici, conteggi, export SVG valido, ricerca, preferiti, link personali, fallback GitHub e pacchetto Wrangler con asset statici.

## Versione 1.1: PWA, locale e Drive

Apri la dashboard HTTPS e usa Installa (oppure il menu del browser). Dopo il primo caricamento la shell è disponibile offline; i dati già sincronizzati vengono conservati sul dispositivo. Nuove sincronizzazioni e documenti online richiedono Internet. Nuove versioni vengono applicate dal pulsante dedicato.

Per l'avvio locale basta Node.js 22 o successivo: scarica lo ZIP, estrai, esegui `npm start` dalla cartella e apri `http://localhost:8787`. L'avvio locale non richiede npm install, Wrangler o un account Cloudflare. I dati salvati appartengono all'origine: localhost e sito HTTPS hanno archivi distinti; trasferiscili con il backup JSON.

Drive può già conservare link a cartelle e associazioni a repo/app senza OAuth. Per leggere automaticamente le modifiche occorre configurare il client ID Google Cloud in Drive → Configura e autorizzare il proprio account. Il solo Client ID non è un segreto; non inserire il client secret. Mostra i primi 30 elementi direttamente in ogni cartella, senza scansione delle sottocartelle. La cache offline dei metadati Drive è facoltativa. Il backup include le cartelle scelte, non token né snapshot dei file Drive.

Dettagli di configurazione, limitazioni e test in [IMPLEMENTATION.md](IMPLEMENTATION.md).

## Versione 1.2 — Dashboard modulare

Nuovo design più compatto, dodici icone SVG coordinate, rimosso il banner decorativo e grafici raccolti in Analisi apribile. Navigazione mobile orizzontale per accedere anche ai box personali.

- Nuovo box: Note modificabili direttamente, Checklist con avanzamento, raccolta Link (una riga `Nome | https://...`), Repo per topic con dati GitHub già sincronizzati, Numeri delle fonti.
- Organizza: sposta su/giù, mostra/nascondi, larghezza normale/completa; eliminazione con conferma dei box personali. I box di sistema si possono nascondere e ripristinare.
- Ogni box si può ridurre dalla sua intestazione. Ripristina disposizione riporta tutti i box visibili senza cancellare quelli personali.
- Box e disposizione vengono salvati nel browser e nel backup JSON versione 2. Fino a 60 box personali; nessun contenuto HTML eseguibile o codice arbitrario nei box.
- Le raccolte repo sono dinamiche e richiedono gli stessi dati pubblici GitHub della dashboard. Note, checklist e link funzionano offline; i numeri riflettono gli ultimi dati disponibili.

Test: cinque tipi di box, progressione checklist, URL non validi, riordino/disposizione, riduzione, visibilità, ripristino, importazioni e regressione delle funzioni precedenti. Il service worker include modulo box e nuove icone nel pacchetto offline.

## Dashboard completa: grafici, date e statistiche

Ripristinato il layout a blocchi, con barra laterale su desktop e collegamenti alle sezioni su mobile. App, GitHub, Articoli, Link, Drive e box personali sono visibili insieme; nulla è spostato in un menu Altro.

In primo piano: quattro schede statistiche con data della fonte, data odierna Europe/Rome, grafico delle distribuzioni selezionabile e istogramma delle repo per settimana dell'ultimo push. Riepiloghi delle repo aggiornate negli ultimi sette giorni, ultimo push e data dell'ultimo articolo. I valori provengono dalle fonti disponibili: non indicano percentuali di avanzamento né numero di commit. Il feed può essere parziale.

Su mobile i grafici si scorrono orizzontalmente e i blocchi sono in colonna. Filtri GitHub conservati, topic ripetuti rimossi dalle righe per alleggerire le liste. Tutte le funzioni di box personali, PWA, backup e Drive restano disponibili.

Test: grafici e riepiloghi, date delle fonti, funzionalità precedenti, box personali, Drive simulato e bundle Cloudflare. L'aggiornamento PWA si applica da Nuova versione.
