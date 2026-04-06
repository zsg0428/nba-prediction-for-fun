# NBA Prediction App - CLAUDE.md

## Project Overview

NBA playoff prediction platform where users predict game winners to earn points across playoff rounds. Features Google OAuth login, game data from Balldontlie API, automatic scoring, and a leaderboard system.

## Tech Stack

- **Framework:** Next.js 15.x (App Router) + React 19 + TypeScript
- **Database:** PostgreSQL (Supabase) via Prisma 6.x
- **Auth:** NextAuth.js 5 (beta) with Google OAuth (auto-detects `AUTH_GOOGLE_ID`/`AUTH_GOOGLE_SECRET`)
- **UI:** Tailwind CSS 3 + shadcn/ui (Radix primitives) + Lucide icons + Sonner toasts
- **Forms:** React Hook Form + Zod validation
- **External API:** Balldontlie SDK (NBA game data, season `2025`)
- **Date handling:** date-fns + date-fns-tz

## Project Structure

```
nba-predictor/
├── actions/          # Server actions (games, predictions, leaderboard, user, login)
├── app/
│   ├── api/
│   │   ├── [...nextauth]/       # NextAuth route handler
│   │   └── cron/refresh-games/  # Cron endpoint for auto game refresh
│   ├── (auth)/login/            # Public login page
│   └── (protected)/             # Auth-required routes
│       ├── predictions/         # Main prediction dashboard
│       ├── leaderboard/         # Points ranking
│       ├── pastGames/           # Completed games history
│       ├── admin/               # Admin panel (ADMIN role only)
│       └── rules/               # Scoring rules page
├── components/
│   ├── ui/                  # shadcn/ui primitives (60+)
│   ├── Admin/               # Admin refresh buttons
│   ├── Games/               # Game cards, sections (today/all/past)
│   ├── Predicitions/        # Prediction dashboard (note: folder has typo, keep for consistency)
│   ├── Nav/                 # Navbar with mobile responsive menu
│   ├── Signout/             # Sign out button
│   └── ThemeToggler/        # Dark/light mode toggle
├── context/          # UserContext provider
├── hooks/            # useIsMobile custom hook
├── lib/              # Prisma client, NBA API client, utils
├── prisma/           # schema.prisma
├── seed/             # DB seeding scripts (rounds, games)
├── types/            # TypeScript interfaces (Game, Prediction, User)
└── styles/           # Global CSS
```

## Database Schema

Four models: **User** (with ADMIN/USER roles), **Round** (playoff round with point multiplier), **Game** (NBA game with scores/status), **Prediction** (user's pick, composite unique on userId+gameId).

Key Game fields: `homeTeam`, `awayTeam`, `startTime`, `homeTeamScore`, `awayTeamScore`, `status` (Scheduled/Final/etc), `winnerTeam`, `isPlayoff`.

Scoring system by round:
- Play In: 1 pt | First Round: 1.5 pts | Conf Semifinals: 2 pts | Conf Finals: 3 pts | Finals: 5 pts

## Data Flow Architecture

### Page loads (fast, no API calls)
- All pages read from **database only** — no external API calls on page load
- Leaderboard points are calculated in real-time from `isCorrect` predictions

### Data refresh (API → DB)
Two ways to trigger:
1. **Vercel Cron Job** — daily at 10:00 UTC (`/api/cron/refresh-games`, protected by `CRON_SECRET`)
2. **Admin manual refresh** — button on `/admin` page

Refresh flow: `Balldontlie API` → upsert games (past 3 days to +1 month) → auto-assign playoff rounds → judge prediction correctness → DB updated

## Common Commands

```bash
npm run dev          # Start dev server
npm run turbo        # Dev server with Turbo mode
npm run build        # prisma generate && next build
npm run lint         # ESLint
npx prisma studio    # Browse database
npx prisma db push   # Push schema changes
npx prisma generate  # Regenerate Prisma client
npx tsx seed/seedRounds.ts   # Seed round data
npx tsx seed/seedGames.ts    # Seed games from API
```

## Key Patterns

- **Server Actions** are the primary data layer — no REST API routes (except NextAuth + cron).
- **Auth check** at layout level: protected layout calls `auth()` and redirects to `/login` if no session.
- **User auto-creation:** `createUserIfNotExists()` runs on login to sync Google profile to DB.
- **Prediction locking:** Predictions are validated against game start time before submission.
- **Admin features:** Admin can assign rounds to games, trigger data refresh. Use `Role.ADMIN` enum from Prisma, not string literals.
- **Round auto-assignment:** `refreshGameRounds()` automatically assigns playoff rounds based on team matchup history.

## Environment Variables

```
AUTH_SECRET           # NextAuth secret key
AUTH_GOOGLE_ID        # Google OAuth client ID (NextAuth auto-detects)
AUTH_GOOGLE_SECRET    # Google OAuth client secret (NextAuth auto-detects)
DATABASE_URL          # PostgreSQL connection string (Supabase pooler, pgbouncer)
DIRECT_URL            # PostgreSQL direct connection (for Prisma migrations)
BALLDONTLIEAPI        # Balldontlie NBA API key
CRON_SECRET           # Secret for /api/cron/refresh-games endpoint
```

## Code Style

- ESLint: next/core-web-vitals + prettier + tailwindcss class ordering
- Prettier: double quotes, 2-space indent, 80 char width, import sorting
- Path alias: `@/*` maps to project root
- shadcn/ui components live in `components/ui/` — do not manually edit these
- Use `Role.ADMIN` enum from `@prisma/client`, not string `"ADMIN"`
- Avoid `any` types — use `Game` from `@/types/IGames` for game data
- Don't use `"No"` or magic strings as error markers in DB fields

## Git Workflow

- **Protected branches:** `dev`, `staging`, `master` — never push directly
- **Main branch:** `main`
- **Feature branches:** `feat/*`, `fix/*`, `refactor/*` naming convention
- **Remote:** `origin` → `github.com/zsg0428/nba-prediction-for-fun.git`

## Deployment

- **Platform:** Vercel (Hobby plan)
- **Cron:** Daily at 10:00 UTC (Hobby plan limit: once per day)
- **Auto-deploy:** Pushes to `main` trigger production deployment
- **Vercel project:** `nba-prediction-for-fun` under `dempseys-projects-635500ca`

## Important Notes

- The `components/Predicitions/` folder has a typo (double 'i') — maintain consistency with existing naming
- Remote image domains allowed: `lh3.googleusercontent.com`, `randomuser.me`
- Prisma is configured as server external package in Next.js config
- NBA season year is `2025` (for the 2025-26 season) — hardcoded in `actions/games.ts`
- Balldontlie API free tier has rate limiting (~30 req/min) — never call API on page load
