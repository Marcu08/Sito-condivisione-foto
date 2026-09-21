import { readFileSync, writeFileSync, existsSync } from 'fs';

const GALLERIES_JSON = 'galleries.json';
const INDEX_HTML = 'index.html';

if (!existsSync(GALLERIES_JSON) || !existsSync(INDEX_HTML)) {
  console.error('❌ Esegui lo script dalla root del repo.');
  process.exit(1);
}

const data = JSON.parse(readFileSync(GALLERIES_JSON, 'utf8'));
const html = readFileSync(INDEX_HTML, 'utf8');
const regex = /(window\.__GALLERIES_DATA\s*=\s*)[\s\S]*?(;\s*<\/script>)/;

if (!regex.test(html)) {
  console.error(`❌ Non ho trovato il blocco window.__GALLERIES_DATA in ${INDEX_HTML}.`);
  process.exit(1);
}

const updated = html.replace(regex, (_, before, after) => before + JSON.stringify(data, null, 2) + after);
writeFileSync(INDEX_HTML, updated);
console.log(`✅ ${INDEX_HTML} sincronizzato con ${GALLERIES_JSON}.`);
