# NBA Prediction App - CLAUDE.md

## Project Overview

NBA playoff prediction platform where users predict game winners to earn points across playoff rounds. Features Google OAuth login, real-time game data from Balldontlie API, automatic scoring, and a leaderboard system.

## Tech Stack

- **Framework:** Next.js 15.2.4 (App Router) + React 19 + TypeScript
- **Database:** PostgreSQL (Supabase) via Prisma 6.5
- **Auth:** NextAuth.js 5 (beta) with Google OAuth
- **UI:** Tailwind CSS 3 + shadcn/ui (Radix primitives) + Lucide icons + Sonner toasts
- **Forms:** React Hook Form + Zod validation
- **External API:** Balldontlie SDK (NBA game data)
- **Date handling:** date-fns + date-fns-tz

## Project Structure

```
nba-predictor/
├── actions/          # Server actions (games, predictions, leaderboard, user, login)
├── app/
│   ├── api/[...nextauth]/   # NextAuth route handler
│   ├── (auth)/login/        # Public login page
│   └── (protected)/         # Auth-required routes
│       ├── predictions/     # Main prediction dashboard
│       ├── leaderboard/     # Points ranking
│       ├── pastGames/       # Completed games history
│       ├── admin/           # Admin panel (ADMIN role only)
│       └── rules/           # Scoring rules page
├── components/
│   ├── ui/                  # shadcn/ui primitives (60+)
│   ├── Games/               # Game cards, sections (today/all/past)
│   ├── Predicitions/        # Prediction dashboard (note: folder has typo)
│   ├── Nav/                 # Navbar with mobile responsive menu
│   ├── Signout/             # Sign out button
│   └── ThemeToggler/        # Dark/light mode toggle
├── context/          # UserContext provider
├── hooks/            # useIsMobile custom hook
├── lib/              # Prisma client, NBA API client, utils
├── prisma/           # schema.prisma
├── seed/             # DB seeding scripts (rounds, games, predictions)
├── types/            # TypeScript interfaces (games, predictions, user)
└── styles/           # Global CSS
```

## Database Schema

Four models: **User** (with ADMIN/USER roles), **Round** (playoff round with point multiplier), **Game** (NBA game from API), **Prediction** (user's pick, composite unique on userId+gameId).

Scoring system by round:
- Play In: 1 pt | First Round: 1.5 pts | Conf Semifinals: 2 pts | Conf Finals: 3 pts | Finals: 5 pts

## Common Commands

```bash
npm run dev          # Start dev server
npm run turbo        # Dev server with Turbo mode
npm run build        # prisma generate && next build
npm run lint         # ESLint
npx prisma studio    # Browse database
npx prisma db push   # Push schema changes
npx prisma generate  # Regenerate Prisma client
```

## Key Patterns

- **Server Actions** are the primary data layer — no REST API routes (except NextAuth). All in `actions/` directory.
- **Auth check** at layout level: protected layout calls `auth()` and redirects to `/login` if no session.
- **User auto-creation:** `createUserIfNotExists()` runs on login to sync Google profile to DB.
- **Game data flow:** Balldontlie API → `refreshGames()` / `refreshTodaysGames()` → local DB → UI.
- **Prediction locking:** Predictions are validated against game start time before submission.
- **Admin features:** Admin can assign rounds to games, which controls point values. Role checked via `user.role`.

## Environment Variables

```
AUTH_SECRET           # NextAuth secret key
AUTH_GOOGLE_ID        # Google OAuth client ID
AUTH_GOOGLE_SECRET    # Google OAuth client secret
DATABASE_URL          # PostgreSQL connection string (Supabase)
BALLDONTLIEAPI        # Balldontlie NBA API key
```

## Code Style

- ESLint: next/core-web-vitals + prettier + tailwindcss class ordering
- Prettier: double quotes, 2-space indent, 80 char width, import sorting
- Path alias: `@/*` maps to project root
- shadcn/ui components live in `components/ui/` — do not manually edit these

## Git Workflow

- **Protected branches:** `dev`, `staging`, `master` — never push directly
- **Main branch:** `main`
- **Feature branches:** `feat/*` naming convention
- **Remote:** `origin` → `github.com/zsg0428/nba-prediction-for-fun.git`

## Important Notes

- The `components/Predicitions/` folder has a typo (double 'i') — maintain consistency with existing naming
- React strict mode is disabled in `next.config.js`
- Remote image domains allowed: `lh3.googleusercontent.com`, `randomuser.me`
- Prisma is configured as server external package in Next.js config
- Season year is currently hardcoded to 2024 in seed scripts
