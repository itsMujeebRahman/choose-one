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
  production?: string;
  DEVELOPMENT_API_URL?: string;
  PRODUCTION_API_URL?: string;
  GOOGLE_CLIENT_ID?: string;
  GOOGLE_CLIENT_SECRET?: string;
  GOOGLE_AUTH_URL?: string;
  APPLE_CLIENT_ID?: string;
  APPLE_CLIENT_SECRET?: string;
};

export function apiUrl(env: AuthBindings) {
  if (env.production !== "true" && env.production !== "false")
    throw new Error("Set production=true or production=false in the API environment.");
  return env.production === "true" ? env.PRODUCTION_API_URL : env.DEVELOPMENT_API_URL;
}

export function allowedOrigins(env: AuthBindings) {
  const origins = new Set<string>();
  for (const value of [apiUrl(env), env.GOOGLE_AUTH_URL]) {
    if (value) origins.add(new URL(value).origin);
  }
  if (env.production === "false") {
    for (const host of ["localhost", "127.0.0.1", "[::1]", new URL(env.DEVELOPMENT_API_URL!).hostname]) {
      origins.add(`http://${host}:8081`);
    }
  }
  return [...origins];
}

export function createAuth(env: AuthBindings) {
  const baseURL = apiUrl(env);
  if (!env.DATABASE_URL || !env.BETTER_AUTH_SECRET || !baseURL) {
    throw new Error("Authentication environment is not configured.");
  }
  const googleRedirectURI =
    (env.GOOGLE_AUTH_URL
      ? `${env.GOOGLE_AUTH_URL.replace(/\/+$/, "")}/api/auth/callback/google`
      : undefined);

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
              ...(googleRedirectURI ? { redirectURI: googleRedirectURI } : {}),
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
      ...(env.GOOGLE_AUTH_URL ? [env.GOOGLE_AUTH_URL] : []),
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
