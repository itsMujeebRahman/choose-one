import { eq } from "drizzle-orm";
import { createAuth, type AuthBindings } from "../../auth";
import { getDb, user } from "../../database";
import { localPreviewOwner } from "../../lib/preview-owner";

export async function getCurrentProfile(
  env: AuthBindings,
  headers: Headers,
  request?: Request,
) {
  const preview = request ? localPreviewOwner(env, request) : null;
  if (preview) {
    if (env.DATABASE_URL) {
      try {
        const db = getDb(env.DATABASE_URL);
        const [existing] = await db
          .select()
          .from(user)
          .where(eq(user.id, preview));
        if (existing) return existing;
      } catch {
        // Fall back to preview dummy if db fails
      }
    }
    return {
      id: preview,
      name: "Max",
      email: "max@example.com",
      image: null,
      nameConfirmed: true,
      emailVerified: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  if (!env.BETTER_AUTH_SECRET || !env.BETTER_AUTH_URL) return null;
  const session = await createAuth(env).api.getSession({ headers });
  return session?.user ?? null;
}

export async function updateUserProfile(
  env: AuthBindings,
  headers: Headers,
  updates: { name?: string; image?: string | null },
  request?: Request,
) {
  const preview = request ? localPreviewOwner(env, request) : null;
  let userId: string | null = null;

  if (preview) {
    userId = preview;
  } else {
    if (!env.BETTER_AUTH_SECRET || !env.BETTER_AUTH_URL) return null;
    const auth = createAuth(env);
    const session = await auth.api.getSession({ headers });
    userId = session?.user?.id ?? null;
  }

  if (!userId) return null;
  if (!env.DATABASE_URL) throw new Error("Database is not configured.");

  const db = getDb(env.DATABASE_URL);
  const updateFields: {
    name?: string;
    image?: string | null;
    updatedAt: Date;
  } = {
    updatedAt: new Date(),
  };

  if (typeof updates.name === "string" && updates.name.trim()) {
    updateFields.name = updates.name.trim();
  }
  if (updates.image !== undefined) {
    updateFields.image = updates.image;
  }

  if (preview) {
    const [upserted] = await db
      .insert(user)
      .values({
        id: userId,
        name: updateFields.name ?? "Max",
        email: "max@example.com",
        emailVerified: true,
        image: updateFields.image ?? null,
        createdAt: new Date(),
        updatedAt: updateFields.updatedAt,
      })
      .onConflictDoUpdate({
        target: user.id,
        set: updateFields,
      })
      .returning();
    return upserted ?? null;
  }

  const [updated] = await db
    .update(user)
    .set(updateFields)
    .where(eq(user.id, userId))
    .returning();

  return updated ?? null;
}
