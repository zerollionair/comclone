import { z, ZodType } from 'zod';

export class UserValidation {
  private static RoleEnum = z.enum(['CUSTOMER', 'ADMIN']);

  static readonly REGISTER: ZodType = z.object({
    username: z.string().min(6).max(100),
    email: z.string().email(),
    password: z.string().min(6).max(100),
    role: this.RoleEnum,
  });

  static readonly LOGIN: ZodType = z.object({
    email: z.string().email(),
    password: z.string().min(6).max(100),
  });

  static readonly UPDATE: ZodType = z.object({
    username: z.string().min(6).max(100),
    email: z.string().email(),
  });

  static readonly RESET_PASSWORD: ZodType = z.object({
    password: z.string().min(6).max(100),
  });
}
