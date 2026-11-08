import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { parseEnv } from "node:util";

export const root = fileURLToPath(new URL("./", import.meta.url));

export function readEnv(directory) {
  const env = {};
  for (const name of [".env", ".env.local"]) {
    const path = resolve(directory, name);
    if (existsSync(path))
      Object.assign(env, parseEnv(readFileSync(path, "utf8")));
  }
  return env;
}

// Expo's standard local frontend port; no separate env setting is required.
export const expoDefaultPort = 8081;

export function selectedApiUrl(env, workspace) {
  const name = selectUrlName(env, workspace);
  let url;
  try {
    url = new URL(env[name]);
  } catch {
    throw new Error(`Set ${name} to a full URL in apps/${workspace}/.env.local.`);
  }
  if (!["http:", "https:"].includes(url.protocol))
    throw new Error(`${name} must be an HTTP or HTTPS URL.`);
  return { value: env[name], port: Number(url.port || (url.protocol === "https:" ? 443 : 80)) };
}

export function selectUrlName(env, workspace) {
  const { production } = env;
  if (production !== "true" && production !== "false") {
    throw new Error(
      `Set production=true or production=false in apps/${workspace}/.env.local.`,
    );
  }
  return production === "true" ? "PRODUCTION_API_URL" : "DEVELOPMENT_API_URL";
}
