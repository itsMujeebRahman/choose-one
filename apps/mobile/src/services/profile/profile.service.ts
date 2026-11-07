import { apiClient } from "../api-client";
import { isAuthPreview } from "../../lib/session";
import { previewSession } from "../../lib/preview-session";

export type UserProfile = {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  nameConfirmed?: boolean | null;
  emailVerified?: boolean | null;
  createdAt?: string | Date;
  updatedAt?: string | Date;
};

export type UpdateProfileInput = {
  name?: string;
  image?: string | null;
};

export async function getProfile(): Promise<UserProfile> {
  if (isAuthPreview) {
    try {
      const result = await apiClient<{ user: UserProfile }>("/api/profile");
      return result.user;
    } catch {
      const snapshot = previewSession.getSnapshot();
      return (
        snapshot?.user ?? {
          id: "preview-user",
          name: "Max",
          email: "max@example.com",
          image: null,
        }
      );
    }
  }
  const result = await apiClient<{ user: UserProfile }>("/api/profile");
  return result.user;
}

export async function updateProfile(
  input: UpdateProfileInput,
): Promise<UserProfile> {
  if (isAuthPreview) {
    try {
      const result = await apiClient<{ user: UserProfile }>("/api/profile", {
        method: "PATCH",
        body: input,
      });
      previewSession.updateUser(input);
      return result.user;
    } catch {
      previewSession.updateUser(input);
      const snapshot = previewSession.getSnapshot();
      return (
        snapshot?.user ?? {
          id: "preview-user",
          name: input.name ?? "Max",
          email: "max@example.com",
          image: input.image,
        }
      );
    }
  }

  const result = await apiClient<{ user: UserProfile }>("/api/profile", {
    method: "PATCH",
    body: input,
  });
  return result.user;
}
