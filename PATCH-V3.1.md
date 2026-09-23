# AEROQUEST V3.1 patch

This patch is based on the successfully deployed AEROQUEST V3 Optimized build.

## Fixes

1. **Question transition lag / lost timer**
   - Host start/next actions schedule the question 5 seconds in the future.
   - Host and players poll game state every 1 second instead of 2–2.5 seconds.
   - The UI shows `GET READY` during the buffer and only starts the 30-second countdown when the scheduled start time arrives.
   - Client clocks are synchronized approximately to the server timestamp returned by the game API.
   - Throwback images are preloaded and immediately displayed when already cached.

2. **Leaderboard scoring before reveal**
   - Submitted answers are recorded immediately, but their points are marked pending.
   - `players.total_score` is updated only after the question has expired and the answer has been revealed.
   - The finalization function is idempotent and uses row locks so concurrent finalization requests cannot double-award points.

3. **Final leaderboard layout**
   - Added spacing so the `NEW EVENT` button no longer overlaps the final leaderboard.

## Supabase

Because V3 is already deployed and `migration-v3.sql` has already been run, run **only**:

`supabase/migration-v3-1.sql`

Do not rerun `schema.sql` or `migration-v3.sql`.
