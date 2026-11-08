import { createRequire } from "node:module";
import { resolve } from "node:path";
import { root, selectedApiUrl } from "../../env.config.mjs";

const require = createRequire(resolve(root, "apps/api/package.json"));
const { unstable_startWorker: startWorker } = require("wrangler");
if (process.argv.length > 2) {
  throw new Error(
    "The local API runner does not accept extra arguments. Configure apps/api/.env.local instead.",
  );
}
const apiUrl = selectedApiUrl(process.env, "api");
const worker = await startWorker({
  config: resolve(root, "apps/api/wrangler.jsonc"),
  bindings: Object.fromEntries(
    ["production", "DEVELOPMENT_API_URL", "PRODUCTION_API_URL", "DATABASE_URL",
      "DATABASE_URL_UNPOOLED", "BETTER_AUTH_SECRET", "GOOGLE_CLIENT_ID",
      "GOOGLE_CLIENT_SECRET", "GOOGLE_AUTH_URL", "APPLE_CLIENT_ID", "APPLE_CLIENT_SECRET"]
      .filter((name) => process.env[name] !== undefined)
      .map((name) => [name, { type: "secret_text", value: process.env[name] }]),
  ),
  dev: {
    remote: false,
    server: { hostname: "0.0.0.0", port: apiUrl.port },
    inspector: false,
  },
});
await worker.ready;
console.log(`Local API listening on port ${apiUrl.port}; configured URL: ${apiUrl.value}`);
for (const signal of ["SIGINT", "SIGTERM"]) {
  process.once(signal, async () => {
    await worker.dispose();
    process.exit(0);
  });
}
