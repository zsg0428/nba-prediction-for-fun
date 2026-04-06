# Revive NBA Prediction Project for 2025-26 Season

## Status
- [x] New Supabase project created (nba-prediction-2026)
- [x] DATABASE_URL and DIRECT_URL updated in .env
- [x] Prisma schema updated with directUrl
- [x] Schema pushed to new DB
- [x] Rounds seeded
- [x] Vercel environment variables updated

## Remaining Code Fixes

### 1. Season Hardcode: 2024 → 2025
**Files to change:**
- `actions/games.ts` — all API calls use `seasons: [2024]`, need to change to `[2025]`
  - `fetchGames()` (line 13)
  - `fetchGamesWithinDayRange()` (line 24)
  - `fetchGamesInSingleDay()` (line 34)

**Approach:** Replace hardcoded `2024` with `2025`. Optionally make it dynamic based on current date (if month >= October, use current year; otherwise use current year - 1). NBA seasons span two calendar years — the 2025-26 season is referenced as `2025` in the API.

### 2. Auth Environment Variable Mismatch
**File:** `auth.ts`
- Currently uses `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`
- `.env` defines `AUTH_GOOGLE_ID` and `AUTH_GOOGLE_SECRET`
- NextAuth v5 auto-reads `AUTH_GOOGLE_ID`/`AUTH_GOOGLE_SECRET` when no explicit config is provided

**Fix:** Remove the explicit `clientId`/`clientSecret` from `auth.ts` and let NextAuth v5 auto-detect from `AUTH_GOOGLE_*` env vars. Or simply add `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` to `.env` matching the existing values.

**Recommendation:** Remove explicit config — cleaner, follows NextAuth v5 convention.

### 3. Seed Games for New Season
After code fixes, run:
```bash
npx tsx seed/seedGames.ts
```
This will pull current season games from Balldontlie API into the new DB.

### 4. Google OAuth Redirect URI
**Check needed:** Verify that Google Cloud Console OAuth credentials have the correct redirect URIs for both:
- `http://localhost:3000/api/auth/callback/google` (dev)
- `https://your-vercel-domain.vercel.app/api/auth/callback/google` (prod)

### 5. Redeploy on Vercel
After all code fixes are committed and pushed, trigger a new deployment on Vercel.

## Optional Improvements (not blocking)
- Update Prisma from 6.5.0 to 7.x (major version, may have breaking changes)
- Dynamic season calculation instead of hardcoded year
- Fix `Predicitions` folder typo → `Predictions`
