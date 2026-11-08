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

export function readApiUrl(env, workspace) {
  let url;
  try {
    url = new URL(env.API_URL);
  } catch {
    throw new Error(
      `Set API_URL to a full URL in apps/${workspace}/.env.local.`,
    );
  }
  if (!["http:", "https:"].includes(url.protocol))
    throw new Error("API_URL must be an HTTP or HTTPS URL.");
  return {
    value: env.API_URL,
    port: Number(url.port || (url.protocol === "https:" ? 443 : 80)),
  };
}
