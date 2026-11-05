import { Hono } from 'hono';
import { cors } from 'hono/cors';

import { checkDatabase } from './database';

type Bindings = {
  DATABASE_URL?: string;
  CORS_ORIGINS?: string;
};

const app = new Hono<{ Bindings: Bindings }>();

app.use('*', async (c, next) => {
  const origins = (c.env.CORS_ORIGINS ?? 'http://localhost:8081,http://localhost:8082,http://localhost:8083')
    .split(',').map((origin) => origin.trim());
  return cors({ origin: origins, allowMethods: ['GET', 'OPTIONS'] })(c, next);
});

app.get('/', (c) => c.text('Hello Hono!'));
app.get('/health', (c) => c.json({ ok: true }));
app.get('/api/database', (c) => checkDatabase(c.env.DATABASE_URL));
app.notFound((c) => c.json({ error: 'Not found.' }, 404));
app.onError((_, c) => c.json({ error: 'Internal server error.' }, 500));

export default app;
