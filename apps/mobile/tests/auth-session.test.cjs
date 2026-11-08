/* global __dirname */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');

function deferred() {
  let resolve;
  const promise = new Promise((done) => { resolve = done; });
  return { promise, resolve };
}

// Run the real session coordinator and API client with controlled network/storage.
function harness() {
  const events = [];
  let state = { data: { session: { id: 'old' }, user: { id: 'old-user' } },
    error: null, isPending: false, refetch: async () => { events.push('auth-refresh'); } };
  let guestCleanup = async () => { events.push('guest-clear'); };
  let confirmation = { data: null, error: null };
  let signOutError = null;
  let network = async () => { throw new Error('Unexpected request'); };
  let signOutCount = 0;
  const authClient = {
    $store: { atoms: { session: { get: () => state, set: (value) => { state = value; events.push('session-clear'); } } } },
    getCookie: async () => state.data?.session.id,
    signOut: async () => {
      events.push('sign-out'); signOutCount++;
      // Expo's plugin clears the client session before the server check finishes.
      state = { ...state, data: null };
      return { error: signOutError };
    },
    getSession: async () => { events.push('confirm'); return confirmation; },
    signIn: { social: async () => { events.push('sign-in'); return { error: null }; } },
  };
  const queryClient = {
    cancelQueries: async () => { events.push('queries-cancel'); },
    clear: () => { events.push('cache-clear'); },
  };
  function load(relative, modules) {
    const exports = {};
    const source = fs.readFileSync(path.join(__dirname, '..', relative), 'utf8');
    const compiled = ts.transpileModule(source, { compilerOptions: {
      module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022,
    } }).outputText;
    vm.runInNewContext(compiled, { exports, AbortController, URL, setTimeout, clearTimeout,
      fetch: (...args) => network(...args),
      require(name) {
        if (!(name in modules)) throw new Error(`Unexpected module ${name}`);
        return modules[name];
      },
    });
    return exports;
  }
  const session = load('src/lib/session.ts', {
    'sonner-native': { toast: { success: () => { events.push('logout-toast'); } } },
    react: { useSyncExternalStore: (_, get) => get() },
    'react-native': { Platform: { OS: 'android' } },
    './auth-client': { authClient }, './query-client': { queryClient },
    './guest-storage': { clearGuestName: () => guestCleanup() },
  });
  const api = load('src/services/api-client.ts', {
    '../lib/api-url': { apiUrl: 'https://example.com' },
    'react-native': { Platform: { OS: 'android' } },
    '../lib/auth-client': { authClient }, '../lib/session': session,
  });
  return { session, api, events, state: () => state, signOutCount: () => signOutCount,
    cleanup: (fn) => { guestCleanup = fn; },
    confirm: (value) => { confirmation = value; },
    signOutError: (error) => { signOutError = error; },
    network: (fn) => { network = fn; },
    login: () => { state = { ...state, data: { session: { id: 'new' }, user: { id: 'new-user' } } }; },
  };
}

test('logout aborts and drains ignored network cancellation before clearing local session', async () => {
  const h = harness();
  const started = deferred();
  const lateResponse = deferred();
  let signal;
  h.network(async (_, options) => { signal = options.signal; started.resolve(); return lateResponse.promise; });
  const oldRequest = h.api.apiClient('/api/profile').catch((error) => error);
  await started.promise;
  const cleanup = deferred();
  h.cleanup(async () => { h.events.push('guest-clear'); await cleanup.promise; });
  const logout = h.session.endSession();
  assert.equal(h.session.endSession(), logout);
  assert.equal(h.session.useLogoutStatus(), 'pending');
  assert.equal(signal.aborted, true);
  assert.equal((await oldRequest).name, 'AbortError');
  await new Promise(setImmediate);
  assert.equal(h.signOutCount(), 0);
  assert.equal(h.state().data.session.id, 'old');
  assert.throws(() => h.session.beginSessionRequest(), /Sign-out/);
  cleanup.resolve();
  await logout;
  assert.equal(h.session.useLogoutStatus(), 'idle');
  assert.equal(h.state().data, null);
  assert.ok(h.events.indexOf('guest-clear') < h.events.indexOf('sign-out'));
  assert.ok(h.events.indexOf('confirm') < h.events.indexOf('session-clear'));
  // An immediate new login survives a response from the old request.
  h.login();
  lateResponse.resolve({ ok: false, status: 401, json: async () => ({ message: 'expired' }) });
  await new Promise(setImmediate);
  assert.equal(h.signOutCount(), 1);
  assert.equal(h.state().data.session.id, 'new');
});

test('failed confirmation stays gated and retry completes before a new sign-in', async () => {
  const h = harness();
  h.confirm({ data: { session: { id: 'still-active' } }, error: null });
  await assert.rejects(h.session.endSession(), /confirm sign-out/);
  assert.equal(h.session.useLogoutStatus(), 'failed');
  await assert.rejects(h.session.signInWithProvider('google'), /Finish signing out/);
  assert.throws(() => h.session.beginSessionRequest(), /Sign-out/);
  h.confirm({ data: null, error: null });
  await h.session.endSession();
  assert.equal(h.session.useLogoutStatus(), 'idle');
  h.login();
  h.network(async () => ({ ok: true, status: 200, json: async () => ({ user: 'new-user' }) }));
  assert.equal((await h.api.apiClient('/api/profile')).user, 'new-user');
});

test('storage cleanup failure keeps the gate closed without revoking the session', async () => {
  const h = harness();
  h.cleanup(async () => { throw new Error('Storage unavailable'); });
  await assert.rejects(h.session.endSession(), /Storage unavailable/);
  assert.equal(h.signOutCount(), 0);
  assert.equal(h.session.useLogoutStatus(), 'failed');
  h.cleanup(async () => {});
  await h.session.endSession();
  assert.equal(h.session.useLogoutStatus(), 'idle');
});

test('backend sign-out failure does not expose the auth page', async () => {
  const h = harness();
  h.signOutError({ message: 'Backend unavailable' });
  await assert.rejects(h.session.endSession(), /Backend unavailable/);
  assert.equal(h.session.useLogoutStatus(), 'failed');
  assert.ok(!h.events.includes('confirm'));
});
