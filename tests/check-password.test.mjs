import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('bcryptjs', () => ({
  default: { compare: vi.fn() },
}));

let handler;
let bcrypt;

beforeEach(async () => {
  vi.resetModules();
  vi.stubEnv('PASSWORD_HASH', '$2b$12$storedHash');
  const mod = await import('../netlify/functions/check-password.js');
  handler = mod.handler;
  bcrypt = (await import('bcryptjs')).default;
});

function makeEvent(overrides = {}) {
  return {
    httpMethod: 'POST',
    headers: { 'x-nf-client-connection-ip': '127.0.0.1' },
    body: JSON.stringify({ password: 'myPassword' }),
    ...overrides,
  };
}

describe('check-password handler', () => {
  describe('HTTP method validation', () => {
    it('should return 405 for non-POST methods', async () => {
      const res = await handler(makeEvent({ httpMethod: 'GET' }));
      expect(res.statusCode).toBe(405);
      const body = JSON.parse(res.body);
      expect(body.error).toContain('non consentito');
    });
  });

  describe('input validation', () => {
    it('should return 400 when password is missing', async () => {
      const res = await handler(makeEvent({ body: JSON.stringify({}) }));
      expect(res.statusCode).toBe(400);
      const body = JSON.parse(res.body);
      expect(body.error).toContain('mancante');
    });

    it('should return 400 when body is empty', async () => {
      const res = await handler(makeEvent({ body: '' }));
      expect(res.statusCode).toBe(400);
      const body = JSON.parse(res.body);
      expect(body.error).toBeDefined();
    });
  });

  describe('environment configuration', () => {
    it('should return 500 when PASSWORD_HASH env var is not set', async () => {
      vi.stubEnv('PASSWORD_HASH', '');
      vi.resetModules();
      const mod = await import('../netlify/functions/check-password.js');
      bcrypt = (await import('bcryptjs')).default;
      bcrypt.compare.mockResolvedValue(false);
      const res = await mod.handler(makeEvent());
      expect(res.statusCode).toBe(500);
      const body = JSON.parse(res.body);
      expect(body.error).toContain('non configurato');
    });
  });

  describe('password verification', () => {
    it('should return ok:true when password matches', async () => {
      bcrypt.compare.mockResolvedValue(true);
      const res = await handler(makeEvent());
      expect(res.statusCode).toBe(200);
      const body = JSON.parse(res.body);
      expect(body.ok).toBe(true);
    });

    it('should return ok:false when password does not match', async () => {
      bcrypt.compare.mockResolvedValue(false);
      const res = await handler(makeEvent());
      expect(res.statusCode).toBe(200);
      const body = JSON.parse(res.body);
      expect(body.ok).toBe(false);
    });

    it('should trim the password before comparing', async () => {
      bcrypt.compare.mockResolvedValue(true);
      await handler(makeEvent({ body: JSON.stringify({ password: '  test  ' }) }));
      expect(bcrypt.compare).toHaveBeenCalledWith('test', '$2b$12$storedHash');
    });
  });

  describe('error handling', () => {
    it('should return 500 on unexpected errors', async () => {
      bcrypt.compare.mockRejectedValue(new Error('bcrypt crashed'));
      const res = await handler(makeEvent());
      expect(res.statusCode).toBe(500);
      const body = JSON.parse(res.body);
      expect(body.error).toContain('Errore server');
    });
  });
});
