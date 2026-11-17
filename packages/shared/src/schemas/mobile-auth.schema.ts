import { z } from 'zod';

/**
 * Sanitizes input employee ID (e.g. "#EMP-2062" -> "EMP-2062")
 */
export const sanitizeEmployeeId = (input: string): string => {
  return input.trim().replace(/^#/, '').toUpperCase();
};

/**
 * Mobile Login Request DTO
 */
export const mobileLoginSchema = z.object({
  employeeId: z.string().min(1, 'Employee ID is required').transform(sanitizeEmployeeId),
  password: z.string().min(1, 'Password is required'),
  deviceId: z.string().min(1, 'Device ID is required'),
  deviceModel: z.string().default('Generic Mobile Device'),
  osVersion: z.string().default('Android'),
  appVersion: z.string().default('1.0.2'),
  platform: z.enum(['ANDROID', 'IOS']).default('ANDROID'),
  fcmToken: z.string().optional().nullable(),
});

export type MobileLoginInput = z.infer<typeof mobileLoginSchema>;

/**
 * Mobile Account Activation Request (Step 1)
 */
export const mobileActivationRequestSchema = z.object({
  employeeId: z.string().min(1, 'Employee ID is required').transform(sanitizeEmployeeId),
  mobileLast5: z.string().regex(/^\d{5}$/, 'Last 5 digits of mobile must be exactly 5 numbers'),
});

export type MobileActivationRequestInput = z.infer<typeof mobileActivationRequestSchema>;

/**
 * Mobile Account Activation Verification (Step 2 - with HR Voucher)
 */
export const mobileVerifyActivationSchema = z.object({
  employeeId: z.string().min(1, 'Employee ID is required').transform(sanitizeEmployeeId),
  voucherCode: z.string().min(4, 'HR Voucher code is required').trim().toUpperCase(),
  newPassword: z.string().min(8, 'Password must be at least 8 characters long'),
  deviceId: z.string().min(1, 'Device ID is required'),
  deviceModel: z.string().default('Generic Mobile Device'),
  osVersion: z.string().default('Android'),
  appVersion: z.string().default('1.0.2'),
  platform: z.enum(['ANDROID', 'IOS']).default('ANDROID'),
});

export type MobileVerifyActivationInput = z.infer<typeof mobileVerifyActivationSchema>;

/**
 * Mobile Forgot Password Request
 */
export const mobileForgotPasswordSchema = z.object({
  employeeId: z.string().min(1, 'Employee ID is required').transform(sanitizeEmployeeId),
});

export type MobileForgotPasswordInput = z.infer<typeof mobileForgotPasswordSchema>;

/**
 * Mobile Token Refresh Request
 */
export const mobileRefreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
  deviceId: z.string().min(1, 'Device ID is required'),
});

export type MobileRefreshTokenInput = z.infer<typeof mobileRefreshTokenSchema>;

