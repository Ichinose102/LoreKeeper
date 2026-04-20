import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import { resolve } from 'path';

const sqlite = new Database('lorekeeper.db');
sqlite.pragma('journal_mode = WAL');

const db = drizzle(sqlite);

const migrationsFolder = resolve(__dirname, '../drizzle/migrations');

console.log('Running migrations...');
migrate(db, { migrationsFolder });
console.log('Migrations completed successfully!');

sqlite.close();
