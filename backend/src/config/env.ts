import dotenv from 'dotenv';
import path from 'path';
import { z } from 'zod';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const DEFAULT_DEV_JWT_SECRET = 'super_secret_jwt_signing_key_replace_in_production_min_32_chars';
const DEFAULT_DEV_DB_URL = 'postgresql://commpark_admin:commpark_secure_pass@localhost:5432/commpark_db?schema=public';

const envSchema = z.object({
  PORT: z.string().default('5000').transform((v) => parseInt(v, 10)),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  API_PREFIX: z.string().default('/api/v1'),
  DATABASE_URL: z.string().default(DEFAULT_DEV_DB_URL),
  USE_MEMORY_DB: z
    .string()
    .optional()
    .transform((v) => v === 'true' || process.env.NODE_ENV === 'test'),
  JWT_SECRET: z.string().min(16).default(DEFAULT_DEV_JWT_SECRET),
  JWT_EXPIRES_IN: z.string().default('7d'),
  BCRYPT_SALT_ROUNDS: z.string().default('10').transform((v) => parseInt(v, 10)),
  CORS_ORIGIN: z.string().default('*'),
  STORAGE_PROVIDER: z.enum(['local', 's3', 'supabase']).default('local'),
  STORAGE_LOCAL_DIR: z.string().default('./uploads'),
  RATE_LIMIT_WINDOW_MS: z.string().default('900000').transform((v) => parseInt(v, 10)),
  RATE_LIMIT_MAX_REQUESTS: z.string().default('100').transform((v) => parseInt(v, 10)),
});

export type EnvConfig = z.infer<typeof envSchema>;

export function loadAndValidateEnv(customEnv: Record<string, string | undefined> = process.env): EnvConfig {
  const result = envSchema.safeParse(customEnv);

  if (!result.success) {
    const errorDetails = result.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join(', ');
    throw new Error(`[Config Fatal] Invalid environment configuration: ${errorDetails}`);
  }

  const config = result.data;

  // Strict Production Validations
  if (config.NODE_ENV === 'production') {
    if (!customEnv.JWT_SECRET || config.JWT_SECRET === DEFAULT_DEV_JWT_SECRET || config.JWT_SECRET.length < 32) {
      throw new Error(
        '[Config Fatal] Production requires a secure, non-default JWT_SECRET of at least 32 characters.'
      );
    }

    if (!customEnv.DATABASE_URL || config.DATABASE_URL === DEFAULT_DEV_DB_URL) {
      throw new Error(
        '[Config Fatal] Production requires an explicit, configured production DATABASE_URL.'
      );
    }

    if (config.CORS_ORIGIN === '*') {
      throw new Error(
        '[Config Fatal] Insecure wildcard CORS_ORIGIN ("*") is prohibited in production.'
      );
    }
  }

  return config;
}

export const env = loadAndValidateEnv();
