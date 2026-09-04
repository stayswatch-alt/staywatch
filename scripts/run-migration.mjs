import fs from 'fs';

function loadEnvLocal() {
  try {
    const raw = fs.readFileSync('.env.local', 'utf8');
    for (const line of raw.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eq = trimmed.indexOf('=');
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq).trim();
      let val = trimmed.slice(eq + 1).trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      process.env[key] = val;
    }
  } catch { /* ignore */ }
}

loadEnvLocal();

const PROJECT_REF = 'bkgxaefvkqlxefpezztz';
const file = process.argv[2] || 'supabase/migration_v4.sql';
const sql = fs.readFileSync(file, 'utf8');

async function verify() {
  const url = process.env.VITE_SUPABASE_URL;
  const key = process.env.VITE_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  const { createClient } = await import('@supabase/supabase-js');
  const sb = createClient(url, key);
  const checks = {};
  const { error: noteErr } = await sb.from('incidents').select('internal_note').limit(1);
  checks.has_note = !noteErr || !noteErr.message.includes('internal_note');
  const { error: evErr } = await sb.from('incident_events').select('id').limit(1);
  checks.has_events = !evErr;
  if (checks.has_events) {
    const { count } = await sb.from('incident_events').select('*', { count: 'exact', head: true });
    checks.events_count = count ?? 0;
  }
  return checks;
}

async function runViaApi() {
  const token = process.env.SUPABASE_ACCESS_TOKEN;
  if (!token) return false;

  console.log('Using Supabase Management API (no Postgres connection needed)...');
  const res = await fetch(`https://api.supabase.com/v1/projects/${PROJECT_REF}/database/migrations`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ name: 'migration_v4_stay_watch', query: sql }),
  });

  const body = await res.text();
  if (!res.ok) {
    console.error('API migration failed:', res.status, body.slice(0, 400));
    return false;
  }
  console.log('API migration OK');
  return true;
}

async function runViaPg() {
  const password = process.env.SUPABASE_DB_PASSWORD;
  if (!password) {
    console.error('SUPABASE_DB_PASSWORD missing in .env.local');
    return false;
  }

  const { default: pg } = await import('pg');
  const attempts = [
    { host: 'aws-1-eu-west-1.pooler.supabase.com', port: 5432, user: 'postgres.bkgxaefvkqlxefpezztz', label: 'Session pooler' },
    { host: 'aws-1-eu-west-1.pooler.supabase.com', port: 6543, user: 'postgres.bkgxaefvkqlxefpezztz', label: 'Transaction pooler' },
  ];

  for (const cfg of attempts) {
    const client = new pg.Client({
      host: cfg.host,
      port: cfg.port,
      user: cfg.user,
      password,
      database: 'postgres',
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 20000,
    });
    try {
      console.log(`Trying ${cfg.label} (${cfg.host}:${cfg.port})...`);
      await client.connect();
      await client.query(sql);
      console.log('Postgres migration OK via', cfg.label);
      await client.end();
      return true;
    } catch (e) {
      const msg = e.message.split('\n')[0];
      console.log('FAIL:', msg);
      if (msg.includes('allow_list')) {
        console.log('');
        console.log('>>> Supabase blocks your IP. Fix one of:');
        console.log('>>> 1) Dashboard → Database → Settings → Network Restrictions → Disable');
        console.log(`>>>    https://supabase.com/dashboard/project/${PROJECT_REF}/database/settings`);
        console.log('>>> 2) Add SUPABASE_ACCESS_TOKEN to .env.local (see docs/migrate.md) and re-run');
        console.log('');
      }
      try { await client.end(); } catch { /* ignore */ }
    }
  }
  return false;
}

const ok = (await runViaApi()) || (await runViaPg());
if (!ok) {
  console.error('\nMigration failed. Easiest fix: docs/migrate.md');
  process.exit(1);
}

const checks = await verify();
if (checks) console.log('Verify:', checks);
else console.log('Run verification query in SQL Editor if needed.');
