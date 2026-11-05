import { neon } from "@neondatabase/serverless";
import { readMigrationFiles } from "drizzle-orm/migrator";
const url = process.env.DATABASE_URL_UNPOOLED;
if (!url || new URL(url).hostname.includes("-pooler")) {
  throw new Error(
    "Set DATABASE_URL_UNPOOLED to a direct Neon connection for migrations.",
  );
}
const sql = neon(url);
await sql`CREATE SCHEMA IF NOT EXISTS drizzle`;
await sql`CREATE TABLE IF NOT EXISTS drizzle.__drizzle_migrations (id SERIAL PRIMARY KEY, hash text NOT NULL, created_at bigint)`;
const [latest] =
  await sql`SELECT created_at FROM drizzle.__drizzle_migrations ORDER BY created_at DESC LIMIT 1`;
const migrations = readMigrationFiles({
  migrationsFolder: new URL("../drizzle", import.meta.url).pathname,
});
for (const migration of migrations) {
  if (latest && Number(latest.created_at) >= migration.folderMillis) continue;
  // Commit each migration's DDL and its Drizzle journal entry together.
  await sql.transaction([
    ...migration.sql
      .filter((query) => query.trim())
      .map((query) => sql.query(query)),
    sql`INSERT INTO drizzle.__drizzle_migrations(hash, created_at) VALUES (${migration.hash}, ${migration.folderMillis})`,
  ]);
}
console.log("Database migrations applied.");
