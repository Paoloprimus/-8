# Runner PWA (Next.js + Web APIs)

- GPS **in primo piano** (niente background).
- UI **minimal**: tempo, distanza, 2 differenziali (Ultimo / Piano).
- Voce tramite **Web Speech**.
- Dati in **localStorage** (baseline, piano, ultima corsa).

## Sviluppo
```bash
npm i
npm run dev
```

Apri http://localhost:3000 (in dev il GPS funziona, ma i browser richiedono permessi).

## Deploy su Vercel
1) Crea repo GitHub, pusha/uppa i file.
2) Vai su **vercel.com → Add New Project** → importa il repo.
3) Framework: **Next.js**. Build Command: `next build`. Output: `.next`.
4) Deploy → l’URL sarà HTTPS (necessario per geolocalizzazione).
5) (Facoltativo) Aggiungi `manifest.webmanifest` e icona 192x192 per "Add to Home Screen".

## Limiti noti
- Tracking solo **foreground**.
- iOS Safari richiede interazione utente per avviare la voce e il GPS.
- Distanza aggiornata per step (filtro jitter <3m, split ogni 200m).

## Privacy
Tutto resta **in locale** (localStorage).
