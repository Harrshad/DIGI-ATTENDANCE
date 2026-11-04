import { z } from 'zod';

export const createLocationSchema = z.object({
  name: z.string().trim().min(2, 'Location name is required (e.g. BLR-4)'),
  city: z.string().trim().min(2, 'City is required (e.g. Bangalore)'),
  address: z.string().trim().min(5, 'Full address is required'),
  radiusMeters: z.number().positive('Allowed area radius must be greater than 0').default(500),
  latitude: z.number().min(-90).max(90, 'Valid latitude coordinate is required'),
  longitude: z.number().min(-180).max(180, 'Valid longitude coordinate is required'),
  assignedEmployeeIds: z.array(z.string()).default([]),
});

export type CreateLocationRequest = z.infer<typeof createLocationSchema>;
