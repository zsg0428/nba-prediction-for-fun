import Link from "next/link";
import { getCurrentUser } from "@/actions/user";
import { refreshGamesWithinOneMonth, refreshGameRounds } from "@/actions/games";
import { refreshPredictions } from "@/actions/prediction";
import { fetchAllRounds } from "@/actions/rounds";
import { Role } from "@prisma/client";
import { Shield } from "lucide-react";

import { Button } from "@/components/ui/button";
import RefreshButtons from "@/components/Admin/RefreshButtons";
import RoundPointsManager from "@/components/Admin/RoundPointsManager";

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
      <main className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">You don&apos;t have access to this page.</p>
        <Link href="/">
          <Button variant="outline">Go back</Button>
        </Link>
      </main>
    );
  }

  const rounds = await fetchAllRounds();

  return (
    <main className="mx-auto max-w-2xl space-y-8 px-4 py-8">
      <div className="flex items-center gap-2">
        <Shield className="h-6 w-6 text-primary" />
        <h1 className="text-3xl font-bold tracking-tight">Admin</h1>
      </div>

      <div className="rounded-xl border border-border bg-card p-6">
        <RefreshButtons
          refreshGames={handleRefreshGames}
          refreshPredictions={handleRefreshPredictions}
        />
      </div>

      <div className="rounded-xl border border-border bg-card p-6">
        <RoundPointsManager rounds={rounds} />
      </div>
    </main>
  );
}
