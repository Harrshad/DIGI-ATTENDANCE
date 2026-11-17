import { describe, it, expect } from 'vitest';
import {
  mobileLoginSchema,
  mobileActivationRequestSchema,
  mobileVerifyActivationSchema,
  sanitizeEmployeeId,
} from '../src/schemas/mobile-auth.schema';

describe('Mobile Auth Schemas', () => {
  it('sanitizes employee IDs with leading hash and lowercase letters', () => {
    expect(sanitizeEmployeeId('#emp-2062')).toBe('EMP-2062');
    expect(sanitizeEmployeeId(' #EMP-2062  ')).toBe('EMP-2062');
    expect(sanitizeEmployeeId('EMP-4821')).toBe('EMP-4821');
  });

  it('validates mobile login input with employee ID normalization', () => {
    const parsed = mobileLoginSchema.parse({
      employeeId: '#emp-2062',
      password: 'secretPassword123',
      deviceId: 'android-uuid-12345',
    });

    expect(parsed.employeeId).toBe('EMP-2062');
    expect(parsed.platform).toBe('ANDROID');
    expect(parsed.appVersion).toBe('1.0.2');
  });

  it('validates mobile activation request requires exact 5 digits', () => {
    expect(() =>
      mobileActivationRequestSchema.parse({
        employeeId: '#EMP-2062',
        mobileLast5: '420',
      })
    ).toThrow();

    const valid = mobileActivationRequestSchema.parse({
      employeeId: '#EMP-2062',
      mobileLast5: '42062',
    });
    expect(valid.employeeId).toBe('EMP-2062');
    expect(valid.mobileLast5).toBe('42062');
  });

  it('validates activation verification with voucher', () => {
    const verified = mobileVerifyActivationSchema.parse({
      employeeId: '#emp-2062',
      voucherCode: ' hr-vouch-99 ',
      newPassword: 'MySecurePassword123!',
      deviceId: 'dev-1',
    });

    expect(verified.employeeId).toBe('EMP-2062');
    expect(verified.voucherCode).toBe('HR-VOUCH-99');
    expect(verified.newPassword).toBe('MySecurePassword123!');
  });
});

