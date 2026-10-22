# BDC HUB

Dashboard di Emanuele BDC: App, GitHub, Articoli e Link utili. Nessun database o token necessario. Mostra esclusivamente dati pubblici.

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
