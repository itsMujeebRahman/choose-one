import { useEffect, useMemo, useSyncExternalStore } from "react";
import { AppState, Linking, Platform } from "react-native";
import { toast } from "sonner-native";
import { authClient } from "./auth-client";
import { queryClient } from "./query-client";
import {
  clearGuestName,
  getGuestName,
  subscribeGuestName,
} from "./guest-storage";

let logoutStatus: "idle" | "pending" | "failed" = "idle";
const logoutListeners = new Set<() => void>();
let logoutRequest: ReturnType<typeof performLogout> | null = null;
let sessionRevision = 0;
const sessionRequests = new Map<AbortController, Promise<void>>();
let signingIn = false;
const signInListeners = new Set<() => void>();

function traceSignIn(stage: string, details: Record<string, unknown> = {}) {
  if (__DEV__) console.info("[auth-flow]", stage, details);
}

function setSigningIn(value: boolean) {
  signingIn = value;
  signInListeners.forEach((listener) => listener());
}

export async function signInWithProvider(provider: "google" | "apple") {
  if (signingIn) return;
  setSigningIn(true);
  let callbackReceived = false;
  const callbackListener = Platform.OS !== "web" ? Linking.addEventListener("url", ({ url }) => {
    if (!url.startsWith("chooseone:")) return;
    const callback = new URL(url);
    callbackReceived = true;
    traceSignIn("callback-received", {
      path: callback.pathname,
      hasCookie: callback.searchParams.has("cookie"),
      hasError: callback.searchParams.has("error"),
    });
  }) : null;
  try {
    traceSignIn("started", { provider });
    if (logoutRequest) await logoutRequest;
    if (logoutStatus !== "idle") throw new Error("Finish signing out before signing in again.");
    // Finish/cancel the previous session refresh before opening a new auth flow.
    await authClient.$store.atoms.session.get().refetch({ query: { disableCookieCache: true } });
    const result = await authClient.signIn.social({
      provider,
      callbackURL: Platform.OS === "web" ? "/auth" : "chooseone:///auth",
      errorCallbackURL: Platform.OS === "web" ? "/auth" : "chooseone:///auth",
    });
    traceSignIn("browser-returned", { callbackReceived, hasError: Boolean(result.error) });
    if (result.error) throw new Error(result.error.message ?? "Sign-in couldn’t start.");
    if (Platform.OS === "web") return;
    const cookie = await authClient.getCookie();
    traceSignIn("stored-credentials", { hasSessionCookie: Boolean(cookie?.includes("session_token=")) });

    // The browser return and native cookie/session refresh can settle separately.
    // Only finish after the server confirms the session; never assume success.
    for (let attempt = 0; attempt < 3; attempt++) {
      const restored = await authClient.getSession({ query: { disableCookieCache: true } });
      traceSignIn("session-check", { attempt: attempt + 1, hasSession: Boolean(restored.data), hasError: Boolean(restored.error) });
      if (restored.error) throw new Error(restored.error.message ?? "Couldn’t restore your session.");
      if (restored.data) {
        const session = authClient.$store.atoms.session;
        session.set({ ...session.get(), data: restored.data, error: null, isPending: false, isRefetching: false });
        return;
      }
      if (attempt < 2) await new Promise((resolve) => setTimeout(resolve, 250 * (attempt + 1)));
    }
    throw new Error("Sign-in returned without an active session. Please complete sign-in in the browser and try again.");
  } finally {
    callbackListener?.remove();
    setSigningIn(false);
  }
}

export function beginSessionRequest() {
  if (logoutStatus !== "idle") throw new Error("Sign-out is in progress.");
  const revision = sessionRevision;
  const sessionId = authClient.$store.atoms.session.get().data?.session.id;
  const controller = new AbortController();
  let finish!: () => void;
  const settled = new Promise<void>((resolve) => { finish = resolve; });
  sessionRequests.set(controller, settled);
  return {
    controller,
    isCurrent: () => !controller.signal.aborted && logoutStatus === "idle"
      && revision === sessionRevision
      && sessionId === authClient.$store.atoms.session.get().data?.session.id,
    finish: () => { sessionRequests.delete(controller); finish(); },
  };
}

function setLogoutStatus(status: typeof logoutStatus) {
  logoutStatus = status;
  logoutListeners.forEach((listener) => listener());
}

export function useLogoutStatus() {
  return useSyncExternalStore(
    (listener) => {
      logoutListeners.add(listener);
      return () => { logoutListeners.delete(listener); };
    },
    () => logoutStatus,
    () => "idle" as const,
  );
}

// Mount once above the routes, rather than adding a listener in every session hook.
export function useSessionRefresh() {
  useEffect(() => {
    const handleCheck = () => {
      if (logoutStatus !== "idle" || signingIn) return;
      void authClient.$store.atoms.session.get().refetch();
    };
    if (Platform.OS === "web") {
      if (typeof window === "undefined") return;
      window.addEventListener("focus", handleCheck);
      window.addEventListener("storage", handleCheck);
      return () => {
        window.removeEventListener("focus", handleCheck);
        window.removeEventListener("storage", handleCheck);
      };
    }
    const sub = AppState.addEventListener("change", (state) => {
      if (state === "active") handleCheck();
    });
    return () => sub.remove();
  }, []);
}

export function useAppSession() {
  const result = authClient.useSession();
  const isSigningIn = useSyncExternalStore(
    (listener) => {
      signInListeners.add(listener);
      return () => { signInListeners.delete(listener); };
    },
    () => signingIn,
    () => false,
  );
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
    // Route guards keep the loader visible until browser sign-in is verified.
    isPending: result.isPending || isSigningIn,
    data: enhancedData,
  };
}

async function performLogout() {
  setLogoutStatus("pending");
  sessionRevision++;
  const requests = [...sessionRequests.entries()];
  requests.forEach(([controller]) => controller.abort());
  try {
    await Promise.all([
      queryClient.cancelQueries(),
      ...requests.map(([, settled]) => settled),
    ]);
    if (sessionRequests.size) throw new Error("Requests are still stopping. Please retry sign-out.");
    queryClient.clear();
    await clearGuestName();
    // Cancel/drain an older auth refresh before the final server sign-out.
    await authClient.$store.atoms.session.get().refetch({ query: { disableCookieCache: true } });
    const result = await authClient.signOut({ fetchOptions: { timeout: 15000 } });
    if (result.error) throw new Error(result.error.message ?? "Couldn’t sign out.");
    const confirmed = await authClient.getSession({
      query: { disableCookieCache: true },
      fetchOptions: { timeout: 15000 },
    });
    if (confirmed.error || confirmed.data)
      throw new Error("Couldn’t confirm sign-out. Please try again.");
    const session = authClient.$store.atoms.session;
    session.set({ ...session.get(), data: null, error: null, isPending: false, isRefetching: false });
    queryClient.clear();
    return result;
  } catch (error) {
    setLogoutStatus("failed");
    throw error;
  }
}

export function endSession() {
  if (signingIn) return Promise.reject(new Error("Finish signing in before signing out."));
  if (!logoutRequest) {
    logoutRequest = performLogout().then(
      (result) => {
        logoutRequest = null;
        setLogoutStatus("idle");
        toast.success("You’ve signed out.");
        return result;
      },
      (error: unknown) => {
        logoutRequest = null;
        throw error;
      },
    );
  }
  return logoutRequest;
}
