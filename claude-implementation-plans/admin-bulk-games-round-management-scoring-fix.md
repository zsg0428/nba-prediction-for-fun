# Admin Bulk Game Management, Round Point Management & Scoring Bug Fix

## Overview

Three items:
1. **Bulk Game-to-Round Management** — Admin UI to manage games in bulk (filter by date, multi-select, assign/remove rounds)
2. **Round Points Management** — Admin UI to edit round point values (currently hardcoded in UI, seeded in DB)
3. **Scoring Bug Fix** — Correct predictions are not awarding points on the leaderboard

---

## Feature 1: Bulk Game-to-Round Management

### Problem
Currently, admins must go to each individual game card on the `/predictions` page and use the `AssignRoundAndPoints` component to assign rounds one-by-one. With many games per day, this is tedious.

### Solution
Add a new section on the `/admin` page: a bulk game management panel where games are grouped by date, with multi-select and bulk round assignment/removal.

### Implementation Steps

#### 1.1 — New Server Action: Fetch Games Grouped by Date
**File:** `actions/games.ts`

- Add `fetchPlayoffGamesGroupedByDate()` — returns all playoff games from DB, grouped by date string (ET timezone), including their current round assignment
- Each game object should include: `apiGameId`, `homeTeam`, `awayTeam`, `startTime`, `status`, `round` (name or null), `roundId`

#### 1.2 — New Server Action: Bulk Assign Round
**File:** `actions/games.ts`

- Add `bulkAssignGameRound(gameApiIds: number[], roundName: string)` — assigns the given round to all specified games in a single transaction
- Add `bulkRemoveGameRound(gameApiIds: number[])` — removes round assignment from all specified games

#### 1.3 — New Client Component: BulkGameManager
**File:** `components/Admin/BulkGameManager.tsx`

UI design:
- **Date filter/grouping**: Games listed under date headers (e.g., "Apr 19, 2026"), sorted chronologically
- **Game rows**: Each row shows: checkbox | home team vs away team | time | current round badge (or "Unassigned")
- **Selection controls**: "Select All" checkbox per date group, "Select All" global
- **Action bar** (sticky bottom or top when selections active):
  - Round dropdown (same options as existing: Play In, First Round, Conf Semifinals, Conf Finals, Finals) — but fetched from DB, not hardcoded
  - "Assign Round" button — bulk assigns selected games to chosen round
  - "Remove Round" button — bulk removes round from selected games
- **Visual feedback**: Toast on success/error, optimistic UI update or `router.refresh()`

#### 1.4 — Wire into Admin Page
**File:** `app/(protected)/admin/page.tsx`

- Fetch playoff games grouped by date (server-side)
- Fetch rounds from DB (for the dropdown)
- Render `BulkGameManager` below existing refresh buttons section
- Pass server actions as props for assign/remove

---

## Feature 2: Round Points Management

### Problem
Round point values are seeded in the DB but also **hardcoded** in two UI locations:
- `components/Games/AssignRoundAndPoints.tsx` (line 22-28: `ROUND_OPTIONS` array)
- `components/Predicitions/PredictionDashboard.tsx` (line 69-74: scoring rules popover)

If the admin changes point values in the DB, the UI still shows the old hardcoded values.

### Solution
1. Add an admin UI to edit round point values
2. Make all UI components read round data from the DB instead of hardcoded values

### Implementation Steps

#### 2.1 — New Server Actions for Rounds
**File:** `actions/rounds.ts` (new file)

- `fetchAllRounds()` — returns all rounds with id, name, point
- `updateRoundPoint(roundId: string, newPoint: number)` — updates the point value for a round

#### 2.2 — New Client Component: RoundPointsManager
**File:** `components/Admin/RoundPointsManager.tsx`

UI design:
- Table/list of all rounds, each row showing: round name | current point value (editable input) | save button
- Inline editing: click to edit point value, save per-row
- Toast feedback on save
- Validation: point must be > 0

#### 2.3 — Wire into Admin Page
**File:** `app/(protected)/admin/page.tsx`

- Fetch all rounds server-side
- Render `RoundPointsManager` as a new card section

#### 2.4 — Remove Hardcoded Round Values from UI Components

**File:** `components/Games/AssignRoundAndPoints.tsx`
- Remove the `ROUND_OPTIONS` constant
- Accept rounds as a prop (fetched from DB by parent)
- Or fetch rounds inside the component via server action

**File:** `components/Predicitions/PredictionDashboard.tsx`
- Remove hardcoded scoring rules in the popover (lines 69-74)
- Accept rounds as a prop and render dynamically

**File:** `app/(protected)/predictions/page.tsx`
- Fetch rounds from DB and pass to PredictionDashboard

**File:** `components/Games/TodaysGameSection.tsx` (and `AllGamesSection.tsx`)
- Pass rounds down to `AssignRoundAndPoints` if needed

---

## Feature 3: Scoring Bug Fix — Leaderboard Not Updating

### Root Cause Analysis

**CRITICAL BUG FOUND:** There is a race condition in the refresh flow that prevents predictions from ever being scored.

#### The Flow (Cron Job & Admin Refresh):
```
1. refreshGamesWithinOneMonth()  →  Sets winnerTeam for finished games
2. refreshGameRounds()           →  Assigns rounds
3. refreshPredictions()          →  Looks for games WHERE winnerTeam IS NULL
```

