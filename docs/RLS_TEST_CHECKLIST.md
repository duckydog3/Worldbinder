# RLS Test Checklist

This is the primary acceptance criterion for Worldbinder V1 (see the build
spec, Section 4 and Section 12) — the DM/player split has to hold at the
database layer, not just in the UI. This checklist has to be run against a
**real Supabase project** (local via Docker, or your actual project) with all
four accounts signed up; it was written but not executed by Claude Code,
because this build environment has no Docker and can't run a Postgres
instance to test RLS against. Treat every row below as unverified until you
run it.

## How to run this

1. Apply the migrations (`supabase/migrations/0001_init.sql` through
   `0003_map_image.sql`) and `supabase/seed.sql` to your project.
2. Have the DM sign up via `/dm-setup`, and all three players claim their
   invite links via `/join/<code>` (see `/admin/invites` for the links).
3. Open the Supabase SQL editor and run the first two queries in
   `supabase/rls_test_harness.sql` to get each user's UUID and a couple of
   NPC/location ids to test against.
4. For each row below, run the `begin; set local role authenticated; set
   local "request.jwt.claims" = '{"sub": "<uuid>", "role": "authenticated"}';
   <query>; rollback;` pattern from the harness, substituting the right user
   and table. Mark the row pass/fail.

Because this is a 4-person campaign, it's fastest to do this as one pass per
account (DM, Lilly, Aiden, Brody) running all the rows for that account in
sequence, rather than jumping table-to-table.

## As the DM

| # | Check | Expected |
|---|---|---|
| 1 | `select * from campaigns` | Returns the campaign |
| 2 | `update campaigns set current_objective = 'test'` | Succeeds |
| 3 | `select * from npcs` | Returns **all** NPCs, including `hidden` ones |
| 4 | `select * from npc_secrets` | Returns all secrets rows |
| 5 | `insert into npcs (...)`, `update`, `delete` | All succeed |
| 6 | `select * from locations` | Returns all locations, including hidden Wounds |
| 7 | `select * from location_secrets` | Returns all rows |
| 8 | `select * from lore_entries` / `lore_secrets` | Returns all rows |
| 9 | `select * from characters` | Returns all 3 PCs |
| 10 | `update characters set short_description = 'x' where id = '<Lilly's id>'` | Succeeds (DM can edit any PC) |
| 11 | `select * from campaign_memberships` | Returns all 4 memberships |
| 12 | `select * from journal_entries` | Returns **zero rows** — DM cannot read any player's journal, even their own imaginary one |
| 13 | `select * from map_annotations` | Returns **zero rows** — this is the one place the DM is deliberately locked out |
| 14 | `select * from invite_codes` | Returns all invite codes |

## As a player (repeat for Lilly, Aiden, Brody)

| # | Check | Expected |
|---|---|---|
| 1 | `select * from campaigns` | Returns the campaign |
| 2 | `update campaigns set current_objective = 'test'` | 0 rows affected (RLS silently blocks — no error, just no write) |
| 3 | `select * from npcs` | Returns only rows with `visibility = 'revealed_to_party'`, or `revealed_to_specific` where this player's character is in `revealed_to_character_ids`. **Zero `hidden` rows.** |
| 4 | `select * from npc_secrets` | **Zero rows, for every NPC**, even ones visible to this player |
| 5 | `insert into npcs (...)` | Fails / 0 rows |
| 6 | `select * from locations` | Same visibility rule as #3. The 5 seeded Wounds (`hidden`) must not appear. Greyfen and The Wayhouse (`revealed_to_party`) must appear. |
| 7 | `select * from location_secrets` | Zero rows |
| 8 | `select * from lore_entries` / `lore_secrets` | Same pattern as NPCs |
| 9 | `select * from characters` | Returns all 3 PCs (roster is public within the party) |
| 10 | `update characters set short_description='x' where id = '<own character id>'` | Succeeds |
| 11 | `update characters set short_description='x' where id = '<another player's character id>'` | 0 rows affected |
| 12 | `select * from campaign_memberships` | Returns all 4 memberships (can see who's in the party) |
| 13 | `select * from journal_entries` | Returns **only this player's own entries** |
| 14 | Insert a journal entry with someone else's `user_id` | Fails / 0 rows |
| 15 | `select * from map_annotations` | Returns all party annotations (own + other players') |
| 16 | Insert a map annotation | Succeeds |
| 17 | `select * from invite_codes` | Returns **zero rows** — not listable by players |

## Cross-player checks (do these once, not per-account)

| # | Check | Expected |
|---|---|---|
| 18 | As Lilly, `select * from journal_entries` where a row belongs to Aiden's `user_id` | That row is absent |
| 19 | Create an NPC with `visibility = 'revealed_to_specific'` and only Aiden's character id in `revealed_to_character_ids`. As Aiden: `select` it | Row appears |
| 20 | Same NPC, as Lilly or Brody | Row is absent |
| 21 | As any player, query `npcs`/`locations`/`lore_entries` directly via the browser's network tab or a raw `curl` to the Supabase REST endpoint with that player's JWT (not through the app UI) | Same filtered results as through the UI — confirms the block isn't just a UI hide |

## Definition of done for this checklist

All rows above pass, for all three players and the DM, on the actual
deployed database — not assumed from reading the policy SQL. Re-run this any
time a migration touches RLS policies.
