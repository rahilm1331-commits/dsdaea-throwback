# AEROQUEST

A live multiplayer aviation challenge with one room, three rounds, and one cumulative leaderboard.

## Rounds

1. **THROWBACK** — 10 aviation/space-history year-slider questions.
2. **ASCENSION** — 10 fixed-wing flight-science multiple-choice questions.
3. **IGNITION** — 10 aircraft/rocket-propulsion multiple-choice questions.

Each question runs for 30 seconds. The host screen is intended for a projector. Correct answers are hidden until the 30-second timer expires; the host then advances to the next question.

## Player reconnects

Players enter a participant ID / roll number. That ID is unique within the room. If a player disconnects, they can return to `/join`, enter the same room code and participant ID, and their existing score is restored.

## Supabase

### Existing V1/V2 database
Run **`supabase/migration-v3.sql` once** in the Supabase SQL Editor. Do not run the old schema again. The migration adds the three-round fields, participant IDs, quiz answer support, and both answer functions.

### New database
You may run `supabase/schema.sql` first and then `supabase/migration-v3.sql`.

## Environment variables

```env
NEXT_PUBLIC_SUPABASE_URL=YOUR_PROJECT_URL
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=YOUR_PUBLISHABLE_KEY
SUPABASE_SECRET_KEY=YOUR_SECRET_KEY
```

Never commit `.env.local` or the Supabase secret key.

## Deploy

Push the repository to GitHub and connect it to Vercel. Set the three environment variables in Vercel.

## Capacity notes

The app is designed for an event-sized room and uses one combined game-state/leaderboard request per client rather than separate game and leaderboard polling. Player clients poll every 2.5 seconds; the host polls every 1.5 seconds. The intended target is at least 175 simultaneous players, but an actual pre-event load test is recommended because final capacity depends on the Supabase project plan and network conditions.

## Scoring

Throwback: `max(0, 100 - 4 × year difference)`.

Ascension/Ignition: correct answers receive 50–100 points depending on how much of the 30-second window remained; incorrect answers receive 0. This can be changed when the final question/scoring rules are supplied.


## Performance notes for the 175-player event

- Player game-state polling runs every 2.5 seconds.
- Player leaderboard polling runs every 5 seconds and is served with a short CDN cache to prevent all players from repeatedly hitting Postgres for the same leaderboard.
- Host polling runs every 2 seconds and is authorized with the host token; only the host receives the full player list from the game-state endpoint.
- A composite index on `(game_id, total_score desc, joined_at asc)` is included in `migration-v3.sql` for leaderboard queries.
- Images are static WebP assets served by Vercel, not Supabase.

For an existing V1/V2 Supabase project, run `supabase/migration-v3.sql` once before using this version. Do not rerun the old schema migration.

## V3.1 patch

This version includes the V3.1 synchronization and scoring patch.

For an existing V3 Supabase project, run `supabase/migration-v3-1.sql` once after `migration-v3.sql`.

V3.1 changes:
- 5-second server-side question-start buffer so clients can receive the next question before the 30-second timer begins.
- Player/host game-state polling increased to 1 second for faster round transitions.
- Client timer uses server-clock offset estimation.
- Throwback images are treated as preloaded when available.
- Answer points are held out of the cumulative leaderboard until the question is revealed.
- Round score finalization is idempotent and protected against concurrent double-awards.
- Final leaderboard button spacing is corrected.
