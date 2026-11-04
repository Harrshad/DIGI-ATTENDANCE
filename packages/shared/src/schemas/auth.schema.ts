import { z } from 'zod';

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, 'Work email is required')
    .email('Please enter a valid work email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters long'),
});

export type LoginRequest = z.infer<typeof loginSchema>;
