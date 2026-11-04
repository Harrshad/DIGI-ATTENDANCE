import { z } from 'zod';

export const escalateExceptionSchema = z.object({
  note: z
    .string()
    .trim()
    .min(3, 'A descriptive note is required for supervisor escalation (e.g. Client visit confirmed)'),
  supervisorId: z.string().optional(),
});

export type EscalateExceptionRequest = z.infer<typeof escalateExceptionSchema>;

export const resolveExceptionSchema = z
  .object({
    decision: z.enum(['APPROVE', 'REJECT']),
    note: z.string().trim().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.decision === 'REJECT' && (!data.note || data.note.length < 3)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['note'],
        message: 'A note is required when rejecting an exception record',
      });
    }
  });

export type ResolveExceptionRequest = z.infer<typeof resolveExceptionSchema>;

export const downloadRecordSchema = z.object({
  dateRangeStart: z.string().min(1, 'Start date is required'),
  dateRangeEnd: z.string().min(1, 'End date is required'),
  locationId: z.string().default('all'),
  employeeScope: z.string().default('all'),
  status: z.string().default('all'),
  format: z.enum(['CSV', 'PDF']).default('CSV'),
});

export type DownloadRecordRequest = z.infer<typeof downloadRecordSchema>;
