import dotenv from 'dotenv';
import path from 'path';
import { z } from 'zod';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

const envSchema = z.object({
  DATABASE_URL: z.string().default('postgresql://neondb_owner:npg_OSq9RhvU3XCJ@ep-dry-math-ay78xymm-pooler.c-5.us-east-2.aws.neon.tech/neondb?sslmode=require'),
  PORT: z.string().default('5000'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  CLIENT_URL: z.string().default('http://localhost:5173'),
  SERVER_URL: z.string().default('http://localhost:5000'),
  JWT_ACCESS_SECRET: z.string().default('velozity_super_secret_access_key_2026_prod'),
  JWT_REFRESH_SECRET: z.string().default('velozity_super_secret_refresh_key_2026_prod'),
  ACCESS_TOKEN_EXPIRES_IN: z.string().default('15m'),
  REFRESH_TOKEN_EXPIRES_IN: z.string().default('7d'),
});

const parseResult = envSchema.safeParse(process.env);

if (!parseResult.success) {
  console.error('❌ Invalid environment variables:', parseResult.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parseResult.data;
