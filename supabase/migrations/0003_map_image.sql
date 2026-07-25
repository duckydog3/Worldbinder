-- Supports Section 6.6: optional map background image via Supabase Storage.
-- The map view works without this (falls back to a grouped list of location
-- cards); this just enables the image-pin mode once the DM uploads one.

alter table public.campaigns add column map_image_url text;

create or replace function public.is_any_dm()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.campaign_memberships
    where user_id = auth.uid() and role = 'dm'
  );
$$;

insert into storage.buckets (id, name, public)
values ('map-images', 'map-images', true)
on conflict (id) do nothing;

-- storage.objects is owned by supabase_storage_admin, not postgres, so we
-- can't (and don't need to) ALTER its RLS setting here — Supabase's storage
-- extension already enables RLS on it by default. The `postgres` role does
-- have CREATE POLICY privilege on it, which is all we need.

create policy "map_images_public_read" on storage.objects
  for select
  using (bucket_id = 'map-images');

create policy "map_images_dm_insert" on storage.objects
  for insert
  with check (bucket_id = 'map-images' and public.is_any_dm());

create policy "map_images_dm_update" on storage.objects
  for update
  using (bucket_id = 'map-images' and public.is_any_dm())
  with check (bucket_id = 'map-images' and public.is_any_dm());

create policy "map_images_dm_delete" on storage.objects
  for delete
  using (bucket_id = 'map-images' and public.is_any_dm());
