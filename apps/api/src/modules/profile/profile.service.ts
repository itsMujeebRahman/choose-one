import { createAuth, type AuthBindings } from "../../auth";

export async function getCurrentProfile(env: AuthBindings, headers: Headers) {
  const session = await createAuth(env).api.getSession({ headers });
  return session?.user ?? null;
}
