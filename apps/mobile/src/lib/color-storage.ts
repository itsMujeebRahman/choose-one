import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";

const memory = new Map<string, string>();
export function readColorPreference(key: string): string | null {
  try {
    const value =
      Platform.OS === "web"
        ? typeof window === "undefined"
          ? null
          : window.localStorage.getItem(key)
        : SecureStore.getItem(key);
    return value ?? memory.get(key) ?? null;
  } catch {
    return memory.get(key) ?? null;
  }
}
export function writeColorPreference(key: string, value: string) {
  memory.set(key, value);
  try {
    if (Platform.OS === "web") {
      if (typeof window !== "undefined")
        window.localStorage.setItem(key, value);
    } else SecureStore.setItem(key, value);
  } catch {
    // Cosmetic preferences can still work in memory if storage is unavailable.
  }
}
export function storedAnswerColorIndex(count: number) {
  const stored = readColorPreference("chooseone.answer-color");
  const index = stored === null ? -1 : Number(stored);
  return Number.isInteger(index) && index >= 0 && index < count ? index : -1;
}
export function nextAnswerColorIndex(count: number) {
  const index = (storedAnswerColorIndex(count) + 1) % count;
  writeColorPreference("chooseone.answer-color", String(index));
  return index;
}
