import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import bcrypt from 'bcryptjs';

const privateGalleries = JSON.parse(
  readFileSync(join(dirname(fileURLToPath(import.meta.url)), 'data', 'galleries-private.json'), 'utf8')
);

const rateLimit = new Map();
const WINDOW_MS = 60_000;
const MAX_ATTEMPTS = 8;

function tooManyAttempts(ip) {
  const now = Date.now();
  const entry = rateLimit.get(ip) || { count: 0, resetAt: now + WINDOW_MS };

  if (now > entry.resetAt) {
    rateLimit.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }

  entry.count += 1;
  rateLimit.set(ip, entry);
  return entry.count > MAX_ATTEMPTS;
}

export const handler = async (event) => {
  const headers = {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-store',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Metodo non consentito' }) };
  }

  const ip = event.headers['x-nf-client-connection-ip'] || event.headers['client-ip'] || 'unknown';

  if (tooManyAttempts(ip)) {
    return {
      statusCode: 429,
      headers,
      body: JSON.stringify({ error: 'Troppi tentativi. Riprova tra un minuto.' }),
    };
  }

  let body;
  try {
    body = JSON.parse(event.body || '{}');
  } catch {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Richiesta non valida' }) };
  }

  const { galleryId, password } = body;

  if (!galleryId || !password) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Dati mancanti' }) };
  }

  const gallery = privateGalleries[galleryId.trim()];

  if (!gallery || !gallery.passwordHash) {
    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({
        error: `Galleria "${galleryId}" non trovata. Controlla che l'id in galleries.json e galleries-private.json sia identico.`,
      }),
    };
  }

  const valid = await bcrypt.compare(password.trim(), gallery.passwordHash.trim());

  if (!valid) {
    return { statusCode: 401, headers, body: JSON.stringify({ error: 'Password non corretta' }) };
  }

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({ photos: gallery.photos || [] }),
  };
};
