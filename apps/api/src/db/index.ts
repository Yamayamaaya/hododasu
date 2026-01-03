import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import * as schema from './schema';

// Pooled接続（通常運用用）
const pooledClient = postgres(process.env.DATABASE_URL_POOLED || '', {
  max: 10,
});

export const db = drizzle(pooledClient, { schema });

// Direct接続（マイグレーション用）
export const getDirectClient = () => {
  return postgres(process.env.DATABASE_URL_DIRECT || '');
};

