# Stay Watch

Инструмент для документирования вредоносного контента, направленного против участников Stray Kids.

- **Лендинг** (`/`) — статистика и информация о проекте
- **Публичная форма** (`/report`) — отправка репортов для всего фандома
- **Панель модератора** (`/admin`) — закрыта Supabase Auth: список, фильтры, статусы, заметки, activity log
- **Privacy** (`/privacy`) — политика конфиденциальности

Дубли (один URL) не создают новую строку — увеличивается `report_count`, обновляются скриншоты и цитата. Есть honeypot от ботов.

**Стек:** React + Vite + Supabase + Cloudinary + Vercel

**Production:** https://stay-watch-seven.vercel.app

---

## 1. Supabase — база данных

В **SQL Editor** выполни файлы **по порядку**:

| Файл | Что делает |
|------|------------|
| `supabase/schema.sql` | Таблица `incidents`, RLS, `submit_incident()` |
| `supabase/migration_v2.sql` | Новые статусы, `priority` |
| `supabase/migration_v3.sql` | RPC `get_public_report_stats()`, storage policies |
| `supabase/migration_v4.sql` | `rejected`/`duplicate`, `internal_note`, `incident_events`, fix re-report |
| `supabase/migration_v5.sql` | Realtime для admin, rate limit 40/hour |

> Если база уже существует — запускай только те миграции, которых ещё не было.

Скопируй из **Project Settings → API Keys**: `Project URL` и **Publishable key**.

---

## 2. Cloudinary — скриншоты

Форма загружает evidence в Cloudinary (не Supabase Storage).

1. Создай unsigned upload preset (см. `docs/cloudinary-setup.md`)
2. Добавь переменные в `.env.local` и Vercel:

```
VITE_CLOUDINARY_CLOUD_NAME=...
VITE_CLOUDINARY_UPLOAD_PRESET=...
```

---

## 3. Модераторы

1. **Authentication → Users → Add user**
2. Email + пароль, включи **Auto Confirm User**
3. Вход на `/admin`

---

## 4. Локальный запуск

```bash
cd stay-watch
npm install
cp .env.example .env.local
```

`.env.local`:
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_...
VITE_CLOUDINARY_CLOUD_NAME=...
VITE_CLOUDINARY_UPLOAD_PRESET=...
```

```bash
npm run dev
```

| URL | Страница |
|-----|----------|
| http://localhost:5180/ | Лендинг |
| http://localhost:5180/report | Форма репорта |
| http://localhost:5180/admin | Панель модератора |

---

## 5. Деплой (Vercel)

`vercel.json` уже настроен — SPA rewrites для `/`, `/report`, `/privacy`, `/admin`.

Не забудь env vars на Vercel (Supabase + Cloudinary).

---

## Структура проекта

```
stay-watch/
├── src/
│   ├── App.jsx              ← роутинг по pathname
│   ├── LandingPage.jsx      ← главная + статистика
│   ├── PublicForm.jsx       ← форма репорта
│   ├── AdminPanel.jsx       ← кабинет модератора
│   ├── Login.jsx
│   ├── cloudinaryUpload.js
│   └── lib/incidentStatus.js
├── supabase/
│   ├── schema.sql
│   ├── migration_v2.sql
│   ├── migration_v3.sql
│   └── migration_v4.sql
└── docs/
    ├── cloudinary-setup.md
    └── privacy-policy.md
```

---

## Безопасность

- Таблица `incidents` закрыта RLS — читать/менять могут только авторизованные модераторы
- Публичная форма пишет только через `submit_incident()` (security definer)
- Скриншоты — Cloudinary CDN (unsigned preset с лимитами размера/формата)
- Honeypot в форме отсеивает часть ботов

---

## Статусы репортов

| Статус | Значение |
|--------|----------|
| `new` | Новый |
| `under_review` | На проверке |
| `needs_evidence` | Нужны доказательства |
| `verified` / `ready_for_submission` | Одобрен / готов для JYPE |
| `rejected` | Отклонён |
| `duplicate` | Дубликат |

---

## Дальнейшие шаги

- [x] Export CSV для JYPE
- [x] Серверная пагинация в AdminPanel
- [x] Real-time обновления (после migration_v5)
- [x] DOSSIERS — группировка кейсов
- [x] Rate limiting на submit (после migration_v5)
- [ ] Cloudinary env на Vercel (если скриншоты не грузятся)
- [ ] Team management (MODERATORS)
