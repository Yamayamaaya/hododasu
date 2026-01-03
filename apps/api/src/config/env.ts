import { config } from 'dotenv';
import { resolve } from 'path';

// .env.localファイルを読み込む（一度だけ実行）
config({ path: resolve(process.cwd(), '.env.local') });

// 環境変数の検証と型安全なアクセス
export const env = {
  PORT: Number(process.env.PORT) || 8787,
  DATABASE_URL_POOLED: process.env.DATABASE_URL_POOLED || '',
  DATABASE_URL_DIRECT: process.env.DATABASE_URL_DIRECT || '',
} as const;

// 必須環境変数の検証
if (!env.DATABASE_URL_POOLED) {
  throw new Error('DATABASE_URL_POOLED environment variable is required');
}

if (!env.DATABASE_URL_DIRECT) {
  throw new Error('DATABASE_URL_DIRECT environment variable is required');
}

