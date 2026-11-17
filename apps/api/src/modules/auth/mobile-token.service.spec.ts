import { describe, it, expect, beforeEach } from 'vitest';
import { MobileTokenService } from './mobile-token.service';

describe('MobileTokenService', () => {
  let service: MobileTokenService;

  beforeEach(() => {
    service = new MobileTokenService();
  });

  it('signs and verifies a valid JWT payload', () => {
    const token = service.sign({ sub: 'emp-123', role: 'EMPLOYEE' }, { expiresIn: '15m' });
    expect(typeof token).toBe('string');
    expect(token.split('.')).toHaveLength(3);

    const decoded = service.verify(token);
    expect(decoded.sub).toBe('emp-123');
    expect(decoded.role).toBe('EMPLOYEE');
  });

  it('throws on tampered signature', () => {
    const token = service.sign({ sub: 'emp-123' }, { expiresIn: '15m' });
    const tampered = token.slice(0, -4) + 'abcd';
    expect(() => service.verify(tampered)).toThrow('Invalid token signature');
  });
});

