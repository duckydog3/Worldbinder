-- Worldbinder RLS test harness.
--
-- Run this in the Supabase SQL editor (or `psql`) against a project that has
-- already run 0001-0003 migrations, supabase/seed.sql, and has all four real
-- accounts signed up (DM + Lilly + Aiden + Brody all claimed via their
-- invite links) — see docs/RLS_TEST_CHECKLIST.md for the full walkthrough.
--
-- The SQL editor runs as the `postgres` superuser, which bypasses RLS
-- entirely. `set local role authenticated` + a fake JWT claim is the
-- standard way to make Postgres evaluate policies as if a specific
-- Supabase Auth user were making the request — this is what actually
-- exercises the policies, not just reads the tables as admin.

-- ---------------------------------------------------------------------------
-- Step 1: collect the ids you'll need. Run this first and copy the values
-- into the \set-style placeholders below (psql) or just substitute them by
-- hand if you're pasting into the web SQL editor.
-- ---------------------------------------------------------------------------
select u.email, u.id as user_id, m.role, m.character_id, c.name as character_name
from auth.users u
join public.campaign_memberships m on m.user_id = u.id
left join public.characters c on c.id = m.character_id
order by m.role desc, c.sort_order;

select id, name, visibility, revealed_to_character_ids from public.npcs order by name;
select id, name, visibility, revealed_to_character_ids from public.locations order by name;

-- ---------------------------------------------------------------------------
-- Step 2: helper to run a block as a given user. Replace 'USER_UUID_HERE'
-- with a value from the query above, then run the SELECT statements you
-- want to test underneath it, in the same transaction.
-- ---------------------------------------------------------------------------

-- Example — run as the DM:
begin;
set local role authenticated;
set local "request.jwt.claims" = '{"sub": "USER_UUID_HERE", "role": "authenticated"}';

select count(*) as visible_npcs from public.npcs;
select count(*) as visible_npc_secrets from public.npc_secrets; -- expect 0 for players, all for DM
select count(*) as visible_journal_entries from public.journal_entries; -- expect only own
select count(*) as visible_annotations from public.map_annotations; -- expect 0 for DM

rollback; -- never commit — this block only simulates a user for the query
