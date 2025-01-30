import { z, ZodType } from 'zod';

export class UserValidation {
  static readonly REGISTER: ZodType = z.object({
    username: z.string().min(6).max(100),
    email: z.string().email(),
    password: z.string().min(6).max(100),
  });

  static readonly LOGIN: ZodType = z.object({
    email: z.string().email(),
    password: z.string().min(6).max(100),
  });

  static readonly GET: ZodType = z.string().min(4).max(100);

  static readonly UPDATE: ZodType = z.object({
    username: z.string().min(6).max(100).optional(),
    email: z.string().email().optional(),
  });

  static readonly RESET_PASSWORD: ZodType = z.object({
    password: z.string().min(6).max(100),
  });
}
