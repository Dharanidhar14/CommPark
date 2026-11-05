import dotenv from 'dotenv';
import path from 'path';
import { z } from 'zod';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const envSchema = z.object({
  PORT: z.string().default('5000').transform((v) => parseInt(v, 10)),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  API_PREFIX: z.string().default('/api/v1'),
  DATABASE_URL: z
    .string()
    .default('postgresql://commpark_admin:commpark_secure_pass@localhost:5432/commpark_db?schema=public'),
  USE_MEMORY_DB: z
    .string()
    .optional()
    .transform((v) => v === 'true' || process.env.NODE_ENV === 'test'),
  JWT_SECRET: z.string().min(16).default('super_secret_jwt_signing_key_replace_in_production_min_32_chars'),
  JWT_EXPIRES_IN: z.string().default('7d'),
  BCRYPT_SALT_ROUNDS: z.string().default('10').transform((v) => parseInt(v, 10)),
  CORS_ORIGIN: z.string().default('*'),
  STORAGE_PROVIDER: z.enum(['local', 's3', 'supabase']).default('local'),
  STORAGE_LOCAL_DIR: z.string().default('./uploads'),
  RATE_LIMIT_WINDOW_MS: z.string().default('900000').transform((v) => parseInt(v, 10)),
  RATE_LIMIT_MAX_REQUESTS: z.string().default('100').transform((v) => parseInt(v, 10)),
});

export type EnvConfig = z.infer<typeof envSchema>;

let parsedEnv: EnvConfig;
try {
  parsedEnv = envSchema.parse(process.env);
} catch (error) {
  console.warn('[Config] Environment variables validation notice, falling back to safe defaults:', error);
  parsedEnv = envSchema.parse({});
}

export const env = parsedEnv;
