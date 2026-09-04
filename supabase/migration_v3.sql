-- Migration v3: public stats RPC + screenshots bucket
-- Run in Supabase Dashboard → SQL Editor

create or replace function get_public_report_stats()
returns json
language sql
security definer
set search_path = public
as $$
  select json_build_object(
    'total',   (select count(*) from incidents),
    'pending', (select count(*) from incidents where status in ('new','under_review')),
    'ready',   (select count(*) from incidents where status = 'ready_for_submission'),
    'recent',  (
      select coalesce(json_agg(row_to_json(r)), '[]'::json)
      from (
        select id, created_at, report_type, platform, status, priority
        from incidents
        order by created_at desc
        limit 5
      ) r
    )
  );
$$;

grant execute on function get_public_report_stats to anon, authenticated;

insert into storage.buckets (id, name, public)
values ('screenshots', 'screenshots', true)
on conflict (id) do nothing;

drop policy if exists "Public can upload screenshots" on storage.objects;
create policy "Public can upload screenshots"
  on storage.objects for insert
  to public
  with check (bucket_id = 'screenshots');

drop policy if exists "Public can read screenshots" on storage.objects;
create policy "Public can read screenshots"
  on storage.objects for select
  to public
  using (bucket_id = 'screenshots');

drop policy if exists "Moderators can delete screenshots" on storage.objects;
create policy "Moderators can delete screenshots"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'screenshots');
