begin;

drop policy "own babies" on babies;

create policy "own babies" on babies
  for all using (
    parent_id in (select id from parent_profiles where user_id = auth.uid())
  ) with check (
    parent_id in (select id from parent_profiles where user_id = auth.uid())
  );

commit;
