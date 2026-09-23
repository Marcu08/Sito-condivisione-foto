import 'dotenv/config';
import { v2 as cloudinary } from 'cloudinary';
import bcrypt from 'bcryptjs';
import { readdirSync, statSync, readFileSync, writeFileSync, existsSync } from 'fs';
import { join, parse } from 'path';
import { createInterface } from 'readline/promises';

// ---------------------------------------------------------------------------
// Uso:
//   node scripts/publish-gallery.mjs --dir "C:\foto\gara-lari-2026" \
//     --id foto-gara-lari-2026 --name "Gara Lari 2026" --type evento \
//     --date "Giugno 2026"
//
// Galleria protetta (aggiunge --protected e --password):
//   node scripts/publish-gallery.mjs --dir "C:\foto\sofia-malpensa" \
//     --id foto_sofia_malpensa --name "Foto Sofia Malpensa" --type atleta \
//     --date "Maggio 2026" --protected --password "xyz123"
//
// Flag opzionali:
//   --category "Fotografia Sportiva"   (default)
//   --force                            sovrascrive una galleria con lo stesso id
//   --yes                              salta la conferma finale
// ---------------------------------------------------------------------------

const GALLERIES_JSON = 'galleries.json';
const PRIVATE_JSON = 'functions/data/galleries-private.json';
const INDEX_HTML = 'index.html';
const IMG_EXT = new Set(['.jpg', '.jpeg', '.png']);

function syncIndexHtml(data) {
  const html = readFileSync(INDEX_HTML, 'utf8');
  const regex = /(window\.__GALLERIES_DATA\s*=\s*)[\s\S]*?(;\s*<\/script>)/;
  if (!regex.test(html)) {
    console.error(`⚠️  Non ho trovato il blocco window.__GALLERIES_DATA in ${INDEX_HTML} — aggiornalo a mano.`);
    return false;
  }
  const updated = html.replace(regex, (_, before, after) => before + JSON.stringify(data, null, 2) + after);
  writeFileSync(INDEX_HTML, updated);
  return true;
}

function parseArgs(argv) {
  const out = { category: 'Fotografia Sportiva', protected: false, force: false, yes: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--protected') out.protected = true;
    else if (a === '--force') out.force = true;
    else if (a === '--yes') out.yes = true;
    else if (a.startsWith('--')) out[a.slice(2)] = argv[++i];
  }
  return out;
}

const args = parseArgs(process.argv.slice(2));
const { dir, id, name, type, date, category, protected: isProtected, password, force, yes } = args;

const missing = ['dir', 'id', 'name', 'type', 'date'].filter(k => !args[k]);
if (missing.length) {
  console.error(`❌ Argomenti mancanti: ${missing.join(', ')}`);
  console.error('Uso: node scripts/publish-gallery.mjs --dir <cartella> --id <id> --name "<nome>" --type evento|atleta --date "<data>" [--protected --password <pwd>]');
  process.exit(1);
}
if (isProtected && !password) {
  console.error('❌ --protected richiede anche --password');
  process.exit(1);
}
if (!['evento', 'atleta'].includes(type)) {
  console.error('❌ --type deve essere "evento" o "atleta"');
  process.exit(1);
}
if (!existsSync(GALLERIES_JSON) || !existsSync(INDEX_HTML) || (isProtected && !existsSync(PRIVATE_JSON))) {
  console.error('❌ Esegui lo script dalla root del repo (non trovo galleries.json, index.html o il file private).');
  process.exit(1);
}

const galleriesData = JSON.parse(readFileSync(GALLERIES_JSON, 'utf8'));
const existingIds = galleriesData.galleries.map(g => g.id);
if (existingIds.includes(id) && !force) {
  console.error(`❌ Esiste già una galleria con id "${id}". Usa --force per sovrascriverla.`);
  process.exit(1);
}

const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env;
if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
  console.error('❌ Variabili Cloudinary mancanti. Controlla che esista un file .env nella root con CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY e CLOUDINARY_API_SECRET.');
  process.exit(1);
}

cloudinary.config({
  cloud_name: CLOUDINARY_CLOUD_NAME,
  api_key: CLOUDINARY_API_KEY,
  api_secret: CLOUDINARY_API_SECRET,
});

const files = readdirSync(dir)
  .filter(f => IMG_EXT.has(parse(f).ext.toLowerCase()))
  .map(f => ({ name: f, path: join(dir, f), size: statSync(join(dir, f)).size }))
  .sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));

if (!files.length) {
  console.error('❌ Nessun JPG/PNG trovato nella cartella.');
  process.exit(1);
}

console.log(`Trovati ${files.length} file da caricare\n`);

const uploaded = [];
for (let i = 0; i < files.length; i++) {
  const { name: fname, path } = files[i];
  const sizeMB = (files[i].size / 1024 / 1024).toFixed(1);
  process.stdout.write(`[${i + 1}/${files.length}] ${fname} (${sizeMB}MB) ... `);
  try {
    const result = await cloudinary.uploader.upload(path, { folder: 'portfolio', resource_type: 'image' });
    uploaded.push(result.secure_url);
    process.stdout.write('✅\n');
  } catch (err) {
    process.stdout.write(`❌ ${err.message}\n`);
  }
}

if (!uploaded.length) {
  console.error('\n❌ Nessuna foto caricata con successo. Interrompo senza toccare i JSON.');
  process.exit(1);
}

const publicEntry = {
  id,
  name,
  type,
  category,
  date,
  cover: uploaded[0],
  protected: isProtected,
};

if (isProtected) {
  publicEntry.photoCount = uploaded.length;
} else {
  publicEntry.photos = uploaded;
}

console.log(`\n--- RIEPILOGO ---`);
console.log(`Galleria: ${name} (${id})`);
console.log(`Tipo: ${type} | Protetta: ${isProtected ? 'sì' : 'no'}`);
console.log(`Foto caricate: ${uploaded.length}/${files.length}`);
console.log(`Cover: ${uploaded[0]}`);
if (uploaded.length < files.length) {
  console.log(`⚠️  ${files.length - uploaded.length} foto non caricate (vedi errori sopra).`);
}

if (!yes) {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  const answer = await rl.question('\nScrivere i file JSON con questi dati? (s/n) ');
  rl.close();
  if (answer.trim().toLowerCase() !== 's') {
    console.log('Annullato. Nessun file modificato.');
    process.exit(0);
  }
}

const idx = galleriesData.galleries.findIndex(g => g.id === id);
if (idx >= 0) galleriesData.galleries[idx] = publicEntry;
else galleriesData.galleries.push(publicEntry);
writeFileSync(GALLERIES_JSON, JSON.stringify(galleriesData, null, 2) + '\n');
console.log(`✅ ${GALLERIES_JSON} aggiornato.`);

if (syncIndexHtml(galleriesData)) {
  console.log(`✅ ${INDEX_HTML} sincronizzato con i nuovi dati.`);
}

if (isProtected) {
  const passwordHash = await bcrypt.hash(password, 12);
  const privateData = JSON.parse(readFileSync(PRIVATE_JSON, 'utf8'));
  privateData[id] = { passwordHash, photos: uploaded };
  writeFileSync(PRIVATE_JSON, JSON.stringify(privateData, null, 2) + '\n');
  console.log(`✅ ${PRIVATE_JSON} aggiornato.`);
  console.log(`\n🔑 Password in chiaro da inviare via email: ${password}`);
}

console.log('\nFatto. Ora: git add, commit, push per il deploy.');
