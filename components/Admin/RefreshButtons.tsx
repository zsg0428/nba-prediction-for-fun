"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

type RefreshButtonProps = {
  label: string;
  action: () => Promise<void>;
};

function RefreshButton({ label, action }: RefreshButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    setLoading(true);
    try {
      await action();
      toast.success(`${label} completed`);
    } catch (e) {
      toast.error(`${label} failed`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button onClick={handleClick} disabled={loading} variant="outline">
      {loading ? "Refreshing..." : label}
    </Button>
  );
}

type PendingStats = {
  gamesWithoutWinner: number;
  unscoredPredictions: number;
};

export default function RefreshButtons({
  refreshGames,
  refreshPredictions,
  pendingStats,
}: {
  refreshGames: () => Promise<void>;
  refreshPredictions: () => Promise<void>;
  pendingStats: PendingStats;
}) {
  const { gamesWithoutWinner, unscoredPredictions } = pendingStats;
  const hasPending = gamesWithoutWinner > 0 || unscoredPredictions > 0;

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-xl font-semibold">Data Refresh</h2>

      {hasPending && (
        <div className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-700 dark:bg-amber-950/30 dark:text-amber-300">
          {gamesWithoutWinner > 0 && (
            <p>{gamesWithoutWinner} started game{gamesWithoutWinner > 1 ? "s" : ""} without results</p>
          )}
          {unscoredPredictions > 0 && (
            <p>{unscoredPredictions} prediction{unscoredPredictions > 1 ? "s" : ""} not yet scored</p>
          )}
        </div>
      )}

      <div className="flex flex-col gap-3 sm:flex-row">
        <RefreshButton label="Refresh Games & Rounds" action={refreshGames} />
        <RefreshButton label="Refresh Predictions" action={refreshPredictions} />
      </div>
    </div>
  );
}
