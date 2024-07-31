import { ZodType, z } from "zod";

export class UserValidation {
  static readonly REGISTER: ZodType = z.object({
    name: z.string().min(1).max(100),
    email: z.string().email(),
    password: z.string().min(1),
    confirmPassword: z.string().min(1),
  });

  static readonly LOGIN: ZodType = z.object({
    email: z.string().email(),
    password: z.string().min(1),
  });

  static readonly UPDATE: ZodType = z.object({
    name: z.string().min(1).max(20).optional(),
    email: z.string().email().optional(),
    password: z.string().min(1).optional(),
    token: z.string().min(1),
  });
}
