"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateRoundPoint, createRound, deleteRound } from "@/actions/rounds";
import { toast } from "sonner";
import { Plus, Save, Trophy } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import DestructiveModal from "@/components/destructive-modal";

type Round = {
  id: string;
  name: string;
  point: number;
};

export default function RoundPointsManager({ rounds }: { rounds: Round[] }) {
  const router = useRouter();
  const [values, setValues] = useState<Record<string, string>>(
    Object.fromEntries(rounds.map((r) => [r.id, String(r.point)])),
  );
  const [saving, setSaving] = useState<string | null>(null);
  const [newName, setNewName] = useState("");
  const [newPoint, setNewPoint] = useState("");
  const [adding, setAdding] = useState(false);

  const handleSave = async (round: Round) => {
    const point = parseFloat(values[round.id]);
    if (isNaN(point) || point <= 0) {
      toast.error("Point value must be greater than 0");
      return;
    }
    if (point === round.point) return;

    setSaving(round.id);
    try {
      await updateRoundPoint(round.id, point);
      toast.success(`Updated ${round.name} to ${point} pts`);
      router.refresh();
    } catch {
      toast.error(`Failed to update ${round.name}`);
    } finally {
      setSaving(null);
    }
  };

  const handleAdd = async () => {
    const point = parseFloat(newPoint);
    if (!newName.trim()) {
      toast.error("Round name is required");
      return;
    }
    if (isNaN(point) || point <= 0) {
      toast.error("Point value must be greater than 0");
      return;
    }

    setAdding(true);
    try {
      await createRound(newName, point);
      toast.success(`Created round "${newName}" (${point} pts)`);
      setNewName("");
      setNewPoint("");
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to create round");
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async (round: Round) => {
    try {
      await deleteRound(round.id);
      toast.success(`Deleted "${round.name}"`);
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to delete round");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Trophy className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-semibold">Round Points</h2>
      </div>

      {/* Existing rounds */}
      <div className="space-y-3">
        {rounds.map((round) => (
          <div
            key={round.id}
            className="flex items-center gap-3 rounded-lg border border-border bg-background p-3"
          >
            <span className="min-w-[140px] text-sm font-medium sm:min-w-[180px]">{round.name}</span>
            <Input
              type="number"
              step="0.5"
              min={0.5}
              value={values[round.id]}
              onChange={(e) =>
                setValues((prev) => ({ ...prev, [round.id]: e.target.value }))
              }
              className="w-24"
            />
            <span className="text-sm text-muted-foreground">pts</span>
            <Button
              size="sm"
              variant="outline"
              disabled={saving === round.id || parseFloat(values[round.id]) === round.point || values[round.id] === ""}
              onClick={() => handleSave(round)}
            >
              <Save className="mr-1 h-3.5 w-3.5" />
              {saving === round.id ? "Saving..." : "Save"}
            </Button>
            <DestructiveModal
              btnTitle=""
              title={`Delete "${round.name}"`}
              description="This will permanently delete this round. Games currently assigned to it must be unassigned first."
              handler={() => handleDelete(round)}
              variant="ghost"
            />
          </div>
        ))}
      </div>

      {/* Add new round */}
      <div className="flex items-center gap-3 rounded-lg border border-dashed border-border bg-muted/30 p-3">
        <Input
          placeholder="Round name"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          className="min-w-[140px] sm:min-w-[180px]"
        />
        <Input
          type="number"
          step="0.5"
          min={0.5}
          placeholder="Pts"
          value={newPoint}
          onChange={(e) => setNewPoint(e.target.value)}
          className="w-24"
        />
        <Button
          size="sm"
          disabled={adding || !newName.trim() || !newPoint}
          onClick={handleAdd}
        >
          <Plus className="mr-1 h-3.5 w-3.5" />
          {adding ? "Adding..." : "Add"}
        </Button>
      </div>
    </div>
  );
}
