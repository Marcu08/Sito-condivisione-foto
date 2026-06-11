import bcrypt from 'bcryptjs';
import { jsonResponse, badRequest, serverError, requirePost, parseJsonBody } from './utils/response.mjs';

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

export async function handler(event) {
  const methodBlock = requirePost(event);
  if (methodBlock) return methodBlock;

  const ip =
    event.headers["x-nf-client-connection-ip"] ||
    event.headers["client-ip"] ||
    "unknown";

  if (tooManyAttempts(ip)) {
    return jsonResponse(429, {
      ok: false,
      error: "Troppi tentativi. Riprova tra un minuto.",
    });
  }

  try {
    const body = parseJsonBody(event);
    if (!body) return badRequest('Richiesta non valida');

    const { password } = body;

    if (!password) {
      return badRequest('Password mancante');
    }

    const hashSalvato = process.env.PASSWORD_HASH;
    if (!hashSalvato) {
      return serverError('Hash non configurato');
    }

    const ok = await bcrypt.compare(password.trim(), hashSalvato);
    return jsonResponse(200, { ok });
  } catch (error) {
    console.error('check-password: unexpected error', error);
    return serverError('Errore server');
  }
}
