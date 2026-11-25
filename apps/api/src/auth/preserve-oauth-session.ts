import type { BetterAuthPlugin } from "better-auth";
import { createAuthMiddleware } from "better-auth/api";
import { parseSetCookieHeader, setSessionCookie } from "better-auth/cookies";

export function preserveOAuthSession(): BetterAuthPlugin {
  return {
    id: "preserve-oauth-session",
    hooks: {
      after: [
        {
          matcher: (ctx) => Boolean(ctx.path?.startsWith("/callback/")),
          handler: createAuthMiddleware(async (ctx) => {
            const session = ctx.context.newSession;
            if (!session) return;
            const token = parseSetCookieHeader(
              ctx.context.responseHeaders?.get("set-cookie") ?? "",
            ).get(ctx.context.authCookies.sessionToken.name);
            if (!token?.value || Number(token["max-age"]) === 0) {
              // Reissue only the session this successful OAuth callback created.
              // Requests without a new session retain their normal failure behavior.
              await setSessionCookie(ctx, session);
            }
          }),
        },
      ],
    },
  };
}
