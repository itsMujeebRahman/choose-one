import type { Context } from "hono";
import { createAuth, type AuthBindings } from "../../auth";
import { localPreviewOwner } from "../../lib/preview-owner";
import {
  ChoiceConflict,
  getProblemDetail,
  getProblemHistory,
  saveProblemChoice,
  type SaveProblemInput,
} from "./problem.service";
import { parseProblemInput } from "./problem.validation";

type ProblemContext = Context<{ Bindings: AuthBindings }>;

async function resolveOwner(c: ProblemContext) {
  const previewOwner = localPreviewOwner(c.env, c.req.raw);
  if (previewOwner) return { userId: previewOwner, preview: true };
  const session = await createAuth(c.env).api.getSession({
    headers: c.req.raw.headers,
  });
  return { userId: session?.user.id ?? null, preview: false };
}

export async function createProblemChoice(c: ProblemContext) {
  c.header("Cache-Control", "no-store");
  if (!c.env.DATABASE_URL)
    return c.json({ message: "Database is not configured." }, 503);
  const owner = await resolveOwner(c);
  if (!owner.userId)
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
      userId: owner.userId,
      input,
      isPreview: owner.preview,
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

export async function listProblemHistory(c: ProblemContext) {
  c.header("Cache-Control", "no-store");
  if (!c.env.DATABASE_URL)
    return c.json({ message: "Database is not configured." }, 503);
  try {
    const owner = await resolveOwner(c);
    if (!owner.userId)
      return c.json({ message: "Please sign in to view your history." }, 401);
    return c.json(
      await getProblemHistory(c.env.DATABASE_URL, owner.userId),
    );
  } catch {
    return c.json(
      { message: "Couldn’t load your history. Please try again." },
      503,
    );
  }
}

export async function getProblemHistoryDetail(c: ProblemContext) {
  c.header("Cache-Control", "no-store");
  if (!c.env.DATABASE_URL)
    return c.json({ message: "Database is not configured." }, 503);
  try {
    const owner = await resolveOwner(c);
    if (!owner.userId)
      return c.json({ message: "Please sign in to view your history." }, 401);
    const id = c.req.param("id");
    if (!id) return c.json({ message: "Choice not found." }, 404);
    const choice = await getProblemDetail(
      c.env.DATABASE_URL,
      owner.userId,
      id,
    );
    if (!choice) return c.json({ message: "Choice not found." }, 404);
    return c.json(choice);
  } catch {
    return c.json(
      { message: "Couldn’t load this choice. Please try again." },
      503,
    );
  }
}
