-- #72 review (Keya): the previous limiter counted ai_runs rows -- successful
-- completions only -- so a parent whose calls kept timing out or failing
-- could retry forever, uncounted, each retry still costing a real OpenAI
-- call. This replaces it with a counter reserved atomically before the
-- provider call, so an attempt counts whether or not it succeeds.
--
-- 20/hour was our own unreviewed guess. Per Product's usage-control note,
-- the actual limit is 10 questions per parent per UTC calendar day.

create table ask_daily_usage (
  parent_id     uuid not null references parent_profiles(id) on delete cascade,
  usage_date    date not null,
  request_count int  not null default 0,
  primary key (parent_id, usage_date)
);

-- Same treatment as ai_runs / audit_events: RLS enabled, no policies, so
-- only service_role can read or write it.
alter table ask_daily_usage enable row level security;

comment on table ask_daily_usage is
  'One row per parent per UTC day. request_count is reserved atomically by
   reserve_ask_attempt() before the OpenAI call, so it also counts attempts
   that later fail. No cleanup job exists yet -- this grows by one row per
   parent per day indefinitely. Accepted at current scale.';

-- INSERT ... ON CONFLICT DO UPDATE takes a row lock on the conflicting key,
-- so two concurrent requests for the same parent serialize through this
-- statement instead of both reading a stale count -- this is what makes the
-- limit atomic. The date is computed here, not passed in from the app, so a
-- clock difference between the app server and the database can never put an
-- attempt on the wrong side of the UTC midnight boundary.
--
-- security invoker (the default): this must never run with elevated
-- privileges, because it is reachable only via the service role client
-- already, and that role bypasses RLS on its own. set search_path = '' plus
-- fully-qualified names, matching rls_fixtures_present() in 0007, closes off
-- search_path hijacking. Explicitly revoked from anon/authenticated below --
-- left at the default, this function would be callable by anyone with the
-- publishable key, with an arbitrary parent_id, to inflate or read another
-- parent's usage.
create function public.reserve_ask_attempt(p_parent_id uuid, p_max_per_day int)
returns boolean
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_count int;
begin
  insert into public.ask_daily_usage as t (parent_id, usage_date, request_count)
  values (p_parent_id, (now() at time zone 'utc')::date, 1)
  on conflict (parent_id, usage_date)
  do update set request_count = t.request_count + 1
  returning t.request_count into v_count;

  return v_count <= p_max_per_day;
end;
$$;

revoke all on function public.reserve_ask_attempt(uuid, int) from public;
revoke execute on function public.reserve_ask_attempt(uuid, int) from anon;
revoke execute on function public.reserve_ask_attempt(uuid, int) from authenticated;
grant execute on function public.reserve_ask_attempt(uuid, int) to service_role;

comment on function public.reserve_ask_attempt(uuid, int) is
  'Atomically reserves one Ask attempt for a parent against today''s (UTC)
   budget and reports whether it is within max_per_day. service_role only --
   never grant to anon/authenticated, it takes an arbitrary parent_id.';
