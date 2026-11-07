import { existsSync, readFileSync, rmSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { parseEnv } from "node:util";
import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { spawnSync } from "node:child_process";
import { neon } from "@neondatabase/serverless";

const __dirname = dirname(fileURLToPath(import.meta.url));
const apiDir = resolve(__dirname, "..");

// Auto-load env files if not loaded via --env-file
for (const envFile of [".env", ".env.local"]) {
  const fullPath = resolve(apiDir, envFile);
  if (existsSync(fullPath)) {
    try {
      const parsed = parseEnv(readFileSync(fullPath, "utf8"));
      for (const [key, val] of Object.entries(parsed)) {
        if (!process.env[key]) {
          process.env[key] = val;
        }
      }
    } catch {
      // Ignore unparseable env
    }
  }
}

const args = process.argv.slice(2);

if (args.includes("--help") || args.includes("-h")) {
  console.log(`
Choose One - Database Wipe Utility

Usage:
  npm run db:wipe                  Truncate all tables (preserves schema)
  npm run db:wipe -- --yes         Skip confirmation prompt
  npm run db:reset                 Drop schemas and re-apply migrations from scratch
  npm run db:reset -- --yes        Drop schemas and re-migrate without confirmation

Options:
  --drop, --reset   Drop schemas and re-apply all migrations
  -y, --yes, --force Skip interactive confirmation
  -h, --help        Show this help message
`);
  process.exit(0);
}

const isHardReset = args.includes("--drop") || args.includes("--reset");
const isForced =
  args.includes("--yes") || args.includes("-y") || args.includes("--force");

const connectionString =
  process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL;

if (!connectionString) {
  console.error(
    "❌ Error: DATABASE_URL or DATABASE_URL_UNPOOLED is not configured.",
  );
  console.error(
    "Please ensure your database connection string is set in apps/api/.env.local",
  );
  process.exit(1);
}

let host = "database";
try {
  host = new URL(connectionString).host;
} catch {
  // Ignore URL parse error
}

console.log("\n⚠️  Choose One - Database Wipe Utility");
console.log(`Target: ${host}`);
console.log(
  `Action: ${isHardReset ? "DROP all schemas and re-run migrations from scratch" : "TRUNCATE all data in all tables (keeps schema intact)"}\n`,
);

if (!isForced && input.isTTY) {
  const rl = readline.createInterface({ input, output });
  const answer = await rl.question(
    `Are you sure you want to proceed? This will permanently delete data! (y/N): `,
  );
  rl.close();
  if (!/^y(es)?$/i.test(answer.trim())) {
    console.log("Operation cancelled.");
    process.exit(0);
  }
}

const sql = neon(connectionString);

if (isHardReset) {
  console.log("\n🗑️  Dropping public and drizzle schemas...");
  await sql`DROP SCHEMA IF EXISTS public CASCADE;`;
  await sql`CREATE SCHEMA public;`;
  await sql`DROP SCHEMA IF EXISTS drizzle CASCADE;`;
  console.log("✓ Schemas dropped.");

  console.log("\n🚀 Re-applying migrations...");
  const migrateScript = resolve(__dirname, "migrate.mjs");
  const result = spawnSync(process.execPath, [migrateScript], {
    cwd: apiDir,
    env: process.env,
    stdio: "inherit",
  });

  if (result.status !== 0) {
    console.error("❌ Migration failed after drop.");
    process.exit(result.status ?? 1);
  }
  console.log("\n✨ Database reset and migrations applied successfully!");
} else {
  console.log("\n🔍 Finding application tables...");
  const tables = await sql`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
    ORDER BY table_name;
  `;

  if (!tables.length) {
    console.log("ℹ️  No tables found in public schema.");
    process.exit(0);
  }

  const tableNames = tables.map((t) => t.table_name);
  console.log(`Found ${tableNames.length} table(s): ${tableNames.join(", ")}`);

  console.log("🧹 Truncating tables...");
  const quotedList = tableNames.map((t) => `"${t}"`).join(", ");
  await sql.query(`TRUNCATE TABLE ${quotedList} RESTART IDENTITY CASCADE;`);

  console.log(
    "\n✨ All tables wiped clean (0 records remaining). Schema preserved!",
  );
}

clearLocalStorageAndCaches();

function clearLocalStorageAndCaches() {
  console.log("\n🧹 Clearing local development storage and caches...");

  const cacheDirs = [
    resolve(apiDir, "../mobile/.expo/web/cache"),
    resolve(apiDir, "../mobile/node_modules/.cache"),
    resolve(apiDir, ".wrangler/state"),
  ];

  for (const dir of cacheDirs) {
    if (existsSync(dir)) {
      try {
        rmSync(dir, { recursive: true, force: true });
        console.log(`✓ Cleared cache: ${dir.split("/choose-one/")[1] ?? dir}`);
      } catch {
        // Ignore cache cleanup errors
      }
    }
  }

  if (process.platform === "darwin") {
    const browsers = [
      {
        name: "Google Chrome",
        script: (target) =>
          `tell application "Google Chrome" to repeat with w in windows\nrepeat with t in tabs of w\nif URL of t starts with "${target}" then tell t to execute javascript "localStorage.clear(); sessionStorage.clear(); location.reload();"\nend repeat\nend repeat`,
      },
      {
        name: "Safari",
        script: (target) =>
          `tell application "Safari" to repeat with w in windows\nrepeat with t in tabs of w\nif URL of t starts with "${target}" then tell t to do JavaScript "localStorage.clear(); sessionStorage.clear(); location.reload();"\nend repeat\nend repeat`,
      },
      {
        name: "Arc",
        script: (target) =>
          `tell application "Arc" to repeat with w in windows\nrepeat with t in tabs of w\nif URL of t starts with "${target}" then tell t to execute javascript "localStorage.clear(); sessionStorage.clear(); location.reload();"\nend repeat\nend repeat`,
      },
      {
        name: "Brave Browser",
        script: (target) =>
          `tell application "Brave Browser" to repeat with w in windows\nrepeat with t in tabs of w\nif URL of t starts with "${target}" then tell t to execute javascript "localStorage.clear(); sessionStorage.clear(); location.reload();"\nend repeat\nend repeat`,
      },
    ];

    for (const b of browsers) {
      try {
        spawnSync("osascript", ["-e", b.script("http://localhost:8081")], {
          stdio: "ignore",
        });
        spawnSync("osascript", ["-e", b.script("http://localhost:3000")], {
          stdio: "ignore",
        });
      } catch {
        // Ignore AppleScript execution failures
      }
    }
  }

  console.log("✓ Local storage cleared!");
}
