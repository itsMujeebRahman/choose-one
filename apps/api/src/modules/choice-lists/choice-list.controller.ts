import { Hono, type Context } from "hono";
import { createAuth, type AuthBindings } from "../../auth";
import {
  createList,
  getList,
  getLists,
  ListError,
  pickFromList,
  manageList,
} from "./choice-list.service";

const uuid =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

type ChoiceListContext = Context<{
  Bindings: AuthBindings;
  Variables: { owner: string; isAnonymous: boolean };
}>;

export async function listChoiceLists(c: ChoiceListContext) {
  const lists = await getLists(c.env.DATABASE_URL!, c.get("owner"));
  return c.json(lists);
}

export async function createChoiceList(c: ChoiceListContext) {
  if (c.get("isAnonymous")) {
    throw new ListError("Sign in with an account to create Choice Lists.", 403);
  }
  const input = await c.req.json().catch(() => null);
  if (
    !input ||
    (input.id !== undefined &&
      (typeof input.id !== "string" || !uuid.test(input.id))) ||
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
  ) {
    throw new ListError(
      "Add a name and 3–20 options (up to 120 characters each).",
    );
  }
  const options = input.options.map((s: string) => s.trim());
  if (
    new Set(options.map((s: string) => s.toLowerCase())).size !== options.length
  ) {
    throw new ListError("Give each option a different name.");
  }
  const id = await createList(c.env.DATABASE_URL!, c.get("owner"), {
    id: input.id,
    title: input.title.trim(),
    options,
  });
  return c.json({ id }, 201);
}

export async function getChoiceListDetail(c: ChoiceListContext) {
  const id = c.req.param("id");
  if (!id || !uuid.test(id)) throw new ListError("Invalid list ID.");
  const list = await getList(c.env.DATABASE_URL!, c.get("owner"), id);
  return c.json(list);
}

export async function pickChoiceListOption(c: ChoiceListContext) {
  const id = c.req.param("id");
  const body = await c.req.json().catch(() => null);
  if (!id || !uuid.test(id)) {
    throw new ListError("Invalid list ID.");
  }
  if (
    body?.requestId !== undefined &&
    body?.requestId !== null &&
    (typeof body.requestId !== "string" || !uuid.test(body.requestId))
  ) {
    throw new ListError("Invalid pick request.");
  }
  if (
    body?.roundNumber !== undefined &&
    (!Number.isSafeInteger(body.roundNumber) || body.roundNumber < 1)
  )
    throw new ListError("Invalid round number.");
  const result = await pickFromList(
    c.env.DATABASE_URL!,
    c.get("owner"),
    id,
    body?.requestId,
    body?.roundNumber ?? 1,
  );
  return c.json(result);
}

export const choiceListController = new Hono<{
  Bindings: AuthBindings;
  Variables: { owner: string; isAnonymous: boolean };
}>();

choiceListController.onError((error, c) => {
  if (error instanceof ListError)
    return c.json({ message: error.message }, error.status);
  return c.json(
    { message: "Couldn’t load or save your list. Please try again." },
    503,
  );
});

choiceListController.use("*", async (c, next) => {
  c.header("Cache-Control", "no-store");
  if (!c.env.DATABASE_URL)
    return c.json({ message: "Database is not configured." }, 503);
  const session = await createAuth(c.env).api.getSession({
    headers: c.req.raw.headers,
  });
  const owner = session?.user.id;
  if (!owner)
    return c.json({ message: "Please sign in to use your lists." }, 401);
  c.set("owner", owner);
  c.set(
    "isAnonymous",
    Boolean(
      (session?.user as { isAnonymous?: boolean } | undefined)?.isAnonymous,
    ),
  );
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

choiceListController.get("/", listChoiceLists);
choiceListController.post("/", createChoiceList);
choiceListController.get("/:id", getChoiceListDetail);
choiceListController.post("/:id/pick", pickChoiceListOption);

async function manageChoiceList(
  c: ChoiceListContext,
  action: "rename" | "options" | "restart" | "delete",
) {
  if (c.get("isAnonymous"))
    throw new ListError("Sign in with an account to manage Choice Lists.", 403);
  const id = c.req.param("id");
  if (!id || !uuid.test(id)) throw new ListError("Invalid list ID.");
  const input = (await c.req.json().catch(() => null)) ?? {};
  if (
    action !== "delete" &&
    (!Number.isSafeInteger(input.revision) || input.revision < 0)
  )
    throw new ListError("Refresh this list before making changes.", 409);
  if (
    action === "restart" &&
    (!Number.isSafeInteger(input.roundNumber) || input.roundNumber < 1)
  )
    throw new ListError("Invalid round number.");
  if (
    action === "rename" &&
    (typeof input.title !== "string" ||
      !input.title.trim() ||
      input.title.trim().length > 100)
  )
    throw new ListError("Enter a list name between 1 and 100 characters.");
  if (
    action === "options" &&
    (!Array.isArray(input.options) ||
      input.options.length > 20 ||
      input.options.some((o: unknown) => {
        if (!o || typeof o !== "object") return true;
        const option = o as { id?: unknown; label?: unknown };
        return (
          typeof option.label !== "string" ||
          !option.label.trim() ||
          option.label.trim().length > 120 ||
          (option.id !== undefined &&
            (typeof option.id !== "string" || !uuid.test(option.id)))
        );
      }))
  )
    throw new ListError(
      "Provide valid unpicked options (up to 120 characters each).",
    );
  return c.json(
    await manageList(c.env.DATABASE_URL!, c.get("owner"), id, action, input),
  );
}
choiceListController.patch("/:id/title", (c) => manageChoiceList(c, "rename"));
choiceListController.put("/:id/options", (c) => manageChoiceList(c, "options"));
choiceListController.post("/:id/rounds", (c) => manageChoiceList(c, "restart"));
choiceListController.delete("/:id", (c) => manageChoiceList(c, "delete"));
