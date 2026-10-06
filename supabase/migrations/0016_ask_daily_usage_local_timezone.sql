-- Fix the Ask daily limit boundary to follow the parent's local calendar day.
-- The first version used UTC, so questions asked after local midnight but
-- before UTC midnight could consume the next local day's budget.

create or replace function public.reserve_ask_attempt(p_parent_id uuid, p_max_per_day int)
returns boolean
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_count int;
  v_timezone text := 'UTC';
begin
  select case
    when pp.timezone is not null
      and exists (
        select 1
        from pg_catalog.pg_timezone_names tz
        where tz.name = pp.timezone
      )
    then pp.timezone
    else 'UTC'
  end
  into v_timezone
  from public.parent_profiles pp
  where pp.id = p_parent_id;

  insert into public.ask_daily_usage as t (parent_id, usage_date, request_count)
  values (p_parent_id, timezone(v_timezone, now())::date, 1)
  on conflict (parent_id, usage_date)
  do update set request_count = t.request_count + 1
  returning t.request_count into v_count;

  return v_count <= p_max_per_day;
end;
$$;

comment on table public.ask_daily_usage is
  'One row per parent per local calendar day. request_count is reserved atomically by
   reserve_ask_attempt() before the OpenAI call. Missing or invalid timezones use UTC.';

comment on function public.reserve_ask_attempt(uuid, int) is
  'Atomically reserves one Ask attempt for a parent against the parent''s local
   calendar day and reports whether it is within max_per_day. service_role only.';
