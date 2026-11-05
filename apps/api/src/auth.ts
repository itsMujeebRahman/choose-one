import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { expo } from "@better-auth/expo";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./db/schema";

export type AuthBindings = {
  DATABASE_URL?: string;
  BETTER_AUTH_SECRET?: string;
  BETTER_AUTH_URL?: string;
  CORS_ORIGINS?: string;
  GOOGLE_CLIENT_ID?: string;
  GOOGLE_CLIENT_SECRET?: string;
  APPLE_CLIENT_ID?: string;
  APPLE_CLIENT_SECRET?: string;
};
export function allowedOrigins(env: AuthBindings) {
  return (env.CORS_ORIGINS ?? "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
}
export function createAuth(env: AuthBindings) {
  if (!env.DATABASE_URL || !env.BETTER_AUTH_SECRET || !env.BETTER_AUTH_URL) {
    throw new Error("Authentication environment is not configured.");
  }
  return betterAuth({
    appName: "Choose One",
    baseURL: env.BETTER_AUTH_URL,
    secret: env.BETTER_AUTH_SECRET,
    database: drizzleAdapter(drizzle(env.DATABASE_URL, { schema }), {
      provider: "pg",
      schema,
      transaction: false,
    }),
    emailAndPassword: { enabled: false },
    socialProviders: {
      ...(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET ? {
        google: { clientId: env.GOOGLE_CLIENT_ID, clientSecret: env.GOOGLE_CLIENT_SECRET },
      } : {}),
      ...(env.APPLE_CLIENT_ID && env.APPLE_CLIENT_SECRET ? {
        apple: { clientId: env.APPLE_CLIENT_ID, clientSecret: env.APPLE_CLIENT_SECRET },
      } : {}),
    },
    user: { additionalFields: {
      nameConfirmed: { type: "boolean", defaultValue: false, required: false, input: true },
    } },
    trustedOrigins: ["chooseone://", "chooseone://*", "https://appleid.apple.com", ...allowedOrigins(env)],
    plugins: [expo()],
  });
}
