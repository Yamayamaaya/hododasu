import { defineConfig } from 'drizzle-kit';
import { config } from 'dotenv';
import { resolve } from 'path';

// .env.localファイルを読み込む
config({ path: resolve(process.cwd(), '.env.local') });

if (!process.env.DATABASE_URL_DIRECT) {
  throw new Error('DATABASE_URL_DIRECT environment variable is not set');
}

export default defineConfig({
  schema: './src/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL_DIRECT,
  },
});

