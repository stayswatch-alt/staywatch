-- NocoDB setup helpers for Stay Watch
-- Run in Supabase Dashboard → SQL Editor (once)

-- NocoDB sometimes fails to detect PK if table owner is not postgres
ALTER TABLE public.incidents OWNER TO postgres;

-- Column hints (visible in some DB tools)
COMMENT ON TABLE public.incidents IS 'Stay Watch — public report submissions';
COMMENT ON COLUMN public.incidents.artist IS 'Target: Stray Kids or member name';
COMMENT ON COLUMN public.incidents.report_type IS 'Violation category';
COMMENT ON COLUMN public.incidents.quote IS 'Description / quoted harmful content';
COMMENT ON COLUMN public.incidents.url IS 'Link to the original post (unique per report)';
COMMENT ON COLUMN public.incidents.screenshot_urls IS 'Evidence image URLs (Cloudinary), PostgreSQL text array';
COMMENT ON COLUMN public.incidents.status IS 'new | under_review | needs_evidence | verified | ready_for_submission | archived';
COMMENT ON COLUMN public.incidents.priority IS 'high | medium | low';
COMMENT ON COLUMN public.incidents.report_count IS 'Times this URL was reported';

-- Readable view for NocoDB (optional second table — read-only in NocoDB UI)
-- Use base table "incidents" for editing; this view is for dashboards / exports.
CREATE OR REPLACE VIEW public.incidents_dashboard AS
SELECT
  id,
  ('RPT-' || EXTRACT(YEAR FROM created_at)::INT || '-' || LPAD(id::TEXT, 6, '0')) AS report_id,
  artist          AS member,
  report_type,
  title,
  LEFT(quote, 120) AS description_preview,
  quote           AS full_description,
  platform,
  post_author,
  post_date,
  screenshot_date,
  url             AS post_url,
  array_to_string(screenshot_urls, E'\n') AS evidence_urls,
  lang,
  status,
  priority,
  report_count,
  last_reported_at,
  created_at
FROM public.incidents
ORDER BY created_at DESC;

COMMENT ON VIEW public.incidents_dashboard IS 'Stay Watch moderator view — use table incidents for edits';
