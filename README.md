# Choose One

An npm workspace monorepo. Run commands from this directory (the Git repository root).

```text
apps/
  mobile/    Expo SDK 58 app
  api/       Hono Cloudflare Worker and Neon configuration
```

## Development

Requires Node.js 22.13+ and npm. Install once at the repository root:

```sh
npm install
npm run dev
# Or run each server separately:
# npm run dev:api
# npm run dev:mobile
```

Copy each workspace's `.env.example` to `.env.local` and configure it before starting.
Ports are defined only in environment files:

- `apps/api/.env.local`: `API_HOST`, `API_PORT`, `API_INSPECTOR_PORT`, and `BETTER_AUTH_URL`.
- `apps/mobile/.env.local`: `EXPO_PORT` and `EXPO_PUBLIC_API_URL`.
- API `CORS_ORIGINS` must match the frontend origin, including `EXPO_PORT`.

The startup scripts load `.env` then `.env.local`; exported environment variables take
precedence. Missing or invalid ports fail startup, and occupied ports are rejected.
For direct HTTP development `BETTER_AUTH_URL` must use `API_PORT`; an HTTPS tunnel may use its public origin. `npm run ios`, `npm run android`, and
`npm run web` use the same environment-defined Expo port.

For physical devices, set `EXPO_PUBLIC_API_URL` and `BETTER_AUTH_URL` to your
computer's LAN address and set `API_HOST=0.0.0.0` to make the API reachable on your local network. Only public
API URLs belong in mobile env; keep database credentials in the API workspace.

## Backend and Neon

Neon secrets and the local branch link have moved to `apps/api/.env.local` and
`apps/api/.neon` (both ignored). `apps/api/neon.ts` keeps the existing production
branch policy. No remote resources or database schema were changed by this move.
For a fresh checkout, link the existing Neon project from `apps/api` and pull its
environment. Use `.env.example` as a list of backend variables.

- `DATABASE_URL`: pooled connection for app queries, used only by the API.
- `DATABASE_URL_UNPOOLED`: reserved for migrations and backups.
- `API_PORT` and `API_INSPECTOR_PORT`: local Worker and inspector ports.
- `CORS_ORIGINS`: comma-separated permitted web origins. Set your web origin in production.

The existing Neon HTTP driver is retained. The API exposes:

- `GET /health`: process health.
- `GET /api/database`: read-only Neon connection check.

```sh
# After exporting BETTER_AUTH_URL from your API environment:
curl -f "$BETTER_AUTH_URL/health"
curl -f "$BETTER_AUTH_URL/api/database"
npm run neon:deploy
```

`neon:deploy` provisions Neon services and pulls secrets into the API directory;
it does not host the API or mobile app. Deploy them independently. On a backend
host, configure Worker secrets rather than committing `.env.local`.

## Validation and production build

```sh
npm run lint
npm run typecheck
npm run build
npm run dev:api
```

The API build is a Wrangler dry-run bundle in `apps/api/dist`; no Worker is published.
The mobile output is `apps/mobile/dist`.

The Hono entry point is `apps/api/src/index.ts`; Neon queries live in
`apps/api/src/database.ts`. `apps/api/wrangler.jsonc` retains your scaffold’s
Worker name (`my-app`). For production, configure `DATABASE_URL` as a Cloudflare
Worker secret and `CORS_ORIGINS` for your web origin, then run
`npm run deploy --workspace @choose-one/api`. Local Wrangler development reads
secrets from the ignored `apps/api/.dev.vars`; keep its auth and database values
synchronized with `apps/api/.env.local`.
Run Expo/EAS native build commands from `apps/mobile`; install dependencies from
the workspace root. The mobile app retains its existing Expo project ID and assets.
Shared packages can be introduced later when there is code both apps need.

Google and Apple sign-in setup and development-build requirements: [Authentication](apps/api/AUTH.md).
