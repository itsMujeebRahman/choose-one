import { useSyncExternalStore } from "react";
import { authClient } from "./auth-client";
import { previewSession } from "./preview-session";

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
export const useAppSession = isAuthPreview
  ? usePreviewSession
  : authClient.useSession;
export function startPreviewSession() {
  if (!isAuthPreview) return false;
  previewSession.signIn();
  return true;
}
export async function endSession() {
  if (isAuthPreview) {
    previewSession.signOut();
    return { error: null };
  }
  return authClient.signOut();
}
