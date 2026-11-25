/* global __dirname */
const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const ts = require("typescript");

function deferred() {
  let resolve;
  const promise = new Promise((done) => {
    resolve = done;
  });
  return { promise, resolve };
}

// Run the real session coordinator and API client with controlled network/storage.
function harness() {
  const events = [];
  let state = {
    data: { session: { id: "old" }, user: { id: "old-user" } },
    error: null,
    isPending: false,
    refetch: async () => {
      events.push("auth-refresh");
    },
  };
  let guestCleanup = async () => {
    events.push("guest-clear");
  };
  let confirmation = { data: null, error: null };
  let signOutError = null;
  let network = async () => {
    throw new Error("Unexpected request");
  };
  let signOutCount = 0;
  let browserSignIn = async () => ({ error: null });
  const authClient = {
    useSession: () => state,
    $store: {
      atoms: {
        session: {
          get: () => state,
          set: (value) => {
            state = value;
            events.push("session-clear");
          },
        },
      },
    },
    getCookie: async () => state.data?.session.id,
    signOut: async () => {
      events.push("sign-out");
      signOutCount++;
      // Expo's plugin clears the client session before the server check finishes.
      state = { ...state, data: null };
      return { error: signOutError };
    },
    getSession: async () => {
      events.push("confirm");
      return confirmation;
    },
    signIn: {
      anonymous: async () => {
        events.push("guest-sign-in");
        return { error: null };
      },
      social: async (options) => {
        assert.equal(options.callbackURL, "chooseone:///auth");
        events.push("sign-in");
        return browserSignIn();
      },
    },
  };
  const queryClient = {
    cancelQueries: async () => {
      events.push("queries-cancel");
    },
    clear: () => {
      events.push("cache-clear");
    },
  };
  function load(relative, modules) {
    const exports = {};
    const source = fs.readFileSync(
      path.join(__dirname, "..", relative),
      "utf8",
    );
    const compiled = ts.transpileModule(source, {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2022,
      },
    }).outputText;
    vm.runInNewContext(compiled, {
      exports,
      AbortController,
      URL,
      setTimeout,
      clearTimeout,
      __DEV__: false,
      fetch: (...args) => network(...args),
      require(name) {
        if (!(name in modules)) throw new Error(`Unexpected module ${name}`);
        return modules[name];
      },
    });
    return exports;
  }
  const session = load("src/lib/session.ts", {
    "sonner-native": {
      toast: {
        success: () => {
          events.push("logout-toast");
        },
      },
    },
    react: {
      useEffect: (effect) => effect(),
      useSyncExternalStore: (_, get) => get(),
      useMemo: (compute) => compute(),
    },
    "react-native": {
      Platform: { OS: "android" },
      Linking: { addEventListener: () => ({ remove() {} }) },
    },
    "./auth-client": { authClient },
    "./query-client": { queryClient },
    "./guest-storage": {
      clearGuestName: () => guestCleanup(),
      getGuestName: () => null,
    },
  });
  const api = load("src/services/api-client.ts", {
    "../lib/api-url": { apiUrl: "https://example.com" },
    "react-native": { Platform: { OS: "android" } },
    "../lib/auth-client": { authClient },
    "../lib/session": session,
  });
  return {
    session,
    api,
    events,
    state: () => state,
    signOutCount: () => signOutCount,
    cleanup: (fn) => {
      guestCleanup = fn;
    },
    confirm: (value) => {
      confirmation = value;
    },
    signOutError: (error) => {
      signOutError = error;
    },
    network: (fn) => {
      network = fn;
    },
    browser: (fn) => {
      browserSignIn = fn;
    },
    login: () => {
      state = {
        ...state,
        data: { session: { id: "new" }, user: { id: "new-user" } },
      };
    },
  };
}

