import type { Context } from "hono";
import { createAuth, type AuthBindings } from "../../auth";
import { localPreviewOwner } from "../../lib/preview-owner";
import {
  ChoiceConflict,
  saveProblemChoice,
  type SaveProblemInput,
} from "./problem.service";
import { parseProblemInput } from "./problem.validation";

export async function createProblemChoice(
  c: Context<{ Bindings: AuthBindings }>,
) {
  c.header("Cache-Control", "no-store");
  if (!c.env.DATABASE_URL)
    return c.json({ message: "Database is not configured." }, 503);
  const previewOwner = localPreviewOwner(c.env, c.req.raw);
  const session = previewOwner
    ? null
    : await createAuth(c.env).api.getSession({ headers: c.req.raw.headers });
  const userId = session?.user.id ?? previewOwner;
  if (!userId)
    return c.json(
      { message: "Please sign in before choosing an option." },
      401,
    );

  let input: SaveProblemInput;
  try {
    input = parseProblemInput(await c.req.json().catch(() => null));
  } catch (error) {
    return c.json(
      { message: error instanceof Error ? error.message : "Invalid options." },
      400,
    );
  }

  try {
    const choice = await saveProblemChoice({
      connectionString: c.env.DATABASE_URL,
      userId,
      input,
      isPreview: !!previewOwner,
    });
    return c.json(choice);
  } catch (error) {
    if (error instanceof ChoiceConflict)
      return c.json({ message: error.message }, 409);
    return c.json(
      { message: "Couldn’t save your choice. Please try again." },
      503,
    );
  }
}
