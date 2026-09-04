# NocoDB — если вообще нужен

**Честно:** для модерации уже хватает **https://stay-watch-seven.vercel.app/admin**. NocoDB — опционально, «таблица как Excel». Если запуталась — **пропусти NocoDB**.

---

## SQL (один раз) — точный путь

1. Войди в Supabase: https://supabase.com/dashboard/project/bkgxaefvkqlxefpezztz
2. Слева иконка **цилиндра** → **SQL Editor** (НЕ Settings, НЕ Integrations)
3. **New query**
4. Скопируй весь файл `supabase/nocodb_setup.sql` из проекта
5. **Run**

Если ошибка «relation incidents does not exist» — сначала выполни основные миграции (`schema.sql`).

---

## Host для NocoDB — где реально лежит

**НЕ** в Project Settings → Database (там только пароль и SSL, без host).

### Шаг 1
Открой **главную** проекта:  
https://supabase.com/dashboard/project/bkgxaefvkqlxefpezztz

### Шаг 2
Вверху страницы кнопка **Connect** (рядом с названием проекта).

Если кнопки нет — попробуй прямую ссылку:  
https://supabase.com/dashboard/project/bkgxaefvkqlxefpezztz?showConnect=true

### Шаг 3
В окне выбери **Session pooler** (или **ORM** → там тоже есть pooler string).

Скопируй длинную строку `postgresql://...` или `postgres://...`

---

## Что вставить в NocoDB

https://app.nocodb.com/w9gn2pnb/integrations → **Add connection** → **PostgreSQL**

| Поле | Откуда |
|------|--------|
| Host | `aws-1-eu-west-1.pooler.supabase.com` |
| Port | `6543` (Transaction pooler из Connect) |
| Username | `postgres.bkgxaefvkqlxefpezztz` |
| Password | database password из Supabase |
| Database | **`postgres`** |
| Schema | `public` |
| SSL | ON, mode **Required** |

### Ошибка `self-signed certificate in certificate chain`

**Advanced options** → в JSON добавь (или допиши в блок `ssl`):

```json
"ssl": {
  "rejectUnauthorized": false
}
```

Снова **Test connection** → **Create connection** → **Create Base** → таблица `incidents`.

---

## Частые ошибки

| Ошибка | Причина |
|--------|---------|
| Ищешь host в Settings | Host только в **Connect** на главной |
| Database = `stay watch` | Должно быть **`postgres`** |
| Username = `postgres` | Для pooler нужно **`postgres.bkgxaefvkqlxefpezztz`** |
| Direct host не работает | Используй pooler: `aws-1-eu-west-1.pooler.supabase.com:6543` |
| `self-signed certificate` | Advanced options → `"ssl": { "rejectUnauthorized": false }` |

---

## Без NocoDB

Админка сайта: **https://stay-watch-seven.vercel.app/admin**  
Логин — email модератора Supabase.
