import { Hono, type Context } from "hono";
import type { AuthBindings } from "../../auth";
import { getCurrentProfile, updateUserProfile } from "./profile.service";

type ProfileContext = Context<{ Bindings: AuthBindings }>;

export async function getProfile(c: ProfileContext) {
  c.header("Cache-Control", "no-store");
  try {
    const user = await getCurrentProfile(c.env, c.req.raw.headers, c.req.raw);
    if (!user) return c.json({ error: "Please sign in." }, 401);
    return c.json({ user });
  } catch {
    return c.json(
      { error: "Couldn’t load your profile. Please try again." },
      503,
    );
  }
}

export async function updateProfile(c: ProfileContext) {
  c.header("Cache-Control", "no-store");
  const body = await c.req.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return c.json({ error: "Invalid profile update data." }, 400);
  }

  const { name, image } = body as { name?: unknown; image?: unknown };

  if (name !== undefined) {
    if (typeof name !== "string" || !name.trim()) {
      return c.json({ error: "Please provide a valid name." }, 400);
    }
    if (name.trim().length > 100) {
      return c.json({ error: "Name must be 100 characters or fewer." }, 400);
    }
  }

  if (image !== undefined && image !== null) {
    if (typeof image !== "string") {
      return c.json({ error: "Invalid image format." }, 400);
    }
    // Limit to 5MB data URLs or web URLs
    if (image.length > 5 * 1024 * 1024) {
      return c.json({ error: "Image is too large (max 5MB)." }, 400);
    }
  }

  try {
    const updated = await updateUserProfile(
      c.env,
      c.req.raw.headers,
      {
        name: typeof name === "string" ? name.trim() : undefined,
        image:
          typeof image === "string" ? image : image === null ? null : undefined,
      },
      c.req.raw,
    );
    if (!updated) return c.json({ error: "Please sign in." }, 401);
    return c.json({ user: updated });
  } catch {
    return c.json(
      { error: "Couldn’t update your profile. Please try again." },
      503,
    );
  }
}

export const profileController = new Hono<{ Bindings: AuthBindings }>();
profileController.get("/profile", getProfile);
profileController.get("/me", getProfile);
profileController.patch("/profile", updateProfile);
profileController.post("/profile", updateProfile);
profileController.put("/profile", updateProfile);
