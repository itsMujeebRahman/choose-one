import { test } from 'node:test';
import assert from 'node:assert/strict';
import { betterAuth } from 'better-auth';
import { memoryAdapter } from 'better-auth/adapters/memory';
import { anonymous } from 'better-auth/plugins';
import { expo } from '@better-auth/expo';
import { parseSetCookieHeader } from 'better-auth/cookies';
import { preserveOAuthSession } from '../src/auth/preserve-oauth-session.ts';

const base = 'http://localhost:13001';
const callbackURL = 'chooseone:///auth';
function cookieHeader(header) {
  return [...parseSetCookieHeader(header ?? '')]
    .filter(([, cookie]) => cookie.value && Number(cookie['max-age']) !== 0)
    .map(([name, cookie]) => `${name}=${cookie.value}`).join('; ');
}
function sessionCookie(header) {
  return [...parseSetCookieHeader(header ?? '')].find(([name]) => name.endsWith('session_token'))?.[1];
}
async function fixture() {
  const db = { user: [], session: [], account: [], verification: [] };
  const auth = betterAuth({
    baseURL: base,
    secret: 'isolated-test-secret-at-least-thirty-two-characters',
    database: memoryAdapter(db),
    socialProviders: { google: { clientId: 'test-client', clientSecret: 'test-secret' } },
    trustedOrigins: ['chooseone://', 'chooseone://*'],
    plugins: [anonymous(), preserveOAuthSession(), expo()],
  });
  const ctx = await auth.$context;
  const google = ctx.socialProviders.find((provider) => provider.id === 'google');
  // Mock only Google's code exchange; execute real auth routes, DB and hooks.
  google.validateAuthorizationCode = async () => ({ accessToken: 'fake-test-token' });
  google.getUserInfo = async () => ({
    user: { id: 'fake-google-user', name: 'Test', email: 'isolated@example.test', emailVerified: true },
    data: { sub: 'fake-google-user' },
  });
  async function post(path, body, cookie = '') {
    return auth.handler(new Request(base + path, {
      method: 'POST', headers: { 'content-type': 'application/json', origin: base, cookie },
      body: JSON.stringify(body),
    }));
  }
  async function login(browserCookie = '', appCookie = '') {
    const start = await post('/api/auth/sign-in/social', {
      provider: 'google', callbackURL, errorCallbackURL: callbackURL, disableRedirect: true,
    }, appCookie);
    assert.equal(start.status, 200);
    const { url } = await start.json();
    const state = new URL(url).searchParams.get('state');
    return auth.handler(new Request(
      `${base}/api/auth/callback/google?code=fake-code&state=${encodeURIComponent(state)}`,
      { headers: { cookie: [browserCookie, cookieHeader(start.headers.get('set-cookie'))].filter(Boolean).join('; ') } },
    ));
  }
  async function getSession(cookie) {
    const response = await auth.handler(new Request(base + '/api/auth/get-session?disableCookieCache=true', {
      headers: { cookie },
    }));
    assert.equal(response.status, 200);
    return response.json();
  }
  function nativeCookie(response) {
    const location = new URL(response.headers.get('location'));
    assert.equal(location.protocol, 'chooseone:');
    const header = location.searchParams.get('cookie');
    assert.ok(header, 'Expo must deliver the session cookie in the app callback');
    const token = sessionCookie(header);
    assert.ok(token?.value, 'Successful callback must deliver a nonempty session token');
    assert.ok(Number(token['max-age']) > 0, 'New session must not be expired by stale-browser cleanup');
    return cookieHeader(header);
  }
  return { db, google, post, login, getSession, nativeCookie };
}

test('first login after native logout works with the revoked cookie still in the browser', async () => {
  const f = await fixture();
  let browserCookie = f.nativeCookie(await f.login());
  for (let cycle = 0; cycle < 3; cycle++) {
    assert.ok((await f.getSession(browserCookie))?.session);
    const signedOut = await f.post('/api/auth/sign-out', {}, browserCookie);
    assert.equal(signedOut.status, 200);
    assert.equal(await f.getSession(browserCookie), null, 'Revoked credentials cannot authenticate');
    // The app cleared its cookie; the browser still sends the revoked one.
    const callback = await f.login(browserCookie);
    assert.equal(callback.status, 302);
    const freshCookie = f.nativeCookie(callback);
    assert.ok((await f.getSession(freshCookie))?.session, 'Immediate first attempt must authenticate');
    assert.equal(await f.getSession(browserCookie), null, 'Old session must remain revoked');
    browserCookie = freshCookie;
  }
});

test('initial OAuth login creates a usable session without an existing browser cookie', async () => {
  const f = await fixture();
  const cookie = f.nativeCookie(await f.login());
  assert.ok((await f.getSession(cookie))?.session);
  assert.equal(f.db.user.length, 1);
});

test('guest sign-in and upgrading a guest to Google continue working', async () => {
  const f = await fixture();
  const guest = await f.post('/api/auth/sign-in/anonymous', {});
  assert.equal(guest.status, 200);
  const guestCookie = cookieHeader(guest.headers.get('set-cookie'));
  assert.equal((await f.getSession(guestCookie)).user.isAnonymous, true);
  const callback = await f.login(guestCookie, guestCookie);
  const cookie = f.nativeCookie(callback);
  const session = await f.getSession(cookie);
  assert.ok(session?.session);
  assert.equal(Boolean(session.user.isAnonymous), false);
});

test('failed OAuth exchange does not issue a session cookie', async () => {
  const f = await fixture();
  f.google.validateAuthorizationCode = async () => null;
  const callback = await f.login();
  assert.equal(callback.status, 302);
  assert.ok(new URL(callback.headers.get('location')).searchParams.has('error'));
  assert.ok(!sessionCookie(callback.headers.get('set-cookie'))?.value);
  assert.equal(f.db.session.length, 0);
});
