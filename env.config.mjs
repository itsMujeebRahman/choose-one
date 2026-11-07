import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { parseEnv } from "node:util";

export const root = fileURLToPath(new URL("./", import.meta.url));

export function readEnv(directory) {
  const env = {};
  for (const name of [".env", ".env.local"]) {
    const path = resolve(directory, name);
    if (existsSync(path)) Object.assign(env, parseEnv(readFileSync(path, "utf8")));
  }
  return env;
}

export function readPorts() {
  const apiEnv = { ...readEnv(resolve(root, "apps/api")), ...process.env };
  const mobileEnv = { ...readEnv(resolve(root, "apps/mobile")), ...process.env };
  const url = new URL(apiEnv.DEVELOPMENT_API_URL);
  if (!["http:", "https:"].includes(url.protocol))
    throw new Error("DEVELOPMENT_API_URL must be an HTTP or HTTPS URL.");
  const ports = {
    api: url.port || (url.protocol === "https:" ? "443" : "80"),
    mobile: mobileEnv.mobile,
  };
  if (!ports.mobile || !/^\d+$/.test(ports.mobile) || Number(ports.mobile) < 1 || Number(ports.mobile) > 65535)
    throw new Error("Set mobile to a valid port in apps/mobile/.env.local.");
  ports.mobile = String(Number(ports.mobile));
  if (ports.api === ports.mobile) throw new Error("API and mobile must use different ports.");
  return ports;
}

export function selectUrlName(source) {
  const { production } = parseEnv(source);
  if (production !== "true" && production !== "false") {
    throw new Error("Set production=true or production=false in the root dev.variable file.");
  }
  return production === "true" ? "PRODUCTION_API_URL" : "DEVELOPMENT_API_URL";
}

export function readUrlName() {
  return selectUrlName(readFileSync(new URL("./dev.variable", import.meta.url), "utf8"));
}
