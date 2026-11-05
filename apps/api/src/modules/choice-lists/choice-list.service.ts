import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { and, desc, eq } from "drizzle-orm";
import { choiceList, choiceListOption, user } from "../../db/schema";

export class ListError extends Error {
  constructor(
    message: string,
    public status: 400 | 404 | 409 = 400,
  ) {
    super(message);
  }
}
export async function createList(
  url: string,
  owner: string,
  input: { id: string; title: string; options: string[] },
  preview: boolean,
) {
  const db = drizzle(url);
  const [existing] = await db
    .select()
    .from(choiceList)
    .where(and(eq(choiceList.id, input.id), eq(choiceList.userId, owner)));
  if (existing) {
    const options = await db
      .select()
      .from(choiceListOption)
      .where(eq(choiceListOption.listId, input.id))
      .orderBy(choiceListOption.sortOrder);
    if (
      existing.title !== input.title ||
      JSON.stringify(options.map((o) => o.label)) !==
        JSON.stringify(input.options)
    )
      throw new ListError(
        "This request was already used. Please start a new list.",
        409,
      );
    return input.id;
  }
  const writes = [
    db
      .insert(choiceList)
      .values({
        id: input.id,
        title: input.title,
        userId: owner,
        optionCount: input.options.length,
      }),
    db
      .insert(choiceListOption)
      .values(
        input.options.map((label, index) => ({
          listId: input.id,
          label,
          sortOrder: index + 1,
        })),
      ),
  ] as const;
  if (preview)
    await db.batch([
      db
        .insert(user)
        .values({
          id: owner,
          name: "Max",
          email: `${owner}@preview.invalid`,
          nameConfirmed: true,
        })
        .onConflictDoNothing(),
      ...writes,
    ]);
  else await db.batch(writes);
  return input.id;
}
export async function getLists(url: string, owner: string) {
  const db = drizzle(url);
  return db
    .select({
      id: choiceList.id,
      title: choiceList.title,
      pickCount: choiceList.pickCount,
      optionCount: choiceList.optionCount,
      createdAt: choiceList.createdAt,
      updatedAt: choiceList.updatedAt,
      latestResult: choiceListOption.label,
      latestSelectedAt: choiceListOption.selectedAt,
    })
    .from(choiceList)
    .leftJoin(
      choiceListOption,
      and(
        eq(choiceList.id, choiceListOption.listId),
        eq(choiceList.pickCount, choiceListOption.selectedOrder),
      ),
    )
    .where(eq(choiceList.userId, owner))
    .orderBy(desc(choiceList.updatedAt))
    .limit(100);
}
export async function getList(url: string, owner: string, id: string) {
  const db = drizzle(url);
  const [list] = await db
    .select()
    .from(choiceList)
    .where(and(eq(choiceList.id, id), eq(choiceList.userId, owner)));
  if (!list) throw new ListError("Choice list not found.", 404);
  const options = await db
    .select()
    .from(choiceListOption)
    .where(eq(choiceListOption.listId, id))
    .orderBy(choiceListOption.sortOrder);
  return { ...list, options };
}
export async function pickFromList(
  url: string,
  owner: string,
  id: string,
  requestId: string,
) {
  const sql = neon(url);
  // Serializable transactions prevent simultaneous requests from choosing the same
  // remaining option or assigning the same pick sequence. Retry serialization races.
  for (let attempt = 0; attempt < 4; attempt++) {
    try {
      const [rows] = await sql.transaction(
        [
          sql`WITH existing AS (
          SELECT o.id, o.label, o.selected_order FROM choice_list_option o
          JOIN choice_list l ON l.id=o.list_id
          WHERE l.id=${id} AND l.user_id=${owner} AND o.pick_request_id=${requestId}
        ), advanced AS (
          UPDATE choice_list SET pick_count=pick_count+1, updated_at=now()
          WHERE id=${id} AND user_id=${owner} AND pick_count<option_count AND NOT EXISTS (SELECT 1 FROM existing)
          RETURNING id, pick_count
        ), candidate AS MATERIALIZED (
          SELECT o.id, a.pick_count FROM advanced a CROSS JOIN LATERAL (
            SELECT id FROM choice_list_option WHERE list_id=a.id AND selected_order IS NULL ORDER BY random() LIMIT 1
          ) o
        ), picked AS (
          UPDATE choice_list_option SET selected_order=a.pick_count, selected_at=now(), pick_request_id=${requestId}
          FROM candidate a WHERE choice_list_option.id=a.id AND choice_list_option.selected_order IS NULL
          RETURNING choice_list_option.id, label, selected_order
        ) SELECT * FROM existing UNION ALL SELECT * FROM picked`,
        ],
        { isolationLevel: "Serializable" },
      );
      if (!rows.length) {
        const list = await getList(url, owner, id);
        throw new ListError(
          list.pickCount >= list.optionCount
            ? "You’ve tried every option in this list."
            : "Please try your pick again.",
          409,
        );
      }
      return rows[0];
    } catch (error) {
      if ((error as { code?: string }).code === "40001" && attempt < 3)
        continue;
      throw error;
    }
  }
  throw new ListError("Please try your pick again.", 409);
}
