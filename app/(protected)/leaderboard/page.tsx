import { getLeaderboard } from "@/actions/leaderboard";
import { getCurrentUser } from "@/actions/user";
import { BarChart3, Medal, Trophy } from "lucide-react";
import Image from "next/image";

const RANK_STYLES: Record<number, { bg: string; border: string; badge: string; icon: string }> = {
  1: { bg: "bg-amber-50 dark:bg-amber-900/20", border: "border-amber-300 dark:border-amber-600", badge: "bg-amber-400 text-amber-950", icon: "text-amber-500" },
  2: { bg: "bg-slate-50 dark:bg-slate-800/50", border: "border-slate-300 dark:border-slate-600", badge: "bg-slate-400 text-slate-950", icon: "text-slate-400" },
  3: { bg: "bg-orange-50 dark:bg-orange-900/15", border: "border-orange-300 dark:border-orange-700", badge: "bg-orange-400 text-orange-950", icon: "text-orange-500" },
};

export default async function LeaderboardPage() {
  const data = await getLeaderboard();
  const currentUser = await getCurrentUser();

  return (
    <main className="mx-auto max-w-2xl space-y-6 px-4 py-8">
      <div className="flex items-center gap-2">
        <BarChart3 className="h-6 w-6 text-primary" />
        <h1 className="text-3xl font-bold tracking-tight">Leaderboard</h1>
      </div>

      <div className="space-y-3">
        {data.map((user, idx) => {
          const rank = idx + 1;
          const isTop3 = rank <= 3;
          const isCurrentUser = user.id === currentUser?.id;
          const style = RANK_STYLES[rank];

          return (
            <div
              key={user.id}
              className={`flex items-center justify-between rounded-xl border p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${
                isCurrentUser
                  ? "border-primary/50 bg-primary/5 ring-1 ring-primary/20"
                  : isTop3 && style
                    ? `${style.bg} ${style.border}`
                    : "border-border bg-card"
              }`}
            >
              <div className="flex items-center gap-4">
                {/* Rank */}
                <div className="flex w-8 items-center justify-center">
                  {isTop3 && style ? (
                    <Medal className={`h-6 w-6 ${style.icon}`} />
                  ) : (
                    <span className="text-lg font-bold text-muted-foreground">
                      {rank}
                    </span>
                  )}
                </div>

                {/* Avatar */}
                <div className="relative h-10 w-10 overflow-hidden rounded-full bg-muted">
                  {user.image ? (
                    <Image
                      src={user.image}
                      alt={user.name ?? "User"}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-primary text-sm font-bold text-primary-foreground">
                      {(user.name ?? user.email).charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>

                {/* Name */}
                <div>
                  <p className="font-semibold">
                    {user.name ?? user.email}
                    {isCurrentUser && (
                      <span className="ml-2 text-xs text-primary">(You)</span>
                    )}
                  </p>
                </div>
              </div>

              {/* Points */}
              <div className="flex items-center gap-1.5">
                {isTop3 && <Trophy className="h-4 w-4 text-primary" />}
                <span className="text-xl font-bold tabular-nums">
                  {user.totalPoints}
                </span>
                <span className="text-sm text-muted-foreground">pts</span>
              </div>
            </div>
          );
        })}

        {data.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-12 text-center">
            <p className="text-sm text-muted-foreground">No predictions yet. Be the first!</p>
          </div>
        )}
      </div>
    </main>
  );
}
