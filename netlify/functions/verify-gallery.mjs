import bcrypt from 'bcryptjs';
import privateGalleries from './data/galleries-private.json';
import { jsonResponse, badRequest, requirePost, parseJsonBody } from './utils/response.mjs';

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
  const methodError = requirePost(event);
  if (methodError) return methodError;

  const ip = event.headers['x-nf-client-connection-ip'] || event.headers['client-ip'] || 'unknown';

  if (tooManyAttempts(ip)) {
    return jsonResponse(429, { error: 'Troppi tentativi. Riprova tra un minuto.' });
  }

  const body = parseJsonBody(event);
  if (!body) return badRequest('Richiesta non valida');

  const { galleryId, password } = body;

  if (!galleryId || !password) {
    return badRequest('Dati mancanti');
  }

  const gallery = privateGalleries[galleryId.trim()];

  if (!gallery || !gallery.passwordHash) {
    return jsonResponse(404, {
      error: `Galleria "${galleryId}" non trovata. Controlla che l'id in galleries.json e galleries-private.json sia identico.`,
    });
  }

  const valid = await bcrypt.compare(password.trim(), gallery.passwordHash.trim());

  if (!valid) {
    return jsonResponse(401, { ok: false, error: 'Password non corretta' });
  }

  return jsonResponse(200, { ok: true, photos: gallery.photos || [] });
};
