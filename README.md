# Choose One

An npm workspace monorepo. Run commands from this directory (the Git repository root).

```text
apps/
  mobile/    Expo SDK 58 app (blank home screen)
  api/       Hono Cloudflare Worker and Neon configuration
```

## Development

Requires Node.js 22.13+ and npm. Install once at the repository root:

```sh
npm install
npm run dev:api
# In another terminal:
npm run dev:mobile
```

The API listens on port 3001; Expo normally uses 8081. `npm run ios`,
`npm run android`, and `npm run web` start Expo for the selected platform.
The mobile app currently has no API UI. When adding requests, use your deployed
API URL in production and your computer’s LAN address for physical-device development;
localhost on a phone refers to the phone. Only public API URLs belong in mobile env.

## Backend and Neon

Neon secrets and the local branch link have moved to `apps/api/.env.local` and
`apps/api/.neon` (both ignored). `apps/api/neon.ts` keeps the existing production
branch policy. No remote resources or database schema were changed by this move.
For a fresh checkout, link the existing Neon project from `apps/api` and pull its
environment. Use `.env.example` as a list of backend variables.

- `DATABASE_URL`: pooled connection for app queries, used only by the API.
- `DATABASE_URL_UNPOOLED`: reserved for migrations and backups.
- Local port: 3001, configured in the API dev script.
- `CORS_ORIGINS`: comma-separated permitted web origins. Set your web origin in production.

The existing Neon HTTP driver is retained. The API exposes:

- `GET /health`: process health.
- `GET /api/database`: read-only Neon connection check.

```sh
curl -f http://localhost:3001/health
curl -f http://localhost:3001/api/database
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
the existing ignored `apps/api/.env.local` automatically.
Run Expo/EAS native build commands from `apps/mobile`; install dependencies from
the workspace root. The mobile app retains its existing Expo project ID and assets.
Shared packages can be introduced later when there is code both apps need.
