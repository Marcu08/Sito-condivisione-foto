Album pubblico (senza password)
Basta solo galleries.json — aggiungi un blocco nell’array "galleries":

{
  "id": "gara-xyz",
  "name": "Gara XYZ",
  "category": "Fotografia Sportiva",
  "date": "Giugno 2026",
  "cover": "https://res.cloudinary.com/.../cover.jpg",
  "protected": false,
  "photos": [
    "https://res.cloudinary.com/.../foto1.jpg",
    "https://res.cloudinary.com/.../foto2.jpg"
  ]
}
Push su GitHub → fine.

Album privato (con password)
Servono due file, con lo stesso id:

1. galleries.json — scheda visibile sulla home
{
  "id": "gara-xyz",
  "name": "Gara XYZ",
  "category": "Fotografia Sportiva",
  "date": "Giugno 2026",
  "cover": "https://res.cloudinary.com/.../cover.jpg",
  "protected": true,
  "photoCount": 30
}
Qui non metti photos, solo photoCount (opzionale, per mostrare “30 foto” sulla card).

2. netlify/functions/data/galleries-private.json — hash + foto
{
  "gara-xyz": {
    "passwordHash": "$2b$12$...hash generato con npm...",
    "photos": [
      "https://res.cloudinary.com/.../foto1.jpg",
      "https://res.cloudinary.com/.../foto2.jpg"
    ]
  }
}
L’id deve coincidere: "gara-xyz" in entrambi i file.

Riepilogo
Tipo	galleries.json	galleries-private.json	index.html
Pubblico
✅ sì (con photos)
❌ no
❌ mai
Privato
✅ sì (senza photos)
✅ sì (hash + photos)
❌ mai
Se metti la galleria privata solo in galleries-private.json, non compare sulla home: manca la scheda in galleries.json.

Dopo ogni modifica: push su GitHub e Netlify aggiorna il sito in automatico.