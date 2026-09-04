# Как применить миграции (v4, v5)

## migration_v4 — уже применена?

Если `internal_note`, `incident_events` и статусы `rejected`/`duplicate` уже есть — v4 можно пропустить.

## migration_v5 — Realtime + rate limit

После v4 выполни **`supabase/migration_v5.sql`** тем же способом (SQL Editor → Run):

1. https://supabase.com/dashboard/project/bkgxaefvkqlxefpezztz/sql/new
2. Скопируй весь `migration_v5.sql` → **Run**

Проверка:
```sql
select exists (
  select 1 from pg_publication_tables
  where pubname = 'supabase_realtime' and tablename = 'incidents'
) as realtime_on,
exists (
  select 1 from information_schema.tables where table_name = 'submission_rate_log'
) as rate_log,
(
  select relrowsecurity from pg_class
  where relname = 'submission_rate_log' and relnamespace = 'public'::regnamespace
) as rate_log_rls;
```
`realtime_on`, `rate_log` и `rate_log_rls` должны быть `true`.

---

## Почему `npm run migrate` может падать

Supabase **блокирует внешние подключения** к Postgres, если включены **Network Restrictions**.

Типичные ошибки:
- `address not in tenant allow_list` — твой IP не в whitelist
- `Connection terminated unexpectedly` — соединение оборвано (часто та же причина)

---

## Способ A — отключить блокировку IP (2 минуты)

1. Открой:  
   https://supabase.com/dashboard/project/bkgxaefvkqlxefpezztz/database/settings

2. Найди **Network Restrictions** (или **Restrict database access**)

3. Выбери **Disable restrictions** (или добавь свой IP — в ошибке указан, например `85.155.243.140`)

4. В терминале:
   ```powershell
   cd C:\Users\User\Desktop\stay-watch
   npm run migrate
   ```

5. Должно быть:
   ```
   Postgres migration OK via Session pooler
   Verify: { has_note: true, has_events: true, ... }
   ```

После миграции restrictions можно снова включить — **SQL Editor в Dashboard работает и с включёнными restrictions**.

---

## Способ B — Access Token (без открытия Postgres наружу)

1. Открой: https://supabase.com/dashboard/account/tokens

2. **Generate new token** → имя `stay-watch-migrate` → права **Database (Read-write)**

3. Скопируй токен в `.env.local`:
   ```
   SUPABASE_ACCESS_TOKEN=sbp_xxxxxxxx...
   ```

4. Запусти:
   ```powershell
   npm run migrate
   ```

Скрипт сначала попробует Management API — **IP whitelist не нужен**.

---

## Способ C — SQL Editor вручную (если A и B не подходят)

1. Войди: https://supabase.com/dashboard/project/bkgxaefvkqlxefpezztz/sql/new

2. Открой файл `supabase/migration_v4.sql` в проекте

3. Скопируй **весь** текст → вставь в редактор → **Run**

4. Проверка:
   ```sql
   select
     exists (select 1 from information_schema.columns where table_name='incidents' and column_name='internal_note') as has_note,
     exists (select 1 from information_schema.tables where table_name='incident_events') as has_events;
   ```
   Оба должны быть `true`.

---

## Пароль в `.env.local`

Если пароль содержит `$`, оберни в кавычки:
```
SUPABASE_DB_PASSWORD="s._bF9-W_J$6PrH"
```
