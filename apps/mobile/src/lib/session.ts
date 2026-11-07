import { useMemo, useSyncExternalStore } from "react";
import { authClient } from "./auth-client";
import { previewSession } from "./preview-session";
import {
  clearGuestName,
  getGuestName,
  subscribeGuestName,
} from "./guest-storage";

// Local UI fixture; choice persistence uses a separate, local-only server preview owner.
export const isAuthPreview =
  __DEV__ && process.env.EXPO_PUBLIC_AUTH_PREVIEW === "true";
function usePreviewSession() {
  const data = useSyncExternalStore(
    previewSession.subscribe,
    previewSession.getSnapshot,
    previewSession.getServerSnapshot,
  );
  return { data, isPending: false, error: null, refetch: async () => {} };
}
const useRawSession = isAuthPreview
  ? usePreviewSession
  : authClient.useSession;

export function useAppSession() {
  const result = useRawSession();
  const guestName = useSyncExternalStore(
    subscribeGuestName,
    getGuestName,
    () => null,
  );

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

export function startPreviewSession() {
  if (!isAuthPreview) return false;
  previewSession.signIn();
  return true;
}
export function startGuestPreviewSession() {
  if (!isAuthPreview) return false;
  previewSession.signInGuest();
  return true;
}
export async function endSession() {
  clearGuestName();
  if (isAuthPreview) {
    previewSession.signOut();
    return { error: null };
  }
  return authClient.signOut();
}
