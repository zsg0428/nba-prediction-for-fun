"use client";

import { useState } from "react";
import { updateRoundPoint } from "@/actions/rounds";
import { toast } from "sonner";
import { Save, Trophy } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Round = {
  id: string;
  name: string;
  point: number;
};

export default function RoundPointsManager({ rounds }: { rounds: Round[] }) {
  const [values, setValues] = useState<Record<string, number>>(
    Object.fromEntries(rounds.map((r) => [r.id, r.point])),
  );
  const [saving, setSaving] = useState<string | null>(null);

  const handleSave = async (round: Round) => {
    const newPoint = values[round.id];
    if (newPoint === round.point) return;
    if (newPoint <= 0) {
      toast.error("Point value must be greater than 0");
      return;
    }

    setSaving(round.id);
    try {
      await updateRoundPoint(round.id, newPoint);
      toast.success(`Updated ${round.name} to ${newPoint} pts`);
    } catch {
      toast.error(`Failed to update ${round.name}`);
    } finally {
      setSaving(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Trophy className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-semibold">Round Points</h2>
      </div>

      <div className="space-y-3">
        {rounds.map((round) => (
          <div
            key={round.id}
            className="flex items-center gap-3 rounded-lg border border-border bg-background p-3"
          >
            <span className="min-w-[180px] text-sm font-medium">{round.name}</span>
            <Input
              type="number"
              step="0.5"
              min={0.5}
              value={values[round.id]}
              onChange={(e) =>
                setValues((prev) => ({ ...prev, [round.id]: Number(e.target.value) }))
              }
              className="w-24"
            />
            <span className="text-sm text-muted-foreground">pts</span>
            <Button
              size="sm"
              variant="outline"
              disabled={saving === round.id || values[round.id] === round.point}
              onClick={() => handleSave(round)}
            >
              <Save className="mr-1 h-3.5 w-3.5" />
              {saving === round.id ? "Saving..." : "Save"}
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
