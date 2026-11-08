import { apiClient } from "../api-client";

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
  const result = await apiClient<{ user: UserProfile }>("/api/profile");
  return result.user;
}

export async function updateProfile(
  input: UpdateProfileInput,
): Promise<UserProfile> {
  const result = await apiClient<{ user: UserProfile }>("/api/profile", {
    method: "PATCH",
    body: input,
  });
  return result.user;
}
