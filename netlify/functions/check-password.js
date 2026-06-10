import bcrypt from 'bcryptjs';
import { jsonResponse, badRequest, serverError, requirePost, parseJsonBody } from './utils/response.mjs';

export async function handler(event) {
  const methodError = requirePost(event);
  if (methodError) return methodError;

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

  try {
    const ok = await bcrypt.compare(password.trim(), hashSalvato);
    return jsonResponse(200, { ok });
  } catch {
    return serverError();
  }
}
