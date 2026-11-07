import type { authClient } from "./auth-client";

type Session = typeof authClient.$Infer.Session;
let session: Session | null = null;
const listeners = new Set<() => void>();
export const previewSession = {
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
  getSnapshot: () => session,
  getServerSnapshot: () => null,
  signIn() {
    const now = new Date();
    session = {
      user: {
        id: "preview-user",
        name: "Max",
        email: "max@example.com",
        emailVerified: true,
        image: null,
        nameConfirmed: true,
        createdAt: now,
        updatedAt: now,
      },
      session: {
        id: "preview-session",
        userId: "preview-user",
        token: "local-preview-only",
        expiresAt: new Date(now.getTime() + 86400000),
        createdAt: now,
        updatedAt: now,
        ipAddress: null,
        userAgent: null,
      },
    };
    listeners.forEach((listener) => listener());
  },
  signOut() {
    session = null;
    listeners.forEach((listener) => listener());
  },
  updateUser(updates: { name?: string; image?: string | null }) {
    if (session) {
      session = {
        ...session,
        user: {
          ...session.user,
          ...updates,
          updatedAt: new Date(),
        },
      };
      listeners.forEach((listener) => listener());
    }
  },
};
