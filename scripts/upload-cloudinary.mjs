import { v2 as cloudinary } from 'cloudinary';
import { readdirSync, statSync } from 'fs';
import { join, parse } from 'path';

const FOLDER = process.argv[2];
if (!FOLDER) {
  console.error('Usage: node scripts/upload-cloudinary.mjs "C:\\path\\to\\foto"');
  process.exit(1);
}

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const IMG_EXT = new Set(['.jpg', '.jpeg', '.png']);
const MAX_BYTES = 10 * 1024 * 1024;

const files = readdirSync(FOLDER)
  .filter(f => IMG_EXT.has(parse(f).ext.toLowerCase()))
  .map(f => ({ name: f, path: join(FOLDER, f), size: statSync(join(FOLDER, f)).size }))
  .filter(f => f.size <= MAX_BYTES)
  .sort((a, b) => a.name.localeCompare(b.name));

console.log(`Trovati ${files.length} file JPG/PNG sotto i 10MB da caricare\n`);

const results = [];

for (let i = 0; i < files.length; i++) {
  const { name, path } = files[i];
  const sizeMB = (files[i].size / 1024 / 1024).toFixed(1);
  process.stdout.write(`[${i + 1}/${files.length}] ${name} (${sizeMB}MB) ... `);

  try {
    const result = await cloudinary.uploader.upload(path, {
      folder: 'portfolio',
      resource_type: 'image',
    });
    results.push(result.secure_url);
    process.stdout.write(`✅\n`);
  } catch (err) {
    process.stdout.write(`❌ ${err.message}\n`);
  }
}

if (!results.length) {
  console.log('\n❌ Nessuna foto caricata.');
  process.exit(1);
}

const galleryId = 'foto_laives_2026';
const galleryName = 'Foto Campionato Italiano Laives 2026';

const jsonEntry = `{
      "id": "${galleryId}",
      "name": "${galleryName}",
      "category": "Fotografia Sportiva",
      "date": "Luglio 2026",
      "cover": "${results[0]}",
      "protected": false,
      "photos": [${results.map(u => `\n        "${u}"`).join(',')}
      ]
    }`;

console.log(`\n--- ✅ UPLOAD COMPLETATO (${results.length} foto) ---\n`);
console.log('Copia questo nel tuo galleries.json:\n');
console.log(jsonEntry);
