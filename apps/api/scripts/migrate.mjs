import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { migrate } from "drizzle-orm/neon-http/migrator";
const url = process.env.DATABASE_URL_UNPOOLED;
if (!url || new URL(url).hostname.includes("-pooler")) {
  throw new Error(
    "Set DATABASE_URL_UNPOOLED to a direct Neon connection for migrations.",
  );
}
await migrate(drizzle(neon(url)), {
  migrationsFolder: new URL("../drizzle", import.meta.url).pathname,
});
console.log("Auth migrations applied.");
