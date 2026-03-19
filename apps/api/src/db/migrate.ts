import { env } from '../config/env';
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';

const directClient = postgres(env.DATABASE_URL_DIRECT);
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
