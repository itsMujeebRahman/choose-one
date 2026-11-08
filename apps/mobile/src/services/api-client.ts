import { apiUrl } from "../lib/api-url";
import { Platform } from "react-native";
import { authClient } from "../lib/auth-client";
import { beginSessionRequest, endSession } from "../lib/session";

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
  const request = beginSessionRequest();
  const { signal } = request.controller;
  const abort = () => request.controller.abort();
  options.signal?.addEventListener("abort", abort, { once: true });
  if (options.signal?.aborted) abort();
  const timeout = setTimeout(abort, 15000);
  // Settle locally even if a transport ignores abort; its late result is discarded.
  const waitForRequest = <R>(work: Promise<R>): Promise<R> => new Promise((resolve, reject) => {
    const cancelled = () => {
      const error = new Error("Request cancelled.");
      error.name = "AbortError";
      reject(error);
    };
    signal.addEventListener("abort", cancelled, { once: true });
    if (signal.aborted) cancelled();
    work.then(resolve, reject).finally(() => signal.removeEventListener("abort", cancelled));
  });
  const checkSession = () => {
    if (!request.isCurrent()) throw new Error("Request cancelled because the session changed or the request was aborted.");
  };
  try {
    const base = apiUrl;

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...options.headers,
    };

    if (Platform.OS !== "web") {
      const cookie = await waitForRequest(authClient.getCookie());
      if (cookie) headers.Cookie = cookie;
    }

    checkSession();
    const url = new URL(endpoint.startsWith("/") || /^https?:/i.test(endpoint) ? endpoint : `/${endpoint}`, base);
    if (url.origin !== new URL(base).origin) {
      throw new Error("API requests must use the configured API_URL.");
    }

    const response = await waitForRequest(fetch(url.href, {
      method: options.method ?? (options.body ? "POST" : "GET"),
      headers,
      credentials: Platform.OS === "web" ? "include" : "omit",
      body: options.body ? JSON.stringify(options.body) : undefined,
      signal,
    }));

    const data = await waitForRequest(response.json()).catch(() => null);
    checkSession();

    if (!response.ok) {
      if (response.status === 401) {
        void endSession().catch(() => {});
      }
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
  } finally {
    clearTimeout(timeout);
    options.signal?.removeEventListener("abort", abort);
    request.finish();
  }
}
