-- Worldbinder seed data — "The Wounds" (Section 9 of the build spec).
-- Idempotent: safe to re-run against an empty campaigns table only (guards on
-- campaigns being empty so it won't duplicate data on a populated database).
--
-- Run this once against your Supabase project (SQL editor, or `supabase db
-- push` / `supabase db reset` locally). Everything here is a starting point
-- the DM can edit or delete freely from the DM admin area afterwards.

do $$
declare
  v_campaign_id uuid;
  v_lilly_id uuid;
  v_aiden_id uuid;
  v_brody_id uuid;
  v_greyfen_id uuid;
begin
  if exists (select 1 from public.campaigns limit 1) then
    raise notice 'campaigns table is not empty — skipping seed to avoid duplicates.';
    return;
  end if;

  insert into public.campaigns (name, tagline, description, status, current_location, current_objective, latest_recap)
  values (
    'The Wounds',
    null,
    null,
    'active',
    'Greyfen — the Wayhouse',
    'TBD — set after session 1',
    null
  )
  returning id into v_campaign_id;

  insert into public.characters (campaign_id, name, player_name, short_description, quote, backstory_summary, status, sort_order)
  values (
    v_campaign_id,
    'Lilly',
    'Kailea',
    'Aasimar Druid',
    null,
    'Disappeared into the Feywild at age 7 during a twilight walk, raised there by a family of Fey, returned to her home plane at 20. Doesn''t trust her biological mother, who raised her only briefly before the disappearance, and left home again to find herself. Still haunted by how close the Feywild feels. Traits: empathetic, fiercely loyal to friends, drawn to magic and magical places, won''t harm Fey creatures, always keeps her word, flighty and often late.',
    'active',
    1
  )
  returning id into v_lilly_id;

  insert into public.characters (campaign_id, name, player_name, short_description, quote, backstory_summary, status, sort_order)
  values (
    v_campaign_id,
    'Aiden',
    'Ansol',
    'Human-turned-Vampire Monk, ~600 years old',
    null,
    'Turned after a near-death moment defending his city as a soldier; presumed dead, erased from human records. Taken in by the vampire colony responsible, forced to comply with their norms, left after disagreeing with their ethics ~300 years ago. Respects legitimate hierarchy, not "vampire law" for its own sake. Lives as a hermit in a distant mountain range, herds animals, rations blood intake on principle, figured out how to withstand sunlight, genuinely interested in alchemy and natural science. Must return to a city roughly every ~50 years to feed on humans or suffer consequences. Currently drawn back toward civilization out of boredom, not desperation. Out of touch with modern culture and slang. Passes as human except he casts no reflection.',
    'active',
    2
  )
  returning id into v_aiden_id;

  insert into public.characters (campaign_id, name, player_name, short_description, quote, backstory_summary, status, sort_order)
  values (
    v_campaign_id,
    'Brody',
    'Brody',
    'Human Paladin, age 40',
    null,
    'Ran the family bakery until a passing Paladin saved him from an attack while foraging, sparking a late-life pivot to adventuring. Built for max damage over support. Physically average, not naturally talented, but precise, procedural, and consistent — a baker''s mindset applied to combat, no half-assing. No spouse or kids; cares for both live-in parents. Grandparents were powerful adventurers; parents banned adventuring after their deaths and pushed baking instead — Brody is quietly breaking that pattern.',
    'active',
    3
  )
  returning id into v_brody_id;

  insert into public.invite_codes (campaign_id, character_id, code)
  values
    (v_campaign_id, v_lilly_id, 'LILLY-' || substr(md5(random()::text), 1, 6)),
    (v_campaign_id, v_aiden_id, 'AIDEN-' || substr(md5(random()::text), 1, 6)),
    (v_campaign_id, v_brody_id, 'BRODY-' || substr(md5(random()::text), 1, 6));

  insert into public.locations (campaign_id, name, type, description_player, discovery_state, visibility, is_wound)
  values (v_campaign_id, 'Greyfen', 'region', null, 'discovered', 'revealed_to_party', false)
  returning id into v_greyfen_id;

  insert into public.locations (campaign_id, parent_location_id, name, type, description_player, discovery_state, visibility, is_wound)
  values (v_campaign_id, v_greyfen_id, 'The Wayhouse', 'building', null, 'discovered', 'revealed_to_party', false);

  insert into public.locations (campaign_id, name, type, discovery_state, visibility, is_wound)
  values
    (v_campaign_id, 'The Low Light', 'wound', 'unknown', 'hidden', true),
    (v_campaign_id, 'The Rootless Grove', 'wound', 'unknown', 'hidden', true),
    (v_campaign_id, 'The Still Hour', 'wound', 'unknown', 'hidden', true),
    (v_campaign_id, 'The Long Fall', 'wound', 'unknown', 'hidden', true),
    (v_campaign_id, 'The Ember Vein', 'wound', 'unknown', 'hidden', true);

  raise notice 'Seeded campaign % with 3 characters, 3 invite codes, 7 locations (2 discovered, 5 hidden wounds).', v_campaign_id;
end $$;

-- Print the invite codes so the DM can copy them after seeding.
select code, character_id from public.invite_codes order by code;
