// Hand-written to match supabase/migrations/0001_init.sql.
// If the schema changes, update this alongside the migration.
//
// These must be `type` aliases, not `interface` declarations — interfaces
// don't structurally satisfy `Record<string, unknown>` in the conditional
// types supabase-js uses to resolve query result types, which silently
// collapses every query to `never`.

export type CampaignStatus = "active" | "completed" | "archived";
export type MembershipRole = "dm" | "player";
export type Visibility = "hidden" | "revealed_to_specific" | "revealed_to_party";
export type DiscoveryState = "unknown" | "rumored" | "discovered";
export type LocationType =
  | "region"
  | "town"
  | "building"
  | "wound"
  | "landmark"
  | "road"
  | "other";
export type LoreCategory = "history" | "religion" | "culture" | "magic" | "creature" | "other";
export type NpcStatus = "alive" | "dead" | "missing" | "unknown";
export type AnnotationKind = "marker" | "note" | "drawing";

export type Campaign = {
  id: string;
  name: string;
  tagline: string | null;
  description: string | null;
  status: CampaignStatus;
  current_location: string | null;
  current_objective: string | null;
  latest_recap: string | null;
  map_image_url: string | null;
  created_at: string;
  updated_at: string;
};

export type Character = {
  id: string;
  campaign_id: string;
  user_id: string | null;
  name: string;
  player_name: string | null;
  portrait_url: string | null;
  short_description: string | null;
  quote: string | null;
  backstory_summary: string | null;
  character_sheet_url: string | null;
  status: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type CampaignMembership = {
  id: string;
  campaign_id: string;
  user_id: string;
  role: MembershipRole;
  character_id: string | null;
  created_at: string;
};

export type Location = {
  id: string;
  campaign_id: string;
  parent_location_id: string | null;
  name: string;
  type: LocationType;
  map_x: number | null;
  map_y: number | null;
  description_player: string | null;
  discovery_state: DiscoveryState;
  visibility: Visibility;
  revealed_to_character_ids: string[];
  is_wound: boolean;
  image_url: string | null;
  map_image_url: string | null;
  created_at: string;
  updated_at: string;
};

export type LocationSecrets = {
  location_id: string;
  campaign_id: string;
  description_dm: string | null;
  dm_notes: string | null;
};

export type Npc = {
  id: string;
  campaign_id: string;
  name: string;
  portrait_url: string | null;
  role_occupation: string | null;
  status: NpcStatus;
  tags: string[];
  appearance: string | null;
  player_visible_info: string | null;
  last_known_location_id: string | null;
  visibility: Visibility;
  revealed_to_character_ids: string[];
  created_at: string;
  updated_at: string;
};

export type NpcSecrets = {
  npc_id: string;
  campaign_id: string;
  secrets: string | null;
  hidden_motives: string | null;
  true_allegiance: string | null;
  future_plans: string | null;
  dm_notes: string | null;
};

export type LoreEntry = {
  id: string;
  campaign_id: string;
  parent_entry_id: string | null;
  title: string;
  category: LoreCategory;
  player_visible_content: string | null;
  visibility: Visibility;
  revealed_to_character_ids: string[];
  related_location_id: string | null;
  related_npc_id: string | null;
  image_url: string | null;
  event_date_label: string | null;
  event_sort_value: number | null;
  created_at: string;
  updated_at: string;
};

export type LoreSecrets = {
  lore_entry_id: string;
  campaign_id: string;
  dm_only_content: string | null;
};

export type JournalEntry = {
  id: string;
  campaign_id: string;
  character_id: string;
  user_id: string;
  content: string;
  created_at: string;
  updated_at: string;
};

export type MapAnnotation = {
  id: string;
  campaign_id: string;
  created_by_character_id: string | null;
  created_by_user_id: string | null;
  location_id: string | null;
  kind: AnnotationKind;
  data: Record<string, unknown>;
  created_at: string;
};

export type InviteCode = {
  id: string;
  campaign_id: string;
  character_id: string | null;
  code: string;
  used_by_user_id: string | null;
  created_at: string;
};

type Relationships = { Relationships: [] };

export type Database = {
  public: {
    Tables: {
      campaigns: {
        Row: Campaign;
        Insert: Partial<Campaign>;
        Update: Partial<Campaign>;
      } & Relationships;
      characters: {
        Row: Character;
        Insert: Partial<Character>;
        Update: Partial<Character>;
      } & Relationships;
      campaign_memberships: {
        Row: CampaignMembership;
        Insert: Partial<CampaignMembership>;
        Update: Partial<CampaignMembership>;
      } & Relationships;
      locations: {
        Row: Location;
        Insert: Partial<Location>;
        Update: Partial<Location>;
      } & Relationships;
      location_secrets: {
        Row: LocationSecrets;
        Insert: Partial<LocationSecrets>;
        Update: Partial<LocationSecrets>;
      } & Relationships;
      npcs: { Row: Npc; Insert: Partial<Npc>; Update: Partial<Npc> } & Relationships;
      npc_secrets: {
        Row: NpcSecrets;
        Insert: Partial<NpcSecrets>;
        Update: Partial<NpcSecrets>;
      } & Relationships;
      lore_entries: {
        Row: LoreEntry;
        Insert: Partial<LoreEntry>;
        Update: Partial<LoreEntry>;
      } & Relationships;
      lore_secrets: {
        Row: LoreSecrets;
        Insert: Partial<LoreSecrets>;
        Update: Partial<LoreSecrets>;
      } & Relationships;
      journal_entries: {
        Row: JournalEntry;
        Insert: Partial<JournalEntry>;
        Update: Partial<JournalEntry>;
      } & Relationships;
      map_annotations: {
        Row: MapAnnotation;
        Insert: Partial<MapAnnotation>;
        Update: Partial<MapAnnotation>;
      } & Relationships;
      invite_codes: {
        Row: InviteCode;
        Insert: Partial<InviteCode>;
        Update: Partial<InviteCode>;
      } & Relationships;
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
  };
};
