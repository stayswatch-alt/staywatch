-- Migration v2: new status system + priority + report_id
-- Run in Supabase Dashboard → SQL Editor

-- 1. Drop old status constraint, add new statuses
alter table incidents drop constraint if exists incidents_status_check;
alter table incidents add constraint incidents_status_check
  check (status in ('new','under_review','needs_evidence','verified','ready_for_submission','archived'));

-- Migrate existing values
update incidents set status = 'new'      where status = 'open';
update incidents set status = 'verified' where status = 'sent';

-- 2. Add priority column
alter table incidents add column if not exists priority text
  not null default 'medium'
  check (priority in ('high','medium','low'));

-- 3. Update submit_incident to use new default status
create or replace function submit_incident(
  p_artist text,
  p_report_type text,
  p_title text,
  p_quote text,
  p_platform text,
  p_post_author text,
  p_post_date date,
  p_screenshot_date date,
  p_url text,
  p_lang text,
  p_screenshot_urls text[] default '{}',
  p_hp text default ''
) returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_hp is not null and p_hp <> '' then
    return;
  end if;

  update incidents
    set report_count     = report_count + 1,
        last_reported_at = now(),
        screenshot_urls  = case
          when p_screenshot_urls is not null and array_length(p_screenshot_urls, 1) > 0
            then screenshot_urls || p_screenshot_urls
          else screenshot_urls
        end
    where url = p_url;

  if not found then
    insert into incidents (
      artist, report_type, title, quote, platform,
      post_author, post_date, screenshot_date, screenshot_urls,
      url, lang, status, priority, report_count, last_reported_at
    ) values (
      p_artist, p_report_type, p_title, p_quote, p_platform,
      p_post_author, p_post_date, p_screenshot_date,
      coalesce(p_screenshot_urls, '{}'),
      p_url, p_lang, 'new', 'medium', 1, now()
    );
  end if;
end;
$$;

grant execute on function submit_incident to anon, authenticated;
