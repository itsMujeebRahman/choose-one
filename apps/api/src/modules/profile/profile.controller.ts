import type { Context } from "hono";
import type { AuthBindings } from "../../auth";
import { getCurrentProfile } from "./profile.service";

export async function getProfile(c: Context<{ Bindings: AuthBindings }>) {
  c.header("Cache-Control", "no-store");
  if (
    !c.env.DATABASE_URL ||
    !c.env.BETTER_AUTH_SECRET ||
    !c.env.BETTER_AUTH_URL
  )
    return c.json({ error: "Authentication is not configured." }, 503);
  try {
    const user = await getCurrentProfile(c.env, c.req.raw.headers);
    if (!user) return c.json({ error: "Please sign in." }, 401);
    return c.json({ user });
  } catch {
    return c.json(
      { error: "Couldn’t load your profile. Please try again." },
      503,
    );
  }
}
