import bcrypt from 'bcryptjs';
import privateGalleries from '../data/galleries-private.json';

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

function json(status, body) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  });
}

export async function onRequestPost({ request }) {
  if (!privateGalleries) {
    console.error('verify-gallery: private galleries data is unavailable');
    return json(500, { error: "Dati gallerie non disponibili. Contatta l'amministratore." });
  }

  const ip = request.headers.get('CF-Connecting-IP') || 'unknown';

  if (tooManyAttempts(ip)) {
    return json(429, { error: 'Troppi tentativi. Riprova tra un minuto.' });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return json(400, { error: 'Richiesta non valida' });
  }

  const { galleryId, password } = body || {};

  if (!galleryId || !password) {
    return json(400, { error: 'Dati mancanti' });
  }

  const gallery = privateGalleries[galleryId.trim()];

  if (!gallery || !gallery.passwordHash) {
    return json(404, {
      error: `Galleria "${galleryId}" non trovata. Controlla che l'id in galleries.json e galleries-private.json sia identico.`,
    });
  }

  let valid;
  try {
    valid = await bcrypt.compare(password.trim(), gallery.passwordHash.trim());
  } catch (bcryptErr) {
    console.error('verify-gallery: bcrypt comparison failed', bcryptErr);
    return json(500, { error: 'Errore durante la verifica della password.' });
  }

  if (!valid) {
    return json(401, { ok: false, error: 'Password non corretta' });
  }

  return json(200, { ok: true, photos: gallery.photos || [] });
}
