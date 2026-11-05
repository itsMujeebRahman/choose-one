import { neon } from '@neondatabase/serverless';

export async function checkDatabase(connectionString?: string) {
  if (!connectionString) {
    return Response.json({ error: 'Database is not configured.' }, { status: 503 });
  }

  try {
    const sql = neon(connectionString);
    const [result] = await sql`SELECT 1 AS connected, CURRENT_TIMESTAMP AS checked_at`;
    return Response.json(
      { connected: result.connected === 1, checkedAt: result.checked_at },
      { headers: { 'Cache-Control': 'no-store' } },
    );
  } catch {
    return Response.json({ error: 'Database is unavailable. Please try again.' }, { status: 503 });
  }
}
