import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { expo } from "@better-auth/expo";
import { anonymous } from "better-auth/plugins";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "../database/schema";
import { preserveOAuthSession } from "./preserve-oauth-session";

export type AuthBindings = {
  DATABASE_URL?: string;
  BETTER_AUTH_SECRET?: string;
  API_URL?: string;
  GOOGLE_CLIENT_ID?: string;
  GOOGLE_CLIENT_SECRET?: string;
  APPLE_CLIENT_ID?: string;
  APPLE_CLIENT_SECRET?: string;
};

export function apiUrl(env: AuthBindings) {
  return env.API_URL;
}

export function allowedOrigins(env: AuthBindings) {
  const baseURL = apiUrl(env);
  const origins = new Set<string>();
  if (baseURL) {
    const url = new URL(baseURL);
    origins.add(url.origin);
    if (url.protocol === "http:") origins.add(`http://${url.hostname}:8081`);
  }
  for (const host of ["localhost", "127.0.0.1", "[::1]"])
    origins.add(`http://${host}:8081`);
  return [...origins];
}

export function createAuth(env: AuthBindings) {
  const baseURL = apiUrl(env);
  if (!env.DATABASE_URL || !env.BETTER_AUTH_SECRET || !baseURL) {
    throw new Error("Authentication environment is not configured.");
  }
  return betterAuth({
    appName: "Choose One",
    baseURL,
    secret: env.BETTER_AUTH_SECRET,
    database: drizzleAdapter(drizzle(env.DATABASE_URL, { schema }), {
      provider: "pg",
      schema,
      transaction: false,
    }),
    emailAndPassword: { enabled: false },
    socialProviders: {
      ...(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET
        ? {
            google: {
              clientId: env.GOOGLE_CLIENT_ID,
              clientSecret: env.GOOGLE_CLIENT_SECRET,
            },
          }
        : {}),
      ...(env.APPLE_CLIENT_ID && env.APPLE_CLIENT_SECRET
        ? {
            apple: {
              clientId: env.APPLE_CLIENT_ID,
              clientSecret: env.APPLE_CLIENT_SECRET,
            },
          }
        : {}),
    },
    user: {
      additionalFields: {
        nameConfirmed: {
          type: "boolean",
          defaultValue: false,
          required: false,
          input: true,
        },
      },
    },
    trustedOrigins: [
      "chooseone://",
      "chooseone://*",
      "https://appleid.apple.com",
      ...allowedOrigins(env),
    ],
    plugins: [
      anonymous({
        emailDomainName: "guest.chooseone.app",
        generateName: () => "Guest",
      }),
      preserveOAuthSession(),
      expo(),
    ],
  });
}