test("logout clears local session immediately and aborts active requests", async () => {
  const h = harness();
  const started = deferred();
  const lateResponse = deferred();
  let signal;
  h.network(async (_, options) => {
    signal = options.signal;
    started.resolve();
    return lateResponse.promise;
  });
  const oldRequest = h.api.apiClient("/api/profile").catch((error) => error);
  await started.promise;
  const cleanup = deferred();
  h.cleanup(async () => {
    h.events.push("guest-clear");
    await cleanup.promise;
  });
  const logout = h.session.endSession();
  assert.equal(h.session.endSession(), logout);
  assert.equal(h.session.useLogoutStatus(), "pending");
  assert.equal(signal.aborted, true);
  assert.equal((await oldRequest).name, "AbortError");
  assert.equal(h.signOutCount(), 1);
  assert.equal(h.state().data, null);
  assert.throws(() => h.session.beginSessionRequest(), /Sign-out/);
  await logout;
  assert.equal(h.session.useLogoutStatus(), "idle");
  assert.equal(h.state().data, null);
  assert.ok(h.events.indexOf("guest-clear") < h.events.indexOf("sign-out"));
  // An immediate new login survives a response from the old request.
  h.login();
  cleanup.resolve();
  lateResponse.resolve({
    ok: false,
    status: 401,
    json: async () => ({ message: "expired" }),
  });
  await new Promise(setImmediate);
  assert.equal(h.signOutCount(), 1);
  assert.equal(h.state().data.session.id, "new");
});

test("a server sign-out error still exposes the login flow", async () => {
  const h = harness();
  h.signOutError({ message: "Backend unavailable" });
  await h.session.endSession();
  assert.equal(h.session.useLogoutStatus(), "idle");
  assert.equal(h.state().data, null);
  h.login();
  h.network(async () => ({
    ok: true,
    status: 200,
    json: async () => ({ user: "new-user" }),
  }));
  assert.equal((await h.api.apiClient("/api/profile")).user, "new-user");
});

test("guest storage cleanup failure does not prevent local logout", async () => {
  const h = harness();
  h.cleanup(async () => {
    throw new Error("Storage unavailable");
  });
  await h.session.endSession();
  assert.equal(h.session.useLogoutStatus(), "idle");
  assert.equal(h.state().data, null);
  assert.equal(h.signOutCount(), 1);
});

test("sign-in stays pending across browser return until the server confirms the session", async () => {
  const h = harness();
  await h.session.endSession();
  const browser = deferred();
  const verified = deferred();
  h.browser(() => browser.promise);
  h.confirm(verified.promise);
  const signingIn = h.session.signInWithProvider("google");
  assert.equal(h.session.useAppSession().isPending, true);
  await new Promise(setImmediate);
  browser.resolve({ error: null });
  await new Promise(setImmediate);
  assert.equal(h.session.useAppSession().isPending, true);
  assert.equal(h.session.useAppSession().data, null);
  verified.resolve({
    data: {
      session: { id: "fresh" },
      user: { id: "user", nameConfirmed: false },
    },
    error: null,
  });
  await signingIn;
  const current = h.session.useAppSession();
  assert.equal(current.isPending, false);
  assert.equal(current.data.session.id, "fresh");
  assert.equal(current.data.user.nameConfirmed, false);
});

test("a failed browser sign-in releases the loader without creating a session", async () => {
  const h = harness();
  await h.session.endSession();
  h.browser(async () => ({ error: { message: "Sign-in cancelled" } }));
  await assert.rejects(h.session.signInWithProvider("google"), /cancelled/);
  assert.equal(h.session.useAppSession().isPending, false);
  assert.equal(h.session.useAppSession().data, null);
});

test("guest sign-in waits for a verified session", async () => {
  const h = harness();
  h.confirm({
    data: {
      session: { id: "guest-session" },
      user: { id: "guest", isAnonymous: true, nameConfirmed: false },
    },
    error: null,
  });

  await h.session.signInAnonymously();

  assert.equal(h.state().data.session.id, "guest-session");
  assert.equal(h.state().data.user.isAnonymous, true);
  assert.ok(h.events.includes("guest-sign-in"));
});

test("a session restoration failure automatically signs out", async () => {
  const h = harness();
  h.confirm({ data: null, error: null });

  h.session.useLogoutOnSessionRestoreFailure(new Error("Session expired"));
  await new Promise(setImmediate);

  assert.equal(h.state().data, null);
  assert.equal(h.session.useLogoutStatus(), "idle");
  assert.equal(h.signOutCount(), 1);
  assert.ok(!h.events.includes("logout-toast"));
});

test("API requests cannot bypass the configured API URL", async () => {
  const h = harness();
  let requests = 0;
  h.network(async (url) => {
    requests++;
    assert.equal(new URL(url).origin, "https://example.com");
    return { ok: true, status: 200, json: async () => ({ ok: true }) };
  });
  for (const endpoint of [
    "https://other.example/api/profile",
    "//other.example/api/profile",
  ]) {
    await assert.rejects(h.api.apiClient(endpoint), /configured API_URL/);
  }
  assert.equal(requests, 0);
  assert.equal((await h.api.apiClient("/api/profile")).ok, true);
});
