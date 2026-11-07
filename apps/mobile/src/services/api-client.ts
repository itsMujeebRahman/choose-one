import { Platform } from "react-native";
import { authClient } from "../lib/auth-client";
import { isAuthPreview } from "../lib/session";

export type RequestOptions = {
  method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  body?: unknown;
  headers?: Record<string, string>;
  signal?: AbortSignal;
};

export async function apiClient<T>(
  endpoint: string,
  options: RequestOptions = {},
): Promise<T> {
  const base = process.env.EXPO_PUBLIC_API_URL;
  if (!base) throw new Error("The API URL is not configured.");

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (isAuthPreview) {
    headers["x-auth-preview"] = "true";
  } else if (Platform.OS !== "web") {
    const cookie = await authClient.getCookie();
    if (cookie) headers.Cookie = cookie;
  }

  const url = endpoint.startsWith("http")
    ? endpoint
    : new URL(endpoint.startsWith("/") ? endpoint : `/${endpoint}`, base).href;

  const response = await fetch(url, {
    method: options.method ?? (options.body ? "POST" : "GET"),
    headers,
    credentials: Platform.OS === "web" ? "include" : "omit",
    body: options.body ? JSON.stringify(options.body) : undefined,
    signal: options.signal ?? AbortSignal.timeout(15000),
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      (data &&
        typeof data === "object" &&
        "error" in data &&
        typeof data.error === "string" &&
        data.error) ||
      (data &&
        typeof data === "object" &&
        "message" in data &&
        typeof data.message === "string" &&
        data.message) ||
      `Request failed with status ${response.status}.`;
    throw new Error(message);
  }

  return data as T;
}
