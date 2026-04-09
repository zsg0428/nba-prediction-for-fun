# Profile Page & Favorite Team Badge

## Overview
Add a profile/settings page where users can edit their display name and select a favorite NBA team. The favorite team shows as a small logo badge next to the user's name throughout the app (leaderboard, predictions, navbar).

---

## Database Changes

### Update User Model
- **File**: `prisma/schema.prisma`
- Add `favoriteTeam` field:
  ```prisma
  model User {
    // ... existing fields
    favoriteTeam   String?   // Team name matching constants/teams.ts keys (e.g. "Knicks", "Lakers")
  }
  ```
- Run `npx prisma db push`

---

## Implementation Steps

### 1. Create Profile Page
- **File**: `app/(protected)/profile/page.tsx`
- Server component that fetches current user data
- Passes data to client ProfileForm component

### 2. Create ProfileForm Component
- **File**: `components/Profile/ProfileForm.tsx`
- Client component with:
  - **Display Name** input (pre-filled with current name)
  - **Favorite Team** selector — grid of all 30 NBA team logos, click to select
    - Show team logo + name for each option
    - Highlight currently selected team with primary border/glow
    - Allow deselecting (no favorite team)
  - **Save** button
- Uses React Hook Form + Zod for validation
- Calls server action to update user

### 3. Create Server Actions
- **File**: `actions/user.ts`
- Add `updateUserProfile()`:
  ```typescript
  export const updateUserProfile = async (data: { name: string; favoriteTeam: string | null }) => {
    const userId = await getCurrentUserId();
    await prisma.user.update({
      where: { id: userId },
      data: { name: data.name, favoriteTeam: data.favoriteTeam },
    });
  };
  ```

### 4. Create TeamBadge Component
- **File**: `components/TeamBadge.tsx`
- Reusable component that renders a small team logo (16-20px) next to any content
- Props: `teamName: string | null`, `size?: number`
- Returns `null` if no team selected
- Uses existing `getTeamLogoUrl()` from `constants/teams.ts`

### 5. Integrate TeamBadge Across the App

#### 5.1 Leaderboard
- **File**: `app/(protected)/leaderboard/page.tsx` and related components
- Fetch `favoriteTeam` for each user in leaderboard query
- Show TeamBadge next to each player's name

#### 5.2 Prediction Cards (Other Users' Picks)
- **File**: `components/Predicitions/GameCard.tsx`
- When showing "Others' Picks" section, display TeamBadge next to each user's name
- Requires passing `favoriteTeam` through the predictions data flow

#### 5.3 Navbar
- **File**: `components/Nav/NavBar.tsx`
- Show TeamBadge next to user name in the dropdown menu

#### 5.4 Past Games
- **File**: `app/(protected)/pastGames/page.tsx` and related components
- Show TeamBadge next to player names in prediction results

### 6. Add Profile Link to Navigation
- **File**: `components/Nav/NavBar.tsx`
- Add "Profile" link in user dropdown menu (between email reminders toggle and sign out)
- Use `User` icon from lucide-react

### 7. Update Data Flow for favoriteTeam
- **File**: `actions/prediction.ts` — `fetchAllPredictions()` needs to include `user.favoriteTeam`
- **File**: `actions/leaderboard.ts` — leaderboard query needs to include `favoriteTeam`
- **File**: `types/IPredictions.ts` — update types to include `favoriteTeam`

---

## Files Changed

| File | Change |
|------|--------|
| `prisma/schema.prisma` | Add `favoriteTeam` field |
| `app/(protected)/profile/page.tsx` | **New** - Profile page |
| `components/Profile/ProfileForm.tsx` | **New** - Profile form with team selector |
| `components/TeamBadge.tsx` | **New** - Reusable team logo badge |
| `actions/user.ts` | Add `updateUserProfile()` |
| `actions/prediction.ts` | Include `favoriteTeam` in prediction queries |
| `actions/leaderboard.ts` | Include `favoriteTeam` in leaderboard query |
| `types/IPredictions.ts` | Update types |
| `components/Nav/NavBar.tsx` | Add Profile link, show TeamBadge |
| `components/Predicitions/GameCard.tsx` | Show TeamBadge in others' picks |
| Leaderboard components | Show TeamBadge next to names |
| Past Games components | Show TeamBadge next to names |

---

## UI Design Notes

- Team selector: 5-6 column grid on desktop, 3-4 on mobile
- Selected team: orange border + subtle glow (matching app primary color)
- TeamBadge size: 16px in inline text (leaderboard, picks), 20px in profile page
- Profile page layout: card-based, consistent with existing admin page style
