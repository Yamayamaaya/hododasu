import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import { config } from 'dotenv';
import { resolve } from 'path';

// .env.localファイルを読み込む
config({ path: resolve(process.cwd(), '.env.local') });

const directClient = postgres(process.env.DATABASE_URL_DIRECT || '');
const db = drizzle(directClient);

async function runMigrations() {
  try {
    console.log('🔄 Running migrations...');
    await migrate(db, { migrationsFolder: './drizzle' });
    console.log('✅ Migrations completed successfully');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await directClient.end();
  }
}

runMigrations();

