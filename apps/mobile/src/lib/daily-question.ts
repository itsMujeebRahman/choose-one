import { readColorPreference, writeColorPreference } from "./color-storage";

export const dailyQuestions = [
  // Name at beginning
  { id: "confused-about", text: "{name}, are you confused about anything?" },
  { id: "choosing-today", text: "{name}, what are we choosing today?" },
  { id: "ready-to-decide", text: "{name}, ready to make a little choice?" },
  { id: "two-minds", text: "{name}, in two minds about something?" },
  { id: "fresh-nudge", text: "Hey {name}, need a fresh perspective?" },

  // Name in the middle
  { id: "tell-me", text: "Tell me, {name}, what’s on your mind?" },
  { id: "so-deciding", text: "So, {name}, what are we figuring out?" },
  { id: "alright-choice", text: "Alright {name}, got a tough choice today?" },
  { id: "torn-between", text: "Are you, {name}, torn between good options?" },
  { id: "how-can-help", text: "How can we, {name}, make this choice easier?" },

  // Name at the end
  { id: "on-your-mind", text: "What’s on your mind, {name}?" },
  { id: "little-nudge", text: "Need a little nudge, {name}?" },
  { id: "stuck-between", text: "Stuck between options, {name}?" },
  { id: "cant-decide", text: "Can’t quite decide, {name}?" },
  { id: "little-decision", text: "What’s today’s little decision, {name}?" },
] as const;

export const TWELVE_HOURS_MS = 12 * 60 * 60 * 1000;

export function getTimeUntilNextQuestion(date = new Date()): number {
  try {
    const raw = readColorPreference("chooseone.daily-question");
    const saved = raw ? JSON.parse(raw) : null;
    if (typeof saved?.timestamp === "number") {
      const elapsed = date.getTime() - saved.timestamp;
      const remaining = TWELVE_HOURS_MS - elapsed;
      if (remaining > 0 && remaining <= TWELVE_HOURS_MS) {
        return remaining;
      }
    }
  } catch {
    /* fallback to 12 hours */
  }
  return TWELVE_HOURS_MS;
}

export function localDay(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export function dailyQuestion(name: string, date = new Date()) {
  const now = date.getTime();
  let index = 0;
  let shouldUpdateTimestamp = true;

  try {
    const raw = readColorPreference("chooseone.daily-question");
    const saved = raw ? JSON.parse(raw) : null;
    const previous = dailyQuestions.findIndex(
      (question) => question.id === saved?.id,
    );

    if (previous >= 0 && typeof saved?.timestamp === "number") {
      const elapsed = now - saved.timestamp;
      if (elapsed >= 0 && elapsed < TWELVE_HOURS_MS) {
        index = previous;
        shouldUpdateTimestamp = false;
      } else {
        const steps = Math.max(1, Math.floor(elapsed / TWELVE_HOURS_MS));
        index = (previous + steps) % dailyQuestions.length;
      }
    } else if (previous >= 0) {
      index = (previous + 1) % dailyQuestions.length;
    }
  } catch {
    /* Replace invalid preferences with the first greeting. */
  }

  const question = dailyQuestions[index];

  if (shouldUpdateTimestamp) {
    writeColorPreference(
      "chooseone.daily-question",
      JSON.stringify({ id: question.id, timestamp: now }),
    );
  }

  const rawName = name.trim().split(/\s+/)[0] || "friend";
  const formattedName = rawName.charAt(0).toUpperCase() + rawName.slice(1);
  return question.text.replace("{name}", formattedName);
}
