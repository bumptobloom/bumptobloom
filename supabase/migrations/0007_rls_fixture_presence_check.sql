-- Let the public-API RLS test prove its two admin-only sentinel rows exist
-- without giving CI a service-role credential that bypasses every policy.
--
-- This function deliberately reveals one bit about two hardcoded synthetic
-- IDs. It cannot enumerate or return any prompt or audit-event data.
create or replace function public.rls_fixtures_present()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.prompt_versions
    where id = '80000000-0000-4000-8000-000000000001'
  )
  and exists (
    select 1
    from public.audit_events
    where id = '90000000-0000-4000-8000-000000000001'
  );
$$;

revoke all on function public.rls_fixtures_present() from public;
revoke execute on function public.rls_fixtures_present() from anon;
grant execute on function public.rls_fixtures_present() to authenticated;

comment on function public.rls_fixtures_present() is
  'Returns whether the two synthetic admin-table RLS sentinels exist. Used by CI; returns no row data.';
