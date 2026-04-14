import Link from "next/link";
import { getCurrentUser } from "@/actions/user";
import { refreshGamesWithinOneMonth, refreshGameRounds, fetchAllGamesWithRounds, fetchPendingRefreshStats } from "@/actions/games";
import { refreshPredictions } from "@/actions/prediction";
import { fetchAllRounds } from "@/actions/rounds";
import { getReminderOverview } from "@/actions/reminders";
import { Role } from "@prisma/client";
import { Shield } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import RefreshButtons from "@/components/Admin/RefreshButtons";
import RoundPointsManager from "@/components/Admin/RoundPointsManager";
import BulkGameManager from "@/components/Admin/BulkGameManager";
import ReminderManager from "@/components/Admin/ReminderManager";

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

  const [rounds, games, pendingStats, reminderOverview] = await Promise.all([
    fetchAllRounds(),
    fetchAllGamesWithRounds(),
    fetchPendingRefreshStats(),
    getReminderOverview(),
  ]);

  return (
    <main className="mx-auto max-w-4xl space-y-6 px-4 py-8">
      <div className="flex items-center gap-2">
        <Shield className="h-6 w-6 text-primary" />
        <h1 className="text-3xl font-bold tracking-tight">Admin</h1>
      </div>

      <Tabs defaultValue="refresh">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4">
          <TabsTrigger value="refresh">Data Refresh</TabsTrigger>
          <TabsTrigger value="rounds">Rounds</TabsTrigger>
          <TabsTrigger value="games">Games</TabsTrigger>
          <TabsTrigger value="reminders">Reminders</TabsTrigger>
        </TabsList>

        <TabsContent value="refresh">
          <div className="rounded-xl border border-border bg-card p-6">
            <RefreshButtons
              refreshGames={handleRefreshGames}
              refreshPredictions={handleRefreshPredictions}
              pendingStats={pendingStats}
            />
          </div>
        </TabsContent>

        <TabsContent value="rounds">
          <div className="rounded-xl border border-border bg-card p-6">
            <RoundPointsManager rounds={rounds} />
          </div>
        </TabsContent>

        <TabsContent value="games">
          <div className="rounded-xl border border-border bg-card p-6">
            <BulkGameManager games={games} rounds={rounds} />
          </div>
        </TabsContent>

        <TabsContent value="reminders">
          <div className="rounded-xl border border-border bg-card p-6">
            <ReminderManager
              upcomingGameCount={reminderOverview.upcomingGameCount}
              users={reminderOverview.users}
            />
          </div>
        </TabsContent>
      </Tabs>
    </main>
  );
}
