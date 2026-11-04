import { describe, it, expect } from 'vitest';
import { AuthService } from './auth.service';

describe('AuthService Unit Tests', () => {
  const authService = new AuthService();

  it('should hash and verify passwords using Argon2id', async () => {
    const rawPassword = 'SecurePassword@2026';
    const hash = await authService.hashPassword(rawPassword);

    expect(hash).toBeDefined();
    expect(hash.startsWith('$argon2id$')).toBe(true);

    const isMatch = await authService.verifyPassword(hash, rawPassword);
    expect(isMatch).toBe(true);

    const isMismatch = await authService.verifyPassword(hash, 'WrongPassword123');
    expect(isMismatch).toBe(false);
  });

  it('should reject empty session token validation', async () => {
    await expect(authService.validateSession('')).rejects.toThrow();
  });
});
