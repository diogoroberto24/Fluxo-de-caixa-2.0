import { z } from "zod";

export const envSchema = z.object({
  // node
  NODE_ENV: z.string().optional().default("development"),

  // database
  DATABASE_URL: z.string(),
  DATABASE_HOST: z.string().optional(),
  DATABASE_PORT: z.string().optional(),
  DATABASE_USER: z.string().optional(),
  DATABASE_PASS: z.string().optional(),
  DATABASE_NAME: z.string().optional(),

  // auth
  JWT_ACCESS_PRIVATE_KEY: z.string(),
  JWT_ACCESS_PUBLIC_KEY: z.string(),
  JWT_ACCESS_EXPIRES_IN_HOURS: z.coerce.number().optional().default(1),
  JWT_REFRESH_PRIVATE_KEY: z.string(),
  JWT_REFRESH_PUBLIC_KEY: z.string(),
  JWT_REFRESH_EXPIRES_IN_HOURS: z.coerce.number().optional().default(336),

  // redis
  REDIS_HOST: z.string().optional().default("127.0.0.1"),
  REDIS_PORT: z.coerce.number().optional().default(6379),
  REDIS_DB: z.coerce.number().optional().default(0),
  REDIS_PASSWORD: z.string().optional(),

  // mail
  MAIL_HOST: z.string(),
  MAIL_PORT: z.coerce.number(),
  MAIL_USER: z.string(),
  MAIL_PASS: z.string(),
  MAIL_FROM: z.string(),
  MAIL_TLS: z.coerce.boolean().optional().default(true),
  MAIL_SECURE: z.coerce.boolean().optional().default(false),
  MAIL_PREVIEW: z.coerce.boolean().optional().default(false),
});

export type Env = z.infer<typeof envSchema>;
