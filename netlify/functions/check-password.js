import bcrypt from "bcryptjs";

export async function handler(event) {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ ok: false, error: "Metodo non valido" }),
    };
  }

  try {
    const { password } = JSON.parse(event.body || "{}");

    if (!password) {
      return {
        statusCode: 400,
        body: JSON.stringify({ ok: false, error: "Password mancante" }),
      };
    }

    const hashSalvato = process.env.PASSWORD_HASH;

    if (!hashSalvato) {
      return {
        statusCode: 500,
        body: JSON.stringify({ ok: false, error: "Hash non configurato" }),
      };
    }

    const ok = await bcrypt.compare(password.trim(), hashSalvato);

    return {
      statusCode: 200,
      body: JSON.stringify({ ok }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ ok: false, error: "Errore server" }),
    };
  }
}