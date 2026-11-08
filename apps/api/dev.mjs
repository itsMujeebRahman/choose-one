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
  bindings: Object.fromEntries(Object.entries({
    BETTER_AUTH_URL: { type: "plain_text", value: apiUrl.value },
    CORS_ORIGINS: { type: "plain_text", value: process.env.CORS_ORIGINS },
    DATABASE_URL: { type: "plain_text", value: process.env.DATABASE_URL },
    DATABASE_URL_UNPOOLED: {
      type: "plain_text",
      value: process.env.DATABASE_URL_UNPOOLED,
    },
    BETTER_AUTH_SECRET: {
      type: "plain_text",
      value: process.env.BETTER_AUTH_SECRET,
    },
    GOOGLE_CLIENT_ID: {
      type: "plain_text",
      value: process.env.GOOGLE_CLIENT_ID,
    },
    GOOGLE_CLIENT_SECRET: {
      type: "plain_text",
      value: process.env.GOOGLE_CLIENT_SECRET,
    },
    GOOGLE_AUTH_URL: {
      type: "plain_text",
      value: process.env.GOOGLE_AUTH_URL,
    },
    GOOGLE_REDIRECT_URI: {
      type: "plain_text",
      value: process.env.GOOGLE_REDIRECT_URI,
    },
  }).filter(([, binding]) => binding.value !== undefined)),
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