#### The Problem:
- Step 1 (`refreshGamesWithinOneMonth`) at `actions/games.ts:183-201` already sets `winnerTeam` for any game with `status === "Final"`:
  ```typescript
  const winnerTeam = isFinished
    ? game.home_team_score > game.visitor_team_score
      ? game.home_team.name
      : game.visitor_team.name
    : undefined;
  // ... upsert with ...(winnerTeam ? { winnerTeam } : {})
  ```

- Step 3 (`refreshPredictions`) calls `fetchAllPendingGamesFromDb()` at `actions/games.ts:117-126` which filters:
  ```typescript
  where: {
    winnerTeam: null,  // <-- These games already have winnerTeam set from Step 1!
    startTime: { lte: new Date(Date.now()) }
  }
  ```

- **Result:** `refreshPredictions()` finds ZERO pending games because Step 1 already set the `winnerTeam`. Predictions are never scored (`isCorrect` remains `null`). The leaderboard only counts predictions where `isCorrect === true`, so all points are 0.

#### Secondary Issue: Games Without Rounds
Even after fixing the scoring, `getLeaderboard()` uses `prediction?.game?.round?.point ?? 0`. If a correctly predicted game has no round assigned, it contributes 0 points. This is technically "by design" (only playoff rounds earn points), but worth noting.

### Fix Options

#### Option A: Separate the concerns (Recommended)
Change `refreshPredictions()` to NOT depend on `winnerTeam` being null. Instead:

1. Find predictions where `isCorrect IS NULL` and the game has started
2. For each such prediction, check if the game already has a `winnerTeam` in the DB
3. If yes, score the prediction directly without re-fetching from API
4. If no, fetch from API, update the game, then score

**Implementation:**

**File:** `actions/prediction.ts` — Rewrite `refreshPredictions()`:
```typescript
export const refreshPredictions = async () => {
  // Find all predictions that haven't been scored yet
  const unscoredPredictions = await prisma.prediction.findMany({
    where: { isCorrect: null },
    include: { game: true },
  });

  // Group by game to avoid duplicate API calls
  const gameIds = [...new Set(unscoredPredictions.map(p => p.gameId))];
  
  for (const gameId of gameIds) {
    const game = await prisma.game.findUnique({ where: { id: gameId } });
    if (!game || game.startTime > new Date()) continue;

    let winnerTeam = game.winnerTeam;

    // If winner not yet determined, try fetching from API
    if (!winnerTeam) {
      try {
        const apiGame = await api.nba.getGame(game.apiGameId);
        if (apiGame.data.status === "Final") {
          winnerTeam = apiGame.data.home_team_score > apiGame.data.visitor_team_score
            ? apiGame.data.home_team.name
            : apiGame.data.visitor_team.name;
          await updateGameWinnerTeam(game.id, winnerTeam);
        }
      } catch (error) {
        console.error(`Failed to fetch game ${game.apiGameId}:`, error);
        continue;
      }
    }

    // Score predictions for this game
    if (winnerTeam) {
      await upsertPredictionResult(gameId, winnerTeam);
    }
  }
};
```

**File:** `actions/games.ts` — `fetchAllPendingGamesFromDb()` can remain as-is (only used by refreshPredictions which we're rewriting), but consider removing it if no longer needed.

#### Option B: Quick fix — Don't set winnerTeam in refreshGamesWithinOneMonth
Remove the `winnerTeam` logic from `refreshGamesWithinOneMonth()` and let `refreshPredictions()` be the sole owner of setting `winnerTeam`. This is simpler but less robust — the game data would be incomplete until predictions are refreshed.

**Recommendation:** Option A is more robust and also handles edge cases like manually-triggered partial refreshes.

### Fix Step: Backfill Existing Unscored Predictions
After deploying the fix, existing predictions with `isCorrect: null` on finished games need to be scored. The rewritten `refreshPredictions()` will handle this automatically on the next run, since it looks for `isCorrect: null` instead of `winnerTeam: null`.

---

## Implementation Order

1. **Fix the scoring bug first** (Feature 3) — this is a production bug affecting all users
2. **Round points management** (Feature 2) — small, self-contained
3. **Bulk game management** (Feature 1) — largest feature, builds on top of dynamic round data from Feature 2

## Files Changed Summary

| File | Changes |
|------|---------|
| `actions/prediction.ts` | Rewrite `refreshPredictions()` to find unscored predictions |
| `actions/games.ts` | Add `fetchPlayoffGamesGroupedByDate()`, `bulkAssignGameRound()`, `bulkRemoveGameRound()` |
| `actions/rounds.ts` (new) | `fetchAllRounds()`, `updateRoundPoint()` |
| `components/Admin/BulkGameManager.tsx` (new) | Bulk game-to-round management UI |
| `components/Admin/RoundPointsManager.tsx` (new) | Round points editing UI |
| `app/(protected)/admin/page.tsx` | Add new admin sections, fetch rounds & games |
| `components/Games/AssignRoundAndPoints.tsx` | Remove hardcoded `ROUND_OPTIONS`, use DB rounds |
| `components/Predicitions/PredictionDashboard.tsx` | Remove hardcoded scoring rules, use DB rounds |
| `app/(protected)/predictions/page.tsx` | Fetch and pass rounds to dashboard |
| `components/Games/TodaysGameSection.tsx` | Pass rounds to AssignRoundAndPoints |
| `components/Games/AllGamesSection.tsx` | Pass rounds to AssignRoundAndPoints (if used) |
