# BDC HUB

Dashboard minimale di Emanuele BDC: App, GitHub, Articoli. Nessun database o token necessario. Mostra esclusivamente dati pubblici.

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
