-- Optional images for characters, NPCs, locations, and lore entries.
--
-- characters.portrait_url and npcs.portrait_url already exist from 0001;
-- locations and lore_entries get a new image_url column. All four columns
-- store a *storage object path* (e.g. "npcs/<id>/169-file.jpg"), not a public
-- URL — the bucket is private, so there is no stable public URL to store.
--
-- Security model: the 'entity-images' bucket has no SELECT policy at all.
-- Reads only ever happen server-side via the service-role admin client
-- minting a short-lived signed URL (see src/lib/images.ts), and that code
-- only runs after the entity row itself was already returned by a
-- visibility-scoped RLS query — so image access rides on the exact same
-- visibility rule as the entity, with no separate gate to keep in sync.

alter table public.locations add column image_url text;
alter table public.lore_entries add column image_url text;

insert into storage.buckets (id, name, public)
values ('entity-images', 'entity-images', false)
on conflict (id) do nothing;

create policy "entity_images_dm_insert" on storage.objects
  for insert
  with check (bucket_id = 'entity-images' and public.is_any_dm());

create policy "entity_images_dm_update" on storage.objects
  for update
  using (bucket_id = 'entity-images' and public.is_any_dm())
  with check (bucket_id = 'entity-images' and public.is_any_dm());

create policy "entity_images_dm_delete" on storage.objects
  for delete
  using (bucket_id = 'entity-images' and public.is_any_dm());
