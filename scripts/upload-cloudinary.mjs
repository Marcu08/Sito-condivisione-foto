import { v2 as cloudinary } from 'cloudinary';
import { readdirSync, statSync, mkdtempSync } from 'fs';
import { join, parse } from 'path';
import sharp from 'sharp';
import { tmpdir } from 'os';

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

const EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.nef', '.tiff', '.tif']);
const files = readdirSync(FOLDER)
  .filter(f => EXTENSIONS.has(parse(f).ext.toLowerCase()))
  .sort();

const jpgNames = new Set(
  files.filter(f => parse(f).ext.toLowerCase() === '.jpg').map(f => parse(f).name)
);
const toUpload = files.filter(f => {
  const ext = parse(f).ext.toLowerCase();
  if (ext === '.nef' && jpgNames.has(parse(f).name)) return false;
  return true;
});

const MAX_BYTES = 10 * 1024 * 1024;
const tmpDir = mkdtempSync(join(tmpdir(), 'cld-upload-'));

console.log(`Trovati ${files.length} file, ne carico ${toUpload.length}\n`);

const results = [];

for (let i = 0; i < toUpload.length; i++) {
  const file = toUpload[i];
  const filePath = join(FOLDER, file);
  const stats = statSync(filePath);
  const sizeMB = (stats.size / 1024 / 1024).toFixed(1);
  const isRaw = parse(file).ext.toLowerCase() === '.nef';

  process.stdout.write(`[${i + 1}/${toUpload.length}] ${file} (${sizeMB}MB) ... `);

  try {
    let uploadPath = filePath;

    if (stats.size > MAX_BYTES && !isRaw) {
      const tmpFile = join(tmpDir, file);
      await sharp(filePath)
        .jpeg({ quality: 70, mozjpeg: true })
        .toFile(tmpFile);
      uploadPath = tmpFile;
      process.stdout.write(`[compress ${sizeMB}MB -> ${(statSync(tmpFile).size / 1024 / 1024).toFixed(1)}MB] `);
    }

    const result = await cloudinary.uploader.upload(uploadPath, {
      folder: 'portfolio',
      resource_type: 'auto',
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

console.log('\n--- ✅ UPLOAD COMPLETATO (' + results.length + ' foto) ---\n');
console.log('Copia questo nel tuo galleries.json:\n');
console.log(jsonEntry);
