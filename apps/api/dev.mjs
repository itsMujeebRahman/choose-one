import { createRequire } from "node:module";
import { resolve } from "node:path";
import { root } from "../../env.config.mjs";

const require = createRequire(resolve(root, "apps/api/package.json"));
const { unstable_startWorker: startWorker } = require("wrangler");
if (process.argv.length > 2) {
  throw new Error("The local API runner does not accept extra arguments. Configure apps/api/.env.local instead.");
}
const worker = await startWorker({
  config: resolve(root, "apps/api/wrangler.jsonc"),
  bindings: {
    BETTER_AUTH_URL: { type: "plain_text", value: process.env.BETTER_AUTH_URL },
    CORS_ORIGINS: { type: "plain_text", value: process.env.CORS_ORIGINS },
  },
  dev: {
    remote: false,
    server: { hostname: "0.0.0.0", port: Number(process.env.api) },
    inspector: false,
  },
});
await worker.ready;
console.log(`API ready at http://localhost:${process.env.api}`);
for (const signal of ["SIGINT", "SIGTERM"]) {
  process.once(signal, async () => {
    await worker.dispose();
    process.exit(0);
  });
}
