import Link from "next/link";
import { getCurrentUser } from "@/actions/user";
import { refreshGamesWithinOneMonth, refreshGameRounds } from "@/actions/games";
import { refreshPredictions } from "@/actions/prediction";
import { Role } from "@prisma/client";

import { Button } from "@/components/ui/button";
import RefreshButtons from "@/components/Admin/RefreshButtons";

async function handleRefreshGames() {
  "use server";
  await refreshGamesWithinOneMonth();
  await refreshGameRounds();
  await refreshPredictions();
}

async function handleRefreshPredictions() {
  "use server";
  await refreshPredictions();
}

export default async function AdminPage() {
  const user = await getCurrentUser();
  if (user?.role !== Role.ADMIN) {
    return (
      <div>
        <span>You have no access to the admin page</span>
        <Link href="/">
          <Button variant="outline">Go back to homepage</Button>
        </Link>
      </div>
    );
  }

  return (
    <main className="mx-auto max-w-4xl space-y-10 px-4 py-8">
      <h1 className="text-3xl font-bold text-primary">Admin Panel</h1>
      <RefreshButtons
        refreshGames={handleRefreshGames}
        refreshPredictions={handleRefreshPredictions}
      />
    </main>
  );
}
