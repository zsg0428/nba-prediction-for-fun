# Unbid Game Reminder System

## Overview
Add a reminder system to notify users when they have games they haven't placed predictions on. Split into two phases: in-app modal and email reminders.

---

## Phase 1: In-App Pop-up Modal

### Goal
When a user navigates to the predictions page, if they have today's games without predictions (and those games haven't started yet), show a modal reminding them.

### Implementation Steps

#### 1.1 Create Server Action: `fetchTodaysUnbidGames`
- **File**: `actions/prediction.ts`
- Add a new function that queries today's games where the current user has NO prediction and the game hasn't started yet
- Uses Prisma's `none` relation filter:
  ```typescript
  export const fetchTodaysUnbidGames = async (userId: string, todayStr: string) => {
    const startOfDay = new Date(`${todayStr}T00:00:00-04:00`);
    const endOfDay = new Date(`${todayStr}T23:59:59.999-04:00`);
    
    return await prisma.game.findMany({
      where: {
        startTime: {
          gte: startOfDay,
          lte: endOfDay,
          gt: new Date(), // hasn't started yet
        },
        predictions: {
          none: { userId },
        },
      },
      include: { round: true },
      orderBy: { startTime: "asc" },
    });
  };
  ```

#### 1.2 Pass Unbid Games Data to Dashboard
- **File**: `app/(protected)/predictions/page.tsx`
- Call `fetchTodaysUnbidGames()` on page load
- Pass the unbid games count/list to `PredictionDashboard` as a prop

#### 1.3 Create `UnbidGamesModal` Component
- **File**: `components/Predicitions/UnbidGamesModal.tsx` (keep in existing typo folder for consistency)
- Uses shadcn `Dialog` component
- Content:
  - Title: "You have X game(s) to predict!"
  - List of unbid games (home team vs away team, start time)
  - "Go to predictions" button (closes modal, scrolls to today's games section)
  - "Dismiss" / close button
- **Show condition**: Only shows if unbid games > 0
- **Session storage**: Use `sessionStorage` to only show once per browser session (key: `unbid-reminder-dismissed-{date}`), so it doesn't annoy users on every page navigation

#### 1.4 Integrate Modal into PredictionDashboard
- **File**: `components/Predicitions/PredictionDashboard.tsx`
- Render `UnbidGamesModal` with unbid games data
- Modal auto-opens on mount if there are unbid games and hasn't been dismissed this session

### Phase 1 Files Changed
| File | Change |
|------|--------|
| `actions/prediction.ts` | Add `fetchTodaysUnbidGames()` |
| `app/(protected)/predictions/page.tsx` | Fetch unbid games, pass as prop |
| `components/Predicitions/UnbidGamesModal.tsx` | **New** - Modal component |
| `components/Predicitions/PredictionDashboard.tsx` | Render modal |

---

## Phase 2: Email Reminders (via Resend)

### Goal
Send daily email reminders to users who have unbid games for today. Users can opt in/out of email notifications.

### Prerequisites
- Resend account + API key
- Add `RESEND_API_KEY` to environment variables (local `.env` + Vercel)
- Optional: Verify custom domain in Resend for branded emails

### Implementation Steps

#### 2.1 Install Resend
```bash
npm install resend
```

#### 2.2 Database Changes
- **File**: `prisma/schema.prisma`
- Add notification preference to User model:
  ```prisma
  model User {
    // ... existing fields
    emailReminders  Boolean  @default(true)  // opt-in by default
  }
  ```
- Run migration: `npx prisma migrate dev --name add-email-reminders`

#### 2.3 Create Email Service
- **File**: `lib/email.ts`
- Initialize Resend client
- Create `sendUnbidReminder()` function:
  ```typescript
  import { Resend } from 'resend';
  
  const resend = new Resend(process.env.RESEND_API_KEY);
  
  export const sendUnbidReminder = async (
    to: string, 
    userName: string, 
    unbidGames: { homeTeam: string; awayTeam: string; startTime: Date }[]
  ) => {
    await resend.emails.send({
      from: 'NBA Predictor <onboarding@resend.dev>', // or custom domain
      to,
      subject: `You have ${unbidGames.length} game(s) to predict today!`,
      html: buildReminderEmailHtml(userName, unbidGames),
    });
  };
  ```

#### 2.4 Create Email Template
- **File**: `lib/email-templates/unbid-reminder.ts`
- Build HTML email with:
  - Greeting with user's name
  - List of today's unbid games (teams + start time)
  - CTA button linking to the predictions page
  - Unsubscribe link/note
- Keep it simple — inline CSS for email compatibility

#### 2.5 Create Reminder Cron API Route
- **File**: `app/api/cron/send-reminders/route.ts`
- Protected by `CRON_SECRET` (same pattern as existing refresh-games cron)
- Logic:
  1. Get today's date (ET timezone)
  2. Fetch all games for today that haven't started yet
  3. For each user with `emailReminders: true`:
     - Check which of today's games they haven't predicted
     - If any unbid games → send reminder email
  4. Return summary of emails sent
- **Batch emails** to respect Resend rate limits (100/day free tier)

#### 2.6 Register Cron in Vercel Config
- **File**: `vercel.json` (or `vercel.ts`)
- Add second cron job:
  ```json
  {
    "crons": [
      { "path": "/api/cron/refresh-games", "schedule": "0 10 * * *" },
      { "path": "/api/cron/send-reminders", "schedule": "0 16 * * *" }
    ]
  }
  ```
- Schedule: **16:00 UTC (12:00 PM ET)** — gives users afternoon reminder before evening games
- Note: Vercel Hobby plan supports multiple cron jobs (runs once/day each)

#### 2.7 Add User Preferences UI
- **File**: `components/Nav/NavBar.tsx` or create a settings dropdown
- Add toggle for email reminders in user menu/avatar dropdown
- Server action to update `emailReminders` preference:
  ```typescript
  export const updateEmailPreference = async (userId: string, enabled: boolean) => {
    await prisma.user.update({
      where: { id: userId },
      data: { emailReminders: enabled },
    });
  };
  ```

### Phase 2 Files Changed
| File | Change |
|------|--------|
| `prisma/schema.prisma` | Add `emailReminders` field to User |
| `lib/email.ts` | **New** - Resend client & send function |
| `lib/email-templates/unbid-reminder.ts` | **New** - Email HTML template |
| `app/api/cron/send-reminders/route.ts` | **New** - Cron endpoint |
| `vercel.json` | Add cron schedule |
| `actions/user.ts` | Add `updateEmailPreference()` |
| `components/Nav/NavBar.tsx` or new settings component | Email toggle UI |
| `.env` | Add `RESEND_API_KEY` |

---

## Summary

| | Phase 1 | Phase 2 |
|---|---------|---------|
| **Scope** | Small | Medium |
| **External deps** | None | Resend |
| **New files** | 1 | 3 |
| **DB migration** | No | Yes |
| **Cost** | Free | Free (under 100 emails/day) |
