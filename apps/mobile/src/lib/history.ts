import { Platform } from "react-native";
import { authClient } from "./auth-client";
import { isAuthPreview } from "./session";

export type HistoryItem = {
  id: string;
  title: string;
  selectedOption: string | null;
  optionCount: number;
  createdAt: string;
  chosenAt: string | null;
};

export type HistoryOption = {
  id: string;
  label: string;
  sortOrder: number;
  isSelected: boolean;
  selectedOrder: number | null;
};

export type HistoryDetail = {
  id: string;
  title: string;
  createdAt: string;
  chosenAt: string | null;
  options: HistoryOption[];
};

export async function historyRequest<T>(path = ""): Promise<T> {
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
  const response = await fetch(new URL(`/api/history${path}`, base), {
    headers,
    credentials: Platform.OS === "web" ? "include" : "omit",
    signal: AbortSignal.timeout(15000),
  });
  const data = await response.json();
  if (!response.ok)
    throw new Error(
      data.message ?? "Couldn’t load your history. Please try again.",
    );
  return data;
}

export function formatHistoryDate(value: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatHistoryDateTime(value: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString(undefined, {
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}
