import { spawn } from "node:child_process";
import { createRequire } from "node:module";
import { createServer } from "node:net";
import { networkInterfaces } from "node:os";
import { resolve } from "node:path";
import { readEnv, readPorts, readUrlName, root } from "./env.config.mjs";

const [workspace, ...forwarded] = process.argv.slice(2);
const command = workspace === "mobile" ? (forwarded.shift() ?? "start") : "dev";
const args = forwarded;
if (!["api", "mobile"].includes(workspace))
  throw new Error("Choose the api or mobile workspace.");
const cwd = resolve(root, "apps", workspace);
const env = { ...readEnv(cwd), ...process.env };
const urlName = readUrlName();
if (!env[urlName]) throw new Error(`Set ${urlName} in apps/${workspace}/.env.local.`);
const ports = readPorts();
const require = createRequire(resolve(cwd, "package.json"));
if (args.some((arg) => /^--(?:port|inspector-port)(?:=|$)/.test(arg))) {
  throw new Error(
    "Configure DEVELOPMENT_API_URL in the API env and mobile in the mobile env, not CLI arguments.",
  );
}
const listenPort = ports[workspace];
if (command !== "export" && !args.includes("--help")) {
  // Fail if occupied instead of allowing Expo to offer a different port.
  await new Promise((resolveCheck, reject) => {
    const server = createServer();
    server.once("error", (error) =>
      reject(error.code === "EADDRINUSE"
        ? new Error(`Configured port ${listenPort} is already in use.`)
        : error),
    );
    server.listen(Number(listenPort), () => server.close(resolveCheck));
  });
}
let cli;
let cliArgs;
if (workspace === "api") {
  env.BETTER_AUTH_URL = env[urlName];
  const hosts = new Set(["localhost", "127.0.0.1", "[::1]"]);
  for (const addresses of Object.values(networkInterfaces())) {
    for (const address of addresses ?? []) {
      if (address.family === "IPv4") hosts.add(address.address);
    }
  }
  env.CORS_ORIGINS = [...hosts]
    .map((host) => `http://${host}:${ports.mobile}`).join(",");
  env.api = ports.api;
  cli = resolve(root, "apps/api/dev.mjs");
  cliArgs = args;
} else {
  // Expo requires EXPO_PUBLIC_ for values embedded into the mobile bundle.
  env.EXPO_PUBLIC_API_URL = env[urlName];
  cli = require.resolve("expo/bin/cli");
  cliArgs = command === "export" ? [command, ...args] : [command, "--port", listenPort, ...args];
}
const child = spawn(process.execPath, [cli, ...cliArgs], {
  cwd,
  env,
  stdio: "inherit",
});
for (const signal of ["SIGINT", "SIGTERM"])
  process.on(signal, () => child.kill(signal));
child.on("error", (error) => {
  console.error(error.message);
  process.exitCode = 1;
});
child.on("exit", (code) => {
  process.exitCode = code ?? 1;
});
