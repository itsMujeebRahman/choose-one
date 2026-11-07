import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";

const GUEST_NAME_KEY = "chooseone.guest_name";
const memory = new Map<string, string>();
const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((listener) => listener());
}

if (Platform.OS === "web" && typeof window !== "undefined") {
  window.addEventListener("storage", (event) => {
    if (!event.key || event.key === GUEST_NAME_KEY) {
      if (!window.localStorage.getItem(GUEST_NAME_KEY)) {
        memory.delete(GUEST_NAME_KEY);
        notify();
      }
    }
  });
}

export function getGuestName(): string | null {
  try {
    if (Platform.OS === "web") {
      if (typeof window === "undefined") return memory.get(GUEST_NAME_KEY) ?? null;
      const value = window.localStorage.getItem(GUEST_NAME_KEY);
      if (!value) {
        memory.delete(GUEST_NAME_KEY);
        return null;
      }
      return value;
    }
    const value = SecureStore.getItem(GUEST_NAME_KEY);
    return value ?? memory.get(GUEST_NAME_KEY) ?? null;
  } catch {
    return memory.get(GUEST_NAME_KEY) ?? null;
  }
}

export function setGuestName(name: string) {
  memory.set(GUEST_NAME_KEY, name);
  try {
    if (Platform.OS === "web") {
      if (typeof window !== "undefined") {
        window.localStorage.setItem(GUEST_NAME_KEY, name);
      }
    } else {
      SecureStore.setItem(GUEST_NAME_KEY, name);
    }
  } catch {
    /* fallback to memory */
  }
  notify();
}

export function clearGuestName() {
  memory.delete(GUEST_NAME_KEY);
  try {
    if (Platform.OS === "web") {
      if (typeof window !== "undefined") {
        window.localStorage.removeItem(GUEST_NAME_KEY);
      }
    } else {
      SecureStore.deleteItemAsync(GUEST_NAME_KEY);
    }
  } catch {
    /* fallback to memory */
  }
  notify();
}

export function subscribeGuestName(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

const GUEST_DISMISS_KEY = "chooseone.guest_card_dismissed_at";
const TWELVE_HOURS_MS = 12 * 60 * 60 * 1000;

export function shouldShowGuestPromo(): boolean {
  try {
    const raw =
      Platform.OS === "web"
        ? typeof window === "undefined"
          ? null
          : window.localStorage.getItem(GUEST_DISMISS_KEY)
        : SecureStore.getItem(GUEST_DISMISS_KEY);
    if (!raw) return true;
    const dismissedAt = Number(raw);
    if (isNaN(dismissedAt)) return true;
    return Date.now() - dismissedAt >= TWELVE_HOURS_MS;
  } catch {
    return true;
  }
}

export function dismissGuestPromo() {
  const now = String(Date.now());
  try {
    if (Platform.OS === "web") {
      if (typeof window !== "undefined") {
        window.localStorage.setItem(GUEST_DISMISS_KEY, now);
      }
    } else {
      SecureStore.setItem(GUEST_DISMISS_KEY, now);
    }
  } catch {
    /* fallback */
  }
}
