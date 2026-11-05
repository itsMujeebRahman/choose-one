import type { AuthBindings } from "../auth";

export function localPreviewOwner(env: AuthBindings, request: Request) {
  if (
    !env.LOCAL_PREVIEW_USER_ID ||
    request.headers.get("x-auth-preview") !== "true"
  )
    return null;
  function localHost(url: string) {
    const host = new URL(url).hostname;
    return (
      host === "localhost" ||
      host === "127.0.0.1" ||
      host === "[::1]" ||
      /^192\.168\.\d{1,3}\.\d{1,3}$/.test(host) ||
      /^10\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(host) ||
      /^172\.(1[6-9]|2\d|3[01])\.\d{1,3}\.\d{1,3}$/.test(host)
    );
  }
  // Only the local Worker and a local canonical URL can use this fixture owner.
  if (
    !env.BETTER_AUTH_URL ||
    !localHost(env.BETTER_AUTH_URL) ||
    !localHost(request.url)
  )
    return null;
  return env.LOCAL_PREVIEW_USER_ID;
}
