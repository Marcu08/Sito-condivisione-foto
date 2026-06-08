# Sito condivisione foto — Francesco Marcucci

Sito fotografico statico con gallerie pubbliche e gallerie protette da password (verifica server-side su Netlify).

## Deploy su Netlify (consigliato)

1. Collega la repo [Sito-condivisione-foto](https://github.com/Marcu08/Sito-condivisione-foto) a Netlify
2. Build command: *(vuoto)*
3. Publish directory: `.`
4. Netlify installerà automaticamente le dipendenze per le Functions

Le **Netlify Functions** sono incluse nel piano gratuito (125.000 richieste/mese).

## Struttura file

| File | Ruolo |
|------|--------|
| `galleries.json` | Portfolio e gallerie pubbliche (visibile nel browser) |
| `netlify/functions/data/galleries-private.json` | Gallerie protette: hash password + URL foto (solo server) |
| `netlify/functions/verify-gallery.mjs` | Verifica password con bcrypt |
| `app.js` | Logica frontend |
| `style.css` | Stili |

## Aggiungere una galleria pubblica

Modifica `galleries.json`:

```json
{
  "id": "nome-evento",
  "name": "Nome Evento",
  "category": "Fotografia Sportiva",
  "date": "Giugno 2026",
  "cover": "https://res.cloudinary.com/.../cover.jpg",
  "protected": false,
  "photos": ["https://res.cloudinary.com/.../foto1.jpg"]
}
```

Il conteggio foto è calcolato automaticamente da `photos.length`.

## Aggiungere una galleria protetta (password sicura)

### 1. Genera l'hash bcrypt della password

```bash
npm install
npm run hash-password -- laPasswordDelCliente
```

Copia l'hash generato (es. `$2b$12$...`).

### 2. Aggiungi le foto in `galleries-private.json`

```json
{
  "nome-evento": {
    "passwordHash": "$2b$12$...hash...",
    "photos": [
      "https://res.cloudinary.com/.../foto1.jpg"
    ]
  }
}
```

### 3. Aggiungi la scheda pubblica in `galleries.json`

```json
{
  "id": "nome-evento",
  "name": "Nome Evento",
  "category": "Fotografia Sportiva",
  "date": "Giugno 2026",
  "cover": "https://res.cloudinary.com/.../cover.jpg",
  "protected": true,
  "photoCount": 42
}
```

> **Importante:** per le gallerie protette non mettere `photos` in `galleries.json`. Gli URL restano solo sul server e vengono restituiti dopo la verifica password.

### Sicurezza

- La password in chiaro **non** va mai nel codice
- L'hash bcrypt nel file privato è sicuro da committare
- Le foto protette non sono scaricabili dal sorgente pagina senza password
- Limite tentativi: 8 per minuto per IP (anti brute-force base)

> Le foto su Cloudinary restano tecnicamente accessibili se qualcuno conosce l'URL diretto. Per massima protezione usa cartelle private Cloudinary con URL firmati (piano a pagamento).

## URL Cloudinary consigliati

Carica le foto senza `q_100`. Il sito applica automaticamente:

- **Thumbnail:** `w_600,q_auto,f_auto`
- **Lightbox:** `w_1600,q_auto,f_auto`
- **Download:** `fl_attachment,q_auto,f_auto`

## Sviluppo locale

```bash
npm install
npx netlify dev
```

Senza `netlify dev`, le gallerie protette non funzionano in locale.
