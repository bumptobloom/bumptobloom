-- Private baby profile photos.
-- Permanent object paths are stored in babies.avatar_path.
-- Signed URLs are generated when reading and are never stored.

insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'baby-avatars',
  'baby-avatars',
  false,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update
set
  public = false,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Required object path:
-- {auth-user-id}/{baby-id}/{random-file-name}

create policy "parents can upload own baby avatars"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'baby-avatars'
  and (storage.foldername(name))[1] = (select auth.uid()::text)
  and public.owns_baby(
    ((storage.foldername(name))[2])::uuid
  )
);

create policy "parents can read own baby avatars"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'baby-avatars'
  and (storage.foldername(name))[1] = (select auth.uid()::text)
  and public.owns_baby(
    ((storage.foldername(name))[2])::uuid
 )
);

create policy "parents can update own baby avatars"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'baby-avatars'
  and (storage.foldername(name))[1] = (select auth.uid()::text)
  and public.owns_baby(
    ((storage.foldername(name))[2])::uuid
  )
)
with check (
  bucket_id = 'baby-avatars'
  and (storage.foldername(name))[1] = (select auth.uid()::text)
  and public.owns_baby(
    ((storage.foldername(name))[2])::uuid
  )
);

create policy "parents can delete own baby avatars"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'baby-avatars'
  and (storage.foldername(name))[1] = (select auth.uid()::text)
  and public.owns_baby(
    ((storage.foldername(name))[2])::uuid
  )
);
