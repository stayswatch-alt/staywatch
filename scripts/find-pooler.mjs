import pg from 'pg';

const pwd = process.env.SUPABASE_DB_PASSWORD;
if (!pwd) {
  console.error('Set SUPABASE_DB_PASSWORD');
  process.exit(1);
}

const regions = [
  'eu-central-1', 'eu-west-1', 'eu-west-2', 'eu-west-3', 'eu-north-1',
  'us-east-1', 'us-west-1', 'us-west-2', 'ap-southeast-1', 'ap-northeast-1',
  'ca-central-1', 'sa-east-1', 'ap-south-1',
];

for (const r of regions) {
  const host = `aws-0-${r}.pooler.supabase.com`;
  const client = new pg.Client({
    host,
    port: 5432,
    user: 'postgres.bkgxaefvkqlxefpezztz',
    password: pwd,
    database: 'postgres',
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 8000,
  });
  try {
    await client.connect();
    await client.query('select 1');
    console.log('OK', host);
    await client.end();
    process.exit(0);
  } catch (e) {
    console.log('FAIL', host, String(e.message).slice(0, 80));
    try { await client.end(); } catch {}
  }
}
process.exit(1);
