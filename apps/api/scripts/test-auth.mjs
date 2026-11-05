// Run against an isolated test API with AUTH_TEST_URL and AUTH_TEST_ORIGIN set.
import assert from "node:assert/strict";
const base = process.env.AUTH_TEST_URL;
const origin = process.env.AUTH_TEST_ORIGIN;
const provider = process.env.AUTH_TEST_PROVIDER ?? "google";
assert.ok(["google", "apple"].includes(provider));
if (!base || !origin)
  throw new Error(
    "Set AUTH_TEST_URL and AUTH_TEST_ORIGIN for an isolated test environment.",
  );
async function call(path, body) {
  return fetch(new URL(path, base), {
    method: body ? "POST" : "GET",
    headers: { Origin: origin, "Content-Type": "application/json" },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
}
let r = await call("/api/me");
assert.equal(r.status, 401);
r = await call("/api/auth/get-session");
assert.equal(r.status, 200);
assert.equal(await r.json(), null);
for (const path of ["/api/auth/sign-up/email", "/api/auth/sign-in/email"]) {
  r = await call(path, {
    name: "Disabled flow",
    email: "test@example.com",
    password: "test-password-123",
  });
  assert.ok(r.status >= 400, "Password authentication must be disabled");
}
r = await call("/api/auth/sign-in/social", {
  provider,
  callbackURL: "chooseone:///",
  disableRedirect: true,
});
assert.equal(
  r.status,
  200,
  "Configure the selected provider credentials in the isolated test API before running this check.",
);
const authorizationURL = new URL((await r.json()).url);
assert.equal(
  authorizationURL.hostname,
  provider === "apple" ? "appleid.apple.com" : "accounts.google.com",
);
assert.equal(
  authorizationURL.searchParams.get("redirect_uri"),
  new URL(`/api/auth/callback/${provider}`, base).href,
);
console.log(
  "PASS: protected access, unauthenticated session, disabled password authentication, provider authorization URL. Real OAuth consent requires manual testing.",
);
