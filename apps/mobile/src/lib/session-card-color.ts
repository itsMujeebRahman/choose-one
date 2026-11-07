import { readColorPreference, writeColorPreference } from "./color-storage";
import { type ThemeColors } from "../theme/tokens";

const paletteKeys = [
  "peachLight",
  "lavender",
  "mint",
  "yellow",
  "blue",
  "coral",
] as const;
let activeSession: string | null = null;
let colorIndex = -1;
let restored = false;

// Keep the card colour stable across screen mounts and session refreshes.
export function sessionCardColor(
  sessionId: string,
  createdAt: Date | string,
  colors: ThemeColors,
) {
  if (!restored) {
    restored = true;
    try {
      const saved = JSON.parse(
        readColorPreference("chooseone.main-card-color") ?? "null",
      );
      if (
        saved &&
        typeof saved.session === "string" &&
        Number.isInteger(saved.index) &&
        saved.index >= 0 &&
        saved.index < paletteKeys.length
      ) {
        activeSession = saved.session;
        colorIndex = saved.index;
      }
    } catch {
      /* Ignore invalid stored preferences. */
    }
  }
  const key = `${sessionId}:${new Date(createdAt).getTime()}`;
  if (key !== activeSession) {
    const step = 1 + Math.floor(Math.random() * (paletteKeys.length - 1));
    colorIndex = (colorIndex + step) % paletteKeys.length;
    activeSession = key;
    writeColorPreference(
      "chooseone.main-card-color",
      JSON.stringify({ session: key, index: colorIndex }),
    );
  }
  return colors[paletteKeys[colorIndex]];
}
