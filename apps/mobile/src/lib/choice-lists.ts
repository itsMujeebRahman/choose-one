import { Platform } from "react-native";
import { authClient } from "./auth-client";
import { isAuthPreview } from "./session";
export type ChoiceList = {
  id: string;
  title: string;
  pickCount: number;
  optionCount: number;
  createdAt: string;
  updatedAt: string;
  latestResult: string | null;
  latestSelectedAt: string | null;
};
export type ListOption = {
  id: string;
  label: string;
  sortOrder: number;
  selectedOrder: number | null;
  selectedAt: string | null;
};
export type ListDetail = ChoiceList & { options: ListOption[] };
export async function listRequest<T>(path = "", body?: unknown): Promise<T> {
  const base = process.env.EXPO_PUBLIC_API_URL;
  if (!base) throw new Error("The API URL is not configured.");
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (isAuthPreview) headers["x-auth-preview"] = "true";
  else if (Platform.OS !== "web") {
    const cookie = await authClient.getCookie();
    if (cookie) headers.Cookie = cookie;
  }
  const response = await fetch(new URL(`/api/choice-lists${path}`, base), {
    method: body ? "POST" : "GET",
    headers,
    credentials: Platform.OS === "web" ? "include" : "omit",
    body: body ? JSON.stringify(body) : undefined,
    signal: AbortSignal.timeout(15000),
  });
  const data = await response.json();
  if (!response.ok)
    throw new Error(
      data.message ?? "Couldn’t load your lists. Please try again.",
    );
  return data;
}
