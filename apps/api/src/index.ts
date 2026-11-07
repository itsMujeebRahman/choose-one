import { Hono } from "hono";
import { cors } from "hono/cors";
import { checkDatabase } from "./database";
import { allowedOrigins, createAuth, type AuthBindings } from "./auth";
import { problemController } from "./modules/problems/problem.controller";
import { profileController } from "./modules/profile/profile.controller";
import { choiceListController } from "./modules/choice-lists/choice-list.controller";

const app = new Hono<{ Bindings: AuthBindings }>();
app.use("*", async (c, next) =>
  cors({
    origin: allowedOrigins(c.env),
    allowMethods: ["GET", "POST", "PATCH", "PUT", "OPTIONS"],
    allowHeaders: [
      "Content-Type",
      "Authorization",
      "expo-origin",
      "x-skip-oauth-proxy",
      "x-auth-preview",
    ],
    credentials: true,
  })(c, next),
);
app.get("/", (c) => c.text("Choose One API"));
app.get("/health", (c) => c.json({ ok: true }));
app.get("/api/database", (c) => checkDatabase(c.env.DATABASE_URL));
app.route("/api", problemController);
app.route("/api", profileController);
app.route("/api/choice-lists", choiceListController);
app.on(["GET", "POST"], "/api/auth/*", async (c) => {
  if (
    !c.env.DATABASE_URL ||
    !c.env.BETTER_AUTH_SECRET ||
    !c.env.BETTER_AUTH_URL
  ) {
    return c.json({ message: "Authentication is not configured." }, 503);
  }
  if (c.req.path === "/api/auth/sign-in/social") {
    const body = await c.req.raw
      .clone()
      .json()
      .catch(() => null);
    if (
      body?.provider === "google" &&
      (!c.env.GOOGLE_CLIENT_ID || !c.env.GOOGLE_CLIENT_SECRET)
    ) {
      return c.json(
        {
          message:
            "Google sign-in is not configured. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in the API environment.",
        },
        503,
      );
    }
    if (
      body?.provider === "apple" &&
      (!c.env.APPLE_CLIENT_ID || !c.env.APPLE_CLIENT_SECRET)
    ) {
      return c.json(
        {
          message:
            "Apple sign-in is not configured. Set APPLE_CLIENT_ID and APPLE_CLIENT_SECRET in the API environment.",
        },
        503,
      );
    }
  }
  return createAuth(c.env).handler(c.req.raw);
});
app.notFound((c) => c.json({ error: "Not found." }, 404));
app.onError((_, c) => c.json({ error: "Internal server error." }, 500));
export default app;
