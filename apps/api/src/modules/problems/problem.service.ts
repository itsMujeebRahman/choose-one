import { and, desc, eq, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/neon-http";
import { problem, problemOption, user } from "../../database";
import { chooseRandomOption } from "../../lib/random-choice";

export class ChoiceConflict extends Error {}
export type SaveProblemInput = {
  title: string;
  options: string[];
  requestId: string;
};
type SaveProblemArgs = {
  connectionString: string;
  userId: string;
  input: SaveProblemInput;
  isPreview?: boolean;
};

export async function saveProblemChoice({
  connectionString,
  userId: ownerId,
  input,
  isPreview: preview = false,
}: SaveProblemArgs) {
  const { title, options, requestId } = input;
  const db = drizzle(connectionString);
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(JSON.stringify({ title, options })),
  );
  const fingerprint = Array.from(new Uint8Array(digest), (byte) =>
    byte.toString(16).padStart(2, "0"),
  ).join("");
  async function findExisting() {
    const [existing] = await db
      .select({
        problemId: problem.id,
        metadata: problem.metadata,
        optionId: problemOption.id,
        option: problemOption.label,
        order: problemOption.sortOrder,
        selectedOrder: problemOption.selectedOrder,
      })
      .from(problem)
      .innerJoin(
        problemOption,
        and(
          eq(problem.id, problemOption.problemId),
          eq(problemOption.isSelected, true),
        ),
      )
      .where(and(eq(problem.id, requestId), eq(problem.userId, ownerId)))
      .orderBy(problemOption.selectedOrder)
      .limit(1);
    if (!existing) return null;
    if (existing.metadata.submission !== fingerprint)
      throw new ChoiceConflict(
        "This request was already used with different options. Please start a new choice.",
      );
    return {
      problemId: existing.problemId,
      optionId: existing.optionId,
      option: existing.option,
      selectedOrder: existing.selectedOrder,
      index: existing.order - 1,
    };
  }
  const existing = await findExisting();
  if (existing) return existing;
  const chosen = chooseRandomOption(options);
  const now = new Date();
  const rows = options.map((label, index) => ({
    id: crypto.randomUUID(),
    problemId: requestId,
    userId: ownerId,
    label,
    sortOrder: index + 1,
    isSelected: index === chosen.index,
    selectedOrder: index === chosen.index ? 1 : null,
    metadata:
      index === chosen.index
        ? {
            selection: {
              algorithm: "crypto_uniform_v1",
              chosenAt: now.toISOString(),
              metadata: { optionCount: options.length },
            },
          }
        : {},
  }));
  const writes = [
    db.insert(problem).values({
      id: requestId,
      userId: ownerId,
      title,
      status: "chosen",
      chosenAt: now,
      metadata: {
        submission: fingerprint,
        source: preview ? "local-preview" : "app",
      },
    }),
    db.insert(problemOption).values(rows),
  ] as const;
  try {
    // Neon HTTP batch executes all statements as one database transaction.
    if (preview) {
      await db.batch([
        db
          .insert(user)
          .values({
            id: ownerId,
            name: "Max",
            email: `${ownerId}@preview.invalid`,
            nameConfirmed: true,
          })
          .onConflictDoNothing({ target: user.id }),
        ...writes,
      ]);
    } else await db.batch(writes);
  } catch (error) {
    // A concurrent duplicate submission may have committed while this one waited.
    const replay = await findExisting();
    if (replay) return replay;
    throw error;
  }
  return {
    problemId: requestId,
    optionId: rows[chosen.index].id,
    selectedOrder: 1,
    ...chosen,
  };
}

export async function getProblemHistory(
  connectionString: string,
  userId: string,
) {
  const db = drizzle(connectionString);
  return db
    .select({
      id: problem.id,
      title: problem.title,
      selectedOption: problemOption.label,
      optionCount: sql<number>`(
        select count(*)::int
        from ${problemOption}
        where ${problemOption.problemId} = ${problem.id}
      )`,
      createdAt: problem.createdAt,
      chosenAt: problem.chosenAt,
    })
    .from(problem)
    .leftJoin(
      problemOption,
      and(
        eq(problemOption.problemId, problem.id),
        eq(problemOption.isSelected, true),
      ),
    )
    .where(eq(problem.userId, userId))
    .orderBy(desc(problem.createdAt));
}

export async function getProblemDetail(
  connectionString: string,
  userId: string,
  problemId: string,
) {
  const db = drizzle(connectionString);
  const [choice] = await db
    .select({
      id: problem.id,
      title: problem.title,
      createdAt: problem.createdAt,
      chosenAt: problem.chosenAt,
    })
    .from(problem)
    .where(and(eq(problem.id, problemId), eq(problem.userId, userId)))
    .limit(1);
  if (!choice) return null;
  const options = await db
    .select({
      id: problemOption.id,
      label: problemOption.label,
      sortOrder: problemOption.sortOrder,
      isSelected: problemOption.isSelected,
      selectedOrder: problemOption.selectedOrder,
    })
    .from(problemOption)
    .where(eq(problemOption.problemId, problemId))
    .orderBy(problemOption.sortOrder);
  return { ...choice, options };
}
