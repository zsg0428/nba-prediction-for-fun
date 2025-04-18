"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { removeRoundFromGame } from "@/actions/games";
import { useUser } from "@/context/UserContext";
import { Role } from "@prisma/client";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LoadingButton } from "@/components/ui/loading-button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import DestructiveModal from "@/components/destructive-modal";

const ROUND_OPTIONS = [
  { label: "Play In", value: "Play In", point: 1 },
  { label: "First Round", value: "First Round", point: 1.5 },
  { label: "Conference Semifinals", value: "Conference Semifinals", point: 2 },
  { label: "Conference Finals", value: "Conference Finals", point: 3 },
  { label: "Finals", value: "Finals", point: 5 },
];
type AssignProps = {
  gameId: number;
  onSubmit: (gameId: string | number, round: string) => Promise<void>;
};

export const AssignRoundAndPoints = ({ gameId, onSubmit }: AssignProps) => {
  const user = useUser();
  const [selectedRound, setSelectedRound] = useState(ROUND_OPTIONS[0].value);
  const [point, setPoint] = useState(ROUND_OPTIONS[0].point);
  const [loading, setLoading] = useState<boolean>(false);

  const router = useRouter();
  if (user?.role !== "ADMIN") return null;

  const handleSubmit = () => {
    setLoading(true);
    try {
      onSubmit(gameId, selectedRound);
    } catch (e) {
      console.error("assigning failed");
    } finally {
      setLoading(false);
      router.refresh();
    }
  };

  const handleRemoveRound = async () => {
    try {
      await removeRoundFromGame(gameId);
      toast.success("Remove game from round succesfully");
    } catch (e) {
      console.error("failed to remove this game rounrd");
      toast.error("Failed to remove this game");
    } finally {
      router.refresh();
    }
  };

  return (
    <div className="mt-4 flex flex-col items-center justify-evenly space-y-2 border-t pt-3">
      <div className="flex items-center justify-center gap-4">
        <Select
          value={selectedRound}
          onValueChange={(value) => {
            setSelectedRound(value);
            const option = ROUND_OPTIONS.find((r) => r.value === value);
            if (option) setPoint(option.point);
          }}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select round" />
          </SelectTrigger>
          <SelectContent>
            <>
              {ROUND_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </>
          </SelectContent>
        </Select>

        <Input
          type="number"
          value={point}
          onChange={(e) => setPoint(Number(e.target.value))}
          min={1}
          className="w-24"
          disabled
        />
      </div>

      <div className="flex gap-2">
        <Button disabled={loading} size="sm" onClick={handleSubmit}>
          {loading ? "Assigning" : "Assign"}
        </Button>

        <DestructiveModal
          btnTitle="Remove Round"
          title="Remove round"
          description="Are you sure to remove this game from a round?"
          handler={handleRemoveRound}
        />
      </div>
    </div>
  );
};
