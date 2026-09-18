# THROWBACK

A live multiplayer aviation & space history year-guessing game built with Next.js and Supabase.

## 1. Create Supabase project

Create a project at https://supabase.com/.

Open **SQL Editor**, paste the contents of `supabase/schema.sql`, and run it.

Then go to Project Settings → API and copy:
- Project URL
- anon/public key
- service_role key

## 2. Run locally

Install Node.js LTS.

```bash
npm install
```

Create `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=YOUR_PROJECT_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE_KEY
```

Then:

```bash
npm run dev
```

Open http://localhost:3000.

## 3. Deploy to Vercel

Push this folder to GitHub, then import the repository into Vercel.

In Vercel → Project → Settings → Environment Variables, add all three variables from `.env.local`.

Redeploy after adding variables.

## 4. Game flow

- Host opens `/host`.
- Host creates a room and receives a 4-character code.
- Players open `/join`, enter the code and their name.
- Host starts the game.
- Each question has a 15-second timer.
- Player chooses a year from 1800–2026.
- Score = max(0, 100 - 4 × absolute year difference).
- Leaderboard updates every second.
- Host advances the game after each round.

## Important security note

`SUPABASE_SERVICE_ROLE_KEY` must NEVER be exposed in client-side code or committed to GitHub. Vercel environment variables keep it server-side.

The correct years are stored in `lib/events.ts` and are only returned to the host/reveal response, not the normal player game-state response.

## Images

The supplied ten images are already in `public/images/` and are referenced in `lib/events.ts`.

The cards are in the order you uploaded:
1. Lilienthal — 1893
2. Wright Flyer — 1903
3. Spirit of St. Louis — 1927
4. Bell X-1 — 1947
5. de Havilland Comet — 1952
6. Concorde — 1969
7. Apollo 11 — 1969
8. Mangalyaan — 2013
9. Falcon 9 landing — 2015
10. Aryabhata — 1975
