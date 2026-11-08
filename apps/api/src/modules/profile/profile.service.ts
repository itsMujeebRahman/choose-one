import { eq } from "drizzle-orm";
import { apiUrl, createAuth, type AuthBindings } from "../../auth";
import { getDb, user } from "../../database";

export async function getCurrentProfile(
  env: AuthBindings,
  headers: Headers,
  _request?: Request,
) {

  if (!env.BETTER_AUTH_SECRET || !apiUrl(env)) return null;
  const session = await createAuth(env).api.getSession({ headers });
  return session?.user ?? null;
}

export async function updateUserProfile(
  env: AuthBindings,
  headers: Headers,
  updates: { name?: string; image?: string | null },
  _request?: Request,
) {
  if (!env.BETTER_AUTH_SECRET || !apiUrl(env)) return null;
  const session = await createAuth(env).api.getSession({ headers });
  const userId = session?.user?.id;

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


  const [updated] = await db
    .update(user)
    .set(updateFields)
    .where(eq(user.id, userId))
    .returning();

  return updated ?? null;
}
