# Cloudinary setup for Stay Watch

Evidence screenshots are stored on **Cloudinary** (not Supabase Storage). Supabase is used only for the report database.

Cloudinary free tier gives much more room than Supabase Storage (~1 GB on the free plan).

---

## 1. Create a Cloudinary account

1. Go to [cloudinary.com](https://cloudinary.com) and sign up (free).
2. On the **Dashboard**, note your **Cloud name** (e.g. `dxyz123abc`).

---

## 2. Create an unsigned upload preset

1. **Settings** (gear) → **Upload** → **Upload presets** → **Add upload preset**
2. **Preset name:** `staywatch_evidence` (or any name — use the same in env vars)
3. **Signing Mode:** **Unsigned** (required for browser uploads without a secret key)
4. **Folder:** `stay-watch/evidence` (optional; the app also sends this folder)
5. **Save**

Do **not** put your API Secret in the website — only cloud name + unsigned preset are needed in the frontend.

---

## 3. Local development

Add to `.env.local`:

```env
VITE_CLOUDINARY_CLOUD_NAME=your-cloud-name
VITE_CLOUDINARY_UPLOAD_PRESET=staywatch_evidence
```

Restart `npm run dev`.

---

## 4. Vercel (production)

1. [Project → Settings → Environment Variables](https://vercel.com/lisa-s-projects18/stay-watch/settings/environment-variables)
2. Add for **Production** (and Preview if you want):

| Name | Value |
|------|--------|
| `VITE_CLOUDINARY_CLOUD_NAME` | your cloud name |
| `VITE_CLOUDINARY_UPLOAD_PRESET` | `staywatch_evidence` |

3. **Redeploy** the site (env vars are baked in at build time).

---

## 5. Verify

1. Open `/report`
2. Attach a small JPG/PNG and submit a test report
3. In Supabase **Table Editor → incidents**, check `screenshot_urls` — URLs should look like  
   `https://res.cloudinary.com/.../stay-watch/evidence/...`

Old reports with Supabase Storage URLs still work; only new uploads use Cloudinary.

---

## Limits (free tier, approximate)

- Cloudinary free: ~25 credits/month; storage and bandwidth are generous for a community report tool at moderate volume.
- App limit per file: **8 MB**, max **3 files** per report (with automatic compression for large photos).

If you outgrow the free tier, Cloudinary paid plans or stricter compression are the next steps — Supabase database size is separate and usually not the bottleneck.
