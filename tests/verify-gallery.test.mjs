import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('bcryptjs', () => ({
  default: { compare: vi.fn() },
}));

vi.mock('../netlify/functions/data/galleries-private.json', () => ({
  default: {
    'galleria-test': {
      passwordHash: '$2b$12$fakeHash',
      photos: ['https://example.com/photo1.jpg', 'https://example.com/photo2.jpg'],
    },
    'galleria-vuota': {
      passwordHash: '$2b$12$anotherHash',
      photos: [],
    },
  },
}));

let handler;
let bcrypt;

beforeEach(async () => {
  vi.resetModules();
  const mod = await import('../netlify/functions/verify-gallery.mjs');
  handler = mod.handler;
  bcrypt = (await import('bcryptjs')).default;
});

function makeEvent(overrides = {}) {
  return {
    httpMethod: 'POST',
    headers: { 'x-nf-client-connection-ip': '127.0.0.1' },
    body: JSON.stringify({ galleryId: 'galleria-test', password: 'secret123' }),
    ...overrides,
  };
}

describe('verify-gallery handler', () => {
  describe('HTTP method validation', () => {
    it('should return 204 for OPTIONS (CORS preflight)', async () => {
      const res = await handler(makeEvent({ httpMethod: 'OPTIONS' }));
      expect(res.statusCode).toBe(204);
      expect(res.body).toBe('');
    });

    it('should return 405 for non-POST methods', async () => {
      const res = await handler(makeEvent({ httpMethod: 'GET' }));
      expect(res.statusCode).toBe(405);
      const body = JSON.parse(res.body);
      expect(body.error).toContain('non consentito');
    });
  });

  describe('input validation', () => {
    it('should return 400 for invalid JSON body', async () => {
      const res = await handler(makeEvent({ body: 'not json' }));
      expect(res.statusCode).toBe(400);
      const body = JSON.parse(res.body);
      expect(body.error).toContain('non valida');
    });

    it('should return 400 when galleryId is missing', async () => {
      const res = await handler(makeEvent({
        body: JSON.stringify({ password: 'secret' }),
      }));
      expect(res.statusCode).toBe(400);
      const body = JSON.parse(res.body);
      expect(body.error).toContain('mancanti');
    });

    it('should return 400 when password is missing', async () => {
      const res = await handler(makeEvent({
        body: JSON.stringify({ galleryId: 'galleria-test' }),
      }));
      expect(res.statusCode).toBe(400);
      const body = JSON.parse(res.body);
      expect(body.error).toContain('mancanti');
    });

    it('should return 400 when body is empty', async () => {
      const res = await handler(makeEvent({ body: '' }));
      expect(res.statusCode).toBe(400);
      const body = JSON.parse(res.body);
      expect(body.error).toBeDefined();
    });
  });

  describe('gallery lookup', () => {
    it('should return 404 when gallery does not exist', async () => {
      bcrypt.compare.mockResolvedValue(false);
      const res = await handler(makeEvent({
        body: JSON.stringify({ galleryId: 'nonexistent', password: 'test' }),
      }));
      expect(res.statusCode).toBe(404);
      const body = JSON.parse(res.body);
      expect(body.error).toContain('non trovata');
    });
  });

  describe('password verification', () => {
    it('should return 200 with photos on correct password', async () => {
      bcrypt.compare.mockResolvedValue(true);
      const res = await handler(makeEvent());
      expect(res.statusCode).toBe(200);
      const body = JSON.parse(res.body);
      expect(body.ok).toBe(true);
      expect(body.photos).toEqual(['https://example.com/photo1.jpg', 'https://example.com/photo2.jpg']);
    });

    it('should return 200 with empty array for gallery with no photos', async () => {
      bcrypt.compare.mockResolvedValue(true);
      const res = await handler(makeEvent({
        body: JSON.stringify({ galleryId: 'galleria-vuota', password: 'test' }),
      }));
      expect(res.statusCode).toBe(200);
      const body = JSON.parse(res.body);
      expect(body.ok).toBe(true);
      expect(body.photos).toEqual([]);
    });

    it('should return 401 on wrong password', async () => {
      bcrypt.compare.mockResolvedValue(false);
      const res = await handler(makeEvent());
      expect(res.statusCode).toBe(401);
      const body = JSON.parse(res.body);
      expect(body.ok).toBe(false);
      expect(body.error).toContain('non corretta');
    });

    it('should trim galleryId and password before comparison', async () => {
      bcrypt.compare.mockResolvedValue(true);
      const res = await handler(makeEvent({
        body: JSON.stringify({ galleryId: '  galleria-test  ', password: '  secret  ' }),
      }));
      expect(res.statusCode).toBe(200);
      expect(bcrypt.compare).toHaveBeenCalledWith('secret', '$2b$12$fakeHash');
    });
  });

  describe('rate limiting', () => {
    it('should return 429 after exceeding max attempts', async () => {
      bcrypt.compare.mockResolvedValue(false);
      const ip = '10.0.0.99';

      for (let i = 0; i < 8; i++) {
        await handler(makeEvent({ headers: { 'x-nf-client-connection-ip': ip } }));
      }

      const res = await handler(makeEvent({ headers: { 'x-nf-client-connection-ip': ip } }));
      expect(res.statusCode).toBe(429);
      const body = JSON.parse(res.body);
      expect(body.error).toContain('Troppi tentativi');
    });

    it('should allow requests from different IPs independently', async () => {
      bcrypt.compare.mockResolvedValue(true);
      const res = await handler(makeEvent({
        headers: { 'x-nf-client-connection-ip': '192.168.1.1' },
      }));
      expect(res.statusCode).toBe(200);
    });
  });

  describe('response headers', () => {
    it('should include Content-Type and Cache-Control headers', async () => {
      bcrypt.compare.mockResolvedValue(true);
      const res = await handler(makeEvent());
      expect(res.headers['Content-Type']).toBe('application/json');
      expect(res.headers['Cache-Control']).toBe('no-store');
    });
  });
});
