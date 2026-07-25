-- Worldbinder V1 schema — "The Wounds"
-- Tables + helper functions + updated_at triggers.
-- RLS policies live in 0002_rls.sql (kept separate so schema and access-control
-- can be read/reviewed independently).

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- updated_at trigger helper
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- campaigns
-- ---------------------------------------------------------------------------
create table public.campaigns (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  tagline text,
  description text,
  status text not null default 'active' check (status in ('active', 'completed', 'archived')),
  current_location text,
  current_objective text,
  latest_recap text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger campaigns_set_updated_at
  before update on public.campaigns
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- characters (player characters)
-- ---------------------------------------------------------------------------
create table public.characters (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.campaigns(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  name text not null,
  player_name text,
  portrait_url text,
  short_description text,
  quote text,
  backstory_summary text,
  character_sheet_url text,
  status text not null default 'active',
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index characters_campaign_id_idx on public.characters(campaign_id);
create index characters_user_id_idx on public.characters(user_id);

create trigger characters_set_updated_at
  before update on public.characters
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- campaign_memberships
-- ---------------------------------------------------------------------------
create table public.campaign_memberships (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.campaigns(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('dm', 'player')),
  character_id uuid references public.characters(id) on delete set null,
  created_at timestamptz not null default now(),
  unique (campaign_id, user_id)
);

create index campaign_memberships_campaign_id_idx on public.campaign_memberships(campaign_id);
create index campaign_memberships_user_id_idx on public.campaign_memberships(user_id);

-- ---------------------------------------------------------------------------
-- helper functions used by RLS policies (security definer so they can read
-- campaign_memberships without triggering recursive RLS evaluation — they
-- run as the function owner, which owns the tables and therefore bypasses RLS).
-- ---------------------------------------------------------------------------
create or replace function public.is_campaign_member(p_campaign_id uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.campaign_memberships
    where campaign_id = p_campaign_id and user_id = auth.uid()
  );
$$;

create or replace function public.is_campaign_dm(p_campaign_id uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.campaign_memberships
    where campaign_id = p_campaign_id and user_id = auth.uid() and role = 'dm'
  );
$$;

create or replace function public.is_campaign_player(p_campaign_id uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.campaign_memberships
    where campaign_id = p_campaign_id and user_id = auth.uid() and role = 'player'
  );
$$;

create or replace function public.my_character_id(p_campaign_id uuid)
returns uuid
language sql
security definer
stable
set search_path = public
as $$
  select character_id from public.campaign_memberships
  where campaign_id = p_campaign_id and user_id = auth.uid()
  limit 1;
$$;

-- ---------------------------------------------------------------------------
-- locations (tree via parent_location_id)
-- ---------------------------------------------------------------------------
create table public.locations (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.campaigns(id) on delete cascade,
  parent_location_id uuid references public.locations(id) on delete set null,
  name text not null,
  type text not null default 'other' check (type in ('region', 'town', 'building', 'wound', 'landmark', 'road', 'other')),
  map_x numeric,
  map_y numeric,
  description_player text,
  discovery_state text not null default 'unknown' check (discovery_state in ('unknown', 'rumored', 'discovered')),
  visibility text not null default 'hidden' check (visibility in ('hidden', 'revealed_to_specific', 'revealed_to_party')),
  revealed_to_character_ids uuid[] not null default '{}',
  is_wound boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index locations_campaign_id_idx on public.locations(campaign_id);
create index locations_parent_location_id_idx on public.locations(parent_location_id);

create trigger locations_set_updated_at
  before update on public.locations
  for each row execute function public.set_updated_at();

create table public.location_secrets (
  location_id uuid primary key references public.locations(id) on delete cascade,
  campaign_id uuid not null references public.campaigns(id) on delete cascade,
  description_dm text,
  dm_notes text
);

create index location_secrets_campaign_id_idx on public.location_secrets(campaign_id);

-- ---------------------------------------------------------------------------
-- npcs
-- ---------------------------------------------------------------------------
create table public.npcs (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.campaigns(id) on delete cascade,
  name text not null,
  portrait_url text,
  role_occupation text,
  status text not null default 'alive' check (status in ('alive', 'dead', 'missing', 'unknown')),
  tags text[] not null default '{}',
  appearance text,
  player_visible_info text,
  last_known_location_id uuid references public.locations(id) on delete set null,
  visibility text not null default 'hidden' check (visibility in ('hidden', 'revealed_to_specific', 'revealed_to_party')),
  revealed_to_character_ids uuid[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index npcs_campaign_id_idx on public.npcs(campaign_id);

create trigger npcs_set_updated_at
  before update on public.npcs
  for each row execute function public.set_updated_at();

create table public.npc_secrets (
  npc_id uuid primary key references public.npcs(id) on delete cascade,
  campaign_id uuid not null references public.campaigns(id) on delete cascade,
  secrets text,
  hidden_motives text,
  true_allegiance text,
  future_plans text,
  dm_notes text
);

create index npc_secrets_campaign_id_idx on public.npc_secrets(campaign_id);

-- ---------------------------------------------------------------------------
-- lore_entries
-- ---------------------------------------------------------------------------
create table public.lore_entries (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.campaigns(id) on delete cascade,
  title text not null,
  category text not null default 'other' check (category in ('history', 'religion', 'culture', 'magic', 'creature', 'other')),
  player_visible_content text,
  visibility text not null default 'hidden' check (visibility in ('hidden', 'revealed_to_specific', 'revealed_to_party')),
  revealed_to_character_ids uuid[] not null default '{}',
  related_location_id uuid references public.locations(id) on delete set null,
  related_npc_id uuid references public.npcs(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index lore_entries_campaign_id_idx on public.lore_entries(campaign_id);

create trigger lore_entries_set_updated_at
  before update on public.lore_entries
  for each row execute function public.set_updated_at();

create table public.lore_secrets (
  lore_entry_id uuid primary key references public.lore_entries(id) on delete cascade,
  campaign_id uuid not null references public.campaigns(id) on delete cascade,
  dm_only_content text
);

create index lore_secrets_campaign_id_idx on public.lore_secrets(campaign_id);

-- ---------------------------------------------------------------------------
-- journal_entries — private to the owning player; DM cannot read by default
-- ---------------------------------------------------------------------------
create table public.journal_entries (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.campaigns(id) on delete cascade,
  character_id uuid not null references public.characters(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  content text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index journal_entries_campaign_id_idx on public.journal_entries(campaign_id);
create index journal_entries_user_id_idx on public.journal_entries(user_id);

create trigger journal_entries_set_updated_at
  before update on public.journal_entries
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- map_annotations — shared party layer, deliberately invisible to the DM
-- ---------------------------------------------------------------------------
create table public.map_annotations (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.campaigns(id) on delete cascade,
  created_by_character_id uuid references public.characters(id) on delete set null,
  created_by_user_id uuid references auth.users(id) on delete set null,
  location_id uuid references public.locations(id) on delete set null,
  kind text not null default 'note' check (kind in ('marker', 'note', 'drawing')),
  data jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create index map_annotations_campaign_id_idx on public.map_annotations(campaign_id);
create index map_annotations_location_id_idx on public.map_annotations(location_id);

-- ---------------------------------------------------------------------------
-- invite_codes
-- ---------------------------------------------------------------------------
create table public.invite_codes (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.campaigns(id) on delete cascade,
  character_id uuid references public.characters(id) on delete set null,
  code text not null unique,
  used_by_user_id uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create index invite_codes_campaign_id_idx on public.invite_codes(campaign_id);
