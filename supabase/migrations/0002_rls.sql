-- Worldbinder V1 — Row Level Security policies.
--
-- Table-level split (npcs/locations/lore_entries vs their *_secrets tables) is
-- what makes the DM/player split enforceable at the database layer: players
-- get zero grants on *_secrets tables, so RLS denies the whole table outright
-- rather than relying on a policy correctly filtering columns.
--
-- Campaign creation and invite-code claiming happen server-side with the
-- Supabase service role key (bypasses RLS), never through client INSERT
-- policies — see src/app/join/[code]/actions.ts and DM signup. That keeps
-- this file free of bootstrap special-cases.

alter table public.campaigns enable row level security;
alter table public.characters enable row level security;
alter table public.campaign_memberships enable row level security;
alter table public.locations enable row level security;
alter table public.location_secrets enable row level security;
alter table public.npcs enable row level security;
alter table public.npc_secrets enable row level security;
alter table public.lore_entries enable row level security;
alter table public.lore_secrets enable row level security;
alter table public.journal_entries enable row level security;
alter table public.map_annotations enable row level security;
alter table public.invite_codes enable row level security;

-- ---------------------------------------------------------------------------
-- campaigns — readable by any member, writable by DM only
-- ---------------------------------------------------------------------------
create policy "campaigns_select_members" on public.campaigns
  for select
  using (public.is_campaign_member(id));

create policy "campaigns_update_dm" on public.campaigns
  for update
  using (public.is_campaign_dm(id))
  with check (public.is_campaign_dm(id));

-- No client-side INSERT/DELETE policy: the single campaign row is created by
-- the seed script / DM signup server action using the service role key.

-- ---------------------------------------------------------------------------
-- characters — roster is public within the party; self-edit or DM edit
-- ---------------------------------------------------------------------------
create policy "characters_select_members" on public.characters
  for select
  using (public.is_campaign_member(campaign_id));

create policy "characters_update_owner_or_dm" on public.characters
  for update
  using (user_id = auth.uid() or public.is_campaign_dm(campaign_id))
  with check (user_id = auth.uid() or public.is_campaign_dm(campaign_id));

create policy "characters_insert_dm" on public.characters
  for insert
  with check (public.is_campaign_dm(campaign_id));

create policy "characters_delete_dm" on public.characters
  for delete
  using (public.is_campaign_dm(campaign_id));

-- ---------------------------------------------------------------------------
-- campaign_memberships — members can see the roster of who's in the campaign;
-- only the DM manages membership rows via the client. Invite-code claiming is
-- done server-side with the service role key, not through a client policy.
-- ---------------------------------------------------------------------------
create policy "memberships_select_members" on public.campaign_memberships
  for select
  using (public.is_campaign_member(campaign_id));

create policy "memberships_update_dm" on public.campaign_memberships
  for update
  using (public.is_campaign_dm(campaign_id))
  with check (public.is_campaign_dm(campaign_id));

create policy "memberships_delete_dm" on public.campaign_memberships
  for delete
  using (public.is_campaign_dm(campaign_id));

-- ---------------------------------------------------------------------------
-- locations — fog of war. Hidden rows are invisible to players outright.
-- ---------------------------------------------------------------------------
create policy "locations_select_visible" on public.locations
  for select
  using (
    public.is_campaign_dm(campaign_id)
    or visibility = 'revealed_to_party'
    or (
      visibility = 'revealed_to_specific'
      and public.my_character_id(campaign_id) = any (revealed_to_character_ids)
    )
  );

create policy "locations_insert_dm" on public.locations
  for insert
  with check (public.is_campaign_dm(campaign_id));

create policy "locations_update_dm" on public.locations
  for update
  using (public.is_campaign_dm(campaign_id))
  with check (public.is_campaign_dm(campaign_id));

create policy "locations_delete_dm" on public.locations
  for delete
  using (public.is_campaign_dm(campaign_id));

-- location_secrets — DM only, full stop. No policy exists for player role,
-- which means players get zero rows and zero column visibility.
create policy "location_secrets_dm_all" on public.location_secrets
  for all
  using (public.is_campaign_dm(campaign_id))
  with check (public.is_campaign_dm(campaign_id));

-- ---------------------------------------------------------------------------
-- npcs — same visibility pattern as locations
-- ---------------------------------------------------------------------------
create policy "npcs_select_visible" on public.npcs
  for select
  using (
    public.is_campaign_dm(campaign_id)
    or visibility = 'revealed_to_party'
    or (
      visibility = 'revealed_to_specific'
      and public.my_character_id(campaign_id) = any (revealed_to_character_ids)
    )
  );

create policy "npcs_insert_dm" on public.npcs
  for insert
  with check (public.is_campaign_dm(campaign_id));

create policy "npcs_update_dm" on public.npcs
  for update
  using (public.is_campaign_dm(campaign_id))
  with check (public.is_campaign_dm(campaign_id));

create policy "npcs_delete_dm" on public.npcs
  for delete
  using (public.is_campaign_dm(campaign_id));

create policy "npc_secrets_dm_all" on public.npc_secrets
  for all
  using (public.is_campaign_dm(campaign_id))
  with check (public.is_campaign_dm(campaign_id));

-- ---------------------------------------------------------------------------
-- lore_entries — same visibility pattern again
-- ---------------------------------------------------------------------------
create policy "lore_entries_select_visible" on public.lore_entries
  for select
  using (
    public.is_campaign_dm(campaign_id)
    or visibility = 'revealed_to_party'
    or (
      visibility = 'revealed_to_specific'
      and public.my_character_id(campaign_id) = any (revealed_to_character_ids)
    )
  );

create policy "lore_entries_insert_dm" on public.lore_entries
  for insert
  with check (public.is_campaign_dm(campaign_id));

create policy "lore_entries_update_dm" on public.lore_entries
  for update
  using (public.is_campaign_dm(campaign_id))
  with check (public.is_campaign_dm(campaign_id));

create policy "lore_entries_delete_dm" on public.lore_entries
  for delete
  using (public.is_campaign_dm(campaign_id));

create policy "lore_secrets_dm_all" on public.lore_secrets
  for all
  using (public.is_campaign_dm(campaign_id))
  with check (public.is_campaign_dm(campaign_id));

-- ---------------------------------------------------------------------------
-- journal_entries — private to the owning player. Not even the DM gets a
-- policy here on purpose.
-- ---------------------------------------------------------------------------
create policy "journal_entries_owner_all" on public.journal_entries
  for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- map_annotations — players only, DM deliberately excluded (no dm policy
-- exists at all, so is_campaign_dm rows get zero access here).
-- ---------------------------------------------------------------------------
create policy "map_annotations_players_all" on public.map_annotations
  for all
  using (public.is_campaign_player(campaign_id))
  with check (public.is_campaign_player(campaign_id));

-- ---------------------------------------------------------------------------
-- invite_codes — DM manages; never listable by players. Claiming an invite
-- happens server-side via the service role key (see join flow), which
-- bypasses RLS entirely, so no player-facing policy is defined here.
-- ---------------------------------------------------------------------------
create policy "invite_codes_dm_all" on public.invite_codes
  for all
  using (public.is_campaign_dm(campaign_id))
  with check (public.is_campaign_dm(campaign_id));
