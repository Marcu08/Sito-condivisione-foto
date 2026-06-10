import bcrypt from "bcryptjs";

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
  const headers = {
    "Content-Type": "application/json",
    "Cache-Control": "no-store",
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers, body: "" };
  }

  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ ok: false, error: "Metodo non valido" }),
    };
  }

  const ip =
    event.headers["x-nf-client-connection-ip"] ||
    event.headers["client-ip"] ||
    "unknown";

  if (tooManyAttempts(ip)) {
    return {
      statusCode: 429,
      headers,
      body: JSON.stringify({
        ok: false,
        error: "Troppi tentativi. Riprova tra un minuto.",
      }),
    };
  }

  try {
    const { password } = JSON.parse(event.body || "{}");

    if (!password) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ ok: false, error: "Password mancante" }),
      };
    }

    const hashSalvato = process.env.PASSWORD_HASH;

    if (!hashSalvato) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ ok: false, error: "Hash non configurato" }),
      };
    }

    const ok = await bcrypt.compare(password.trim(), hashSalvato);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ ok }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ ok: false, error: "Errore server" }),
    };
  }
}
