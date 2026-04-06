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

export default function RefreshButtons({
  refreshGames,
  refreshPredictions,
}: {
  refreshGames: () => Promise<void>;
  refreshPredictions: () => Promise<void>;
}) {
  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-xl font-semibold">Data Refresh</h2>
      <div className="flex flex-col gap-3 sm:flex-row">
        <RefreshButton label="Refresh Games & Rounds" action={refreshGames} />
        <RefreshButton label="Refresh Predictions" action={refreshPredictions} />
      </div>
    </div>
  );
}
