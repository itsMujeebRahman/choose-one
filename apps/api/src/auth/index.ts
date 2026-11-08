import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { expo } from "@better-auth/expo";
import { anonymous } from "better-auth/plugins";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "../database/schema";

export type AuthBindings = {
  DATABASE_URL?: string;
  BETTER_AUTH_SECRET?: string;
  BETTER_AUTH_URL?: string;
  CORS_ORIGINS?: string;
  GOOGLE_CLIENT_ID?: string;
  GOOGLE_CLIENT_SECRET?: string;
  GOOGLE_AUTH_URL?: string;
  GOOGLE_REDIRECT_URI?: string;
  APPLE_CLIENT_ID?: string;
  APPLE_CLIENT_SECRET?: string;
  LOCAL_PREVIEW_USER_ID?: string;
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
  const googleRedirectURI =
    env.GOOGLE_REDIRECT_URI ||
    (env.GOOGLE_AUTH_URL
      ? `${env.GOOGLE_AUTH_URL.replace(/\/+$/, "")}/api/auth/callback/google`
      : undefined);

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
      expo(),
    ],
  });
}
