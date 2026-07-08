const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
  'Cache-Control': 'no-store',
};

export function jsonResponse(statusCode, body, headers = DEFAULT_HEADERS) {
  return { statusCode, headers, body: JSON.stringify(body) };
}

function methodNotAllowed() {
  return jsonResponse(405, { error: 'Metodo non consentito' });
}

export function badRequest(error) {
  return jsonResponse(400, { error });
}

export function serverError(error = 'Errore server') {
  return jsonResponse(500, { error });
}

export function parseJsonBody(event) {
  try {
    return JSON.parse(event.body || '{}');
  } catch {
    return null;
  }
}

export function requirePost(event) {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: DEFAULT_HEADERS, body: '' };
  }
  if (event.httpMethod !== 'POST') {
    return methodNotAllowed();
  }
  return null;
}
