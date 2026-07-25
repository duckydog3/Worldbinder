# Worldbinder — The Wounds

A private campaign archive for one D&D 5e group: one DM, three players
(Lilly, Aiden, Brody). Next.js (App Router, TypeScript) + Tailwind CSS +
Supabase (Postgres, Auth, Storage), deployed on Vercel.

The core design constraint: every NPC, location, and lore entry has a
DM-only version and a player-visible version, enforced by Postgres Row Level
Security — not by hiding things in the UI. See
[`docs/RLS_TEST_CHECKLIST.md`](docs/RLS_TEST_CHECKLIST.md) before treating
that as trustworthy; it has to be run against a real database.

## Stack

- Next.js App Router, TypeScript, Tailwind CSS v4
- Supabase: Postgres + Row Level Security, Auth (email/password), Storage
  (map background image)
- Vercel hosting, auto-deploy from GitHub

## Local setup

```bash
npm install
cp .env.example .env.local
```

Fill in `.env.local` with your Supabase project's URL, anon key, and service
role key (Project Settings → API in the Supabase dashboard).

```bash
npm run dev
```

## Database setup (do this once, against your actual Supabase project)

There's no Docker in some environments (including the one this was built
in), so the migrations below were written and type-checked against the
schema, but **not executed against a live Postgres instance**. Run them
yourself before trusting the app:

1. In the Supabase SQL editor, run the migrations in order:
   - `supabase/migrations/0001_init.sql` — tables, helper functions, indexes
   - `supabase/migrations/0002_rls.sql` — Row Level Security policies
   - `supabase/migrations/0003_map_image.sql` — map image storage bucket
2. Run `supabase/seed.sql` once — seeds the campaign, Lilly/Aiden/Brody, and
   the 5 hidden Wounds locations. It's a no-op if the campaign table isn't
   empty, so it's safe to run only once and leave alone after.
3. In Supabase Auth settings, decide whether to require email confirmation.
   For a 4-person private app, turning **Confirm email** off (Authentication
   → Providers → Email) is simplest — password signup logs the user in
   immediately. If you leave it on, signup still works, it just needs an
   email click before the first login.
4. Follow [`docs/RLS_TEST_CHECKLIST.md`](docs/RLS_TEST_CHECKLIST.md) — this
   is the real definition of done, not the UI working.

## Onboarding flow

1. DM visits `/dm-setup`, creates an account. This only works once — after
   the first DM account claims the seat, `/dm-setup` redirects to login.
2. DM opens `/admin/invites` and copies each player's join link.
3. Each player opens their link, creates an account, and is automatically
   attached to their character.

## Deployment (Vercel)

1. Push this repo to GitHub.
2. Import it into Vercel, connect the GitHub repo for auto-deploy on push.
3. Add environment variables in Vercel (Project Settings → Environment
   Variables): `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
   `SUPABASE_SERVICE_ROLE_KEY` (server-only — don't prefix it `NEXT_PUBLIC_`).
4. Deploy, then run the database setup steps above against the same
   Supabase project if you haven't already.
5. Supabase free-tier projects pause after about a week with no API
   activity — unpausing is one click in the dashboard and doesn't lose data.

## Project structure

- `src/app/(app)/` — authenticated pages (campaign home, characters, NPCs,
  lore, map, journal, DM admin), behind a layout that requires a session and
  campaign membership
- `src/app/login`, `src/app/dm-setup`, `src/app/join/[code]`,
  `src/app/onboarding` — auth/onboarding, outside the authenticated shell
- `src/lib/supabase/` — browser client, server client (RLS-scoped), admin
  client (service role, used only for DM-seat claiming and invite-code
  claiming), middleware session refresh
- `src/lib/session.ts` — resolves the current user's campaign membership +
  character in one call
- `supabase/migrations/` — schema + RLS, in order
- `supabase/seed.sql` — The Wounds starting data
- `docs/RLS_TEST_CHECKLIST.md` — the security acceptance test

## What's deliberately not built (V1 scope)

Dice/combat/VTT features, a rules or spell reference, a built-in character
sheet, multi-campaign support, real-time sync, faction/relationship graphs,
per-player-private map annotations, notifications. See the build spec,
Section 8, if any of these come up later.
