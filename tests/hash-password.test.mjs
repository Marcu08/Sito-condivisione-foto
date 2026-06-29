import { describe, it, expect, vi, beforeEach } from 'vitest';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const execFileAsync = promisify(execFile);
const __dirname = dirname(fileURLToPath(import.meta.url));
const scriptPath = join(__dirname, '..', 'scripts', 'hash-password.mjs');

describe('hash-password script', () => {
  it('should exit with code 1 and show usage when no password provided', async () => {
    try {
      await execFileAsync('node', [scriptPath]);
      expect.fail('Should have thrown');
    } catch (err) {
      expect(err.code).toBe(1);
      expect(err.stderr).toContain('Uso:');
    }
  });

  it('should output a bcrypt hash for a given password', async () => {
    const { stdout } = await execFileAsync('node', [scriptPath, 'testPassword123']);
    const hash = stdout.trim();
    expect(hash).toMatch(/^\$2[aby]\$\d{2}\$.{53}$/);
  });

  it('should produce different hashes for same password (salt)', async () => {
    const { stdout: hash1 } = await execFileAsync('node', [scriptPath, 'same']);
    const { stdout: hash2 } = await execFileAsync('node', [scriptPath, 'same']);
    expect(hash1.trim()).not.toBe(hash2.trim());
  });

  it('should handle passwords with spaces', async () => {
    const { stdout } = await execFileAsync('node', [scriptPath, 'pass word with spaces']);
    const hash = stdout.trim();
    expect(hash).toMatch(/^\$2[aby]\$\d{2}\$.{53}$/);
  });

  it('should handle passwords with special characters', async () => {
    const { stdout } = await execFileAsync('node', [scriptPath, 'p@$$w0rd!#%']);
    const hash = stdout.trim();
    expect(hash).toMatch(/^\$2[aby]\$\d{2}\$.{53}$/);
  });
});
