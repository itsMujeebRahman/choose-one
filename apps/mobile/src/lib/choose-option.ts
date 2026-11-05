import { Platform } from "react-native";
import { authClient } from "./auth-client";
import { isAuthPreview } from "./session";

export async function chooseOption(
  title: string,
  options: string[],
  requestId: string,
  signal?: AbortSignal,
): Promise<string> {
  const baseURL = process.env.EXPO_PUBLIC_API_URL;
  if (!baseURL) throw new Error("The API URL is not configured.");
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (isAuthPreview) headers["x-auth-preview"] = "true";
  else if (Platform.OS !== "web") {
    const cookie = await authClient.getCookie();
    if (cookie) headers.Cookie = cookie;
  }
  const response = await fetch(new URL("/api/choose", baseURL).href, {
    method: "POST",
    headers,
    credentials: Platform.OS === "web" ? "include" : "omit",
    body: JSON.stringify({ title, options, requestId }),
    signal,
  });
  const data = await response.json();
  if (!response.ok)
    throw new Error(
      data.message ?? "Couldn’t save your choice. Please try again.",
    );
  if (
    typeof data.option !== "string" ||
    !options.includes(data.option) ||
    typeof data.problemId !== "string" ||
    typeof data.optionId !== "string"
  )
    throw new Error("The saved answer wasn’t valid. Please try again.");
  return data.option;
}
