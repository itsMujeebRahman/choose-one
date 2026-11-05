import { readColorPreference, writeColorPreference } from "./color-storage";

export const dailyQuestions = [
  { id: "bothering", text: "What’s bothering you, {name}?" },
  { id: "on-your-mind", text: "What’s on your mind, {name}?" },
  { id: "little-nudge", text: "Need a little nudge, {name}?" },
  { id: "figuring-out", text: "What are we figuring out today, {name}?" },
  { id: "tough-choice", text: "Got a tough choice, {name}?" },
  { id: "between-options", text: "Stuck between options, {name}?" },
  { id: "make-easier", text: "What can we make easier, {name}?" },
  { id: "cant-decide", text: "Can’t quite decide, {name}?" },
  { id: "little-decision", text: "What’s today’s little decision, {name}?" },
  { id: "help-choosing", text: "What do you need help choosing, {name}?" },
] as const;

export function localDay(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export function dailyQuestion(name: string, date = new Date()) {
  const today = localDay(date);
  let index = 0;
  try {
    const saved = JSON.parse(
      readColorPreference("chooseone.daily-question") ?? "null",
    );
    const previous = dailyQuestions.findIndex(
      (question) => question.id === saved?.id,
    );
    if (previous >= 0)
      index =
        saved.date === today
          ? previous
          : (previous + 1) % dailyQuestions.length;
  } catch {
    /* Replace invalid preferences with the first greeting. */
  }
  const question = dailyQuestions[index];
  writeColorPreference(
    "chooseone.daily-question",
    JSON.stringify({ id: question.id, date: today }),
  );
  return question.text.replace(
    "{name}",
    name.trim().split(/\s+/)[0] || "friend",
  );
}
