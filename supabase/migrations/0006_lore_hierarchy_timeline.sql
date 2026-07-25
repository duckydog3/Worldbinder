-- Lore entries get a self-referencing parent (same pattern as
-- locations.parent_location_id) for arbitrary-depth nesting, plus two
-- optional fields for an independent timeline view. No RLS changes needed:
-- these are just more columns on the same lore_entries row, so the existing
-- visibility-scoped policies already cover them.

alter table public.lore_entries add column parent_entry_id uuid references public.lore_entries(id) on delete set null;
alter table public.lore_entries add column event_date_label text;
alter table public.lore_entries add column event_sort_value numeric;

create index lore_entries_parent_entry_id_idx on public.lore_entries(parent_entry_id);
