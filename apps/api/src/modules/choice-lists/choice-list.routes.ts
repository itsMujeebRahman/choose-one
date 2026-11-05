import { Hono } from "hono";
import { createAuth, type AuthBindings } from "../../auth";
import { localPreviewOwner } from "../../lib/preview-owner";
import {
  createList,
  getList,
  getLists,
  ListError,
  pickFromList,
} from "./choice-list.service";
const uuid =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
export const choiceListRoutes = new Hono<{
  Bindings: AuthBindings;
  Variables: { owner: string; preview: boolean };
}>();
choiceListRoutes.onError((error, c) => {
  if (error instanceof ListError)
    return c.json({ message: error.message }, error.status);
  return c.json(
    { message: "Couldn’t load or save your list. Please try again." },
    503,
  );
});
choiceListRoutes.use("*", async (c, next) => {
  c.header("Cache-Control", "no-store");
  if (!c.env.DATABASE_URL)
    return c.json({ message: "Database is not configured." }, 503);
  const preview = localPreviewOwner(c.env, c.req.raw);
  const session = preview
    ? null
    : await createAuth(c.env).api.getSession({ headers: c.req.raw.headers });
  const owner = preview ?? session?.user.id;
  if (!owner)
    return c.json({ message: "Please sign in to use your lists." }, 401);
  c.set("owner", owner);
  c.set("preview", !!preview);
  try {
    await next();
  } catch (error) {
    if (error instanceof ListError)
      return c.json({ message: error.message }, error.status);
    return c.json(
      { message: "Couldn’t load or save your list. Please try again." },
      503,
    );
  }
});
choiceListRoutes.get("/", async (c) =>
  c.json(await getLists(c.env.DATABASE_URL!, c.get("owner"))),
);
choiceListRoutes.post("/", async (c) => {
  const input = await c.req.json().catch(() => null);
  if (
    !input ||
    typeof input.id !== "string" ||
    !uuid.test(input.id) ||
    typeof input.title !== "string" ||
    !input.title.trim() ||
    input.title.trim().length > 100 ||
    !Array.isArray(input.options) ||
    input.options.length < 3 ||
    input.options.length > 20 ||
    input.options.some(
      (s: unknown) =>
        typeof s !== "string" || !s.trim() || s.trim().length > 120,
    )
  )
    throw new ListError(
      "Add a name and 3–20 options (up to 120 characters each).",
    );
  const options = input.options.map((s: string) => s.trim());
  if (
    new Set(options.map((s: string) => s.toLowerCase())).size !== options.length
  )
    throw new ListError("Give each option a different name.");
  const id = await createList(
    c.env.DATABASE_URL!,
    c.get("owner"),
    { id: input.id, title: input.title.trim(), options },
    c.get("preview"),
  );
  return c.json({ id }, 201);
});
choiceListRoutes.get("/:id", async (c) => {
  if (!uuid.test(c.req.param("id"))) throw new ListError("Invalid list ID.");
  return c.json(
    await getList(c.env.DATABASE_URL!, c.get("owner"), c.req.param("id")),
  );
});
choiceListRoutes.post("/:id/pick", async (c) => {
  const body = await c.req.json().catch(() => null);
  if (
    !uuid.test(c.req.param("id")) ||
    typeof body?.requestId !== "string" ||
    !uuid.test(body.requestId)
  )
    throw new ListError("Invalid pick request.");
  return c.json(
    await pickFromList(
      c.env.DATABASE_URL!,
      c.get("owner"),
      c.req.param("id"),
      body.requestId,
    ),
  );
});
