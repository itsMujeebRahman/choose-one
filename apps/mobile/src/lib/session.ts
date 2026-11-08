import { useEffect, useMemo, useSyncExternalStore } from "react";
import { AppState, Platform } from "react-native";
import { authClient } from "./auth-client";
import {
  clearGuestName,
  getGuestName,
  subscribeGuestName,
} from "./guest-storage";

export function useAppSession() {
  const result = authClient.useSession();
  const guestName = useSyncExternalStore(
    subscribeGuestName,
    getGuestName,
    () => null,
  );

  const { refetch } = result;

  useEffect(() => {
    const handleCheck = () => {
      void refetch();
    };

    if (Platform.OS === "web") {
      if (typeof window !== "undefined") {
        window.addEventListener("focus", handleCheck);
        window.addEventListener("storage", handleCheck);
        return () => {
          window.removeEventListener("focus", handleCheck);
          window.removeEventListener("storage", handleCheck);
        };
      }
    } else {
      const sub = AppState.addEventListener("change", (state) => {
        if (state === "active") handleCheck();
      });
      return () => sub.remove();
    }
  }, [refetch]);

  const enhancedData = useMemo(() => {
    if (!result.data) return result.data;
    if (result.data.user.isAnonymous) {
      return {
        ...result.data,
        user: {
          ...result.data.user,
          name: guestName ?? result.data.user.name,
          nameConfirmed: Boolean(guestName),
        },
      };
    }
    return result.data;
  }, [result.data, guestName]);

  return {
    ...result,
    data: enhancedData,
  };
}

export async function endSession() {
  clearGuestName();
  return authClient.signOut();
}
