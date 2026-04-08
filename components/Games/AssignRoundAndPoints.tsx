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

type RoundOption = {
  name: string;
  point: number;
};

type AssignProps = {
  gameId: number;
  rounds: RoundOption[];
  onSubmit: (gameId: string | number, round: string) => Promise<void>;
};

export const AssignRoundAndPoints = ({ gameId, rounds, onSubmit }: AssignProps) => {
  const user = useUser();
  const [selectedRound, setSelectedRound] = useState(rounds[0]?.name ?? "");
  const [point, setPoint] = useState(rounds[0]?.point ?? 0);
  const [loading, setLoading] = useState<boolean>(false);

  const router = useRouter();
  if (user?.role !== Role.ADMIN) return null;

  const handleSubmit = () => {
    setLoading(true);
    try {
      onSubmit(gameId, selectedRound);
    } catch (e) {
      console.error("Assigning round failed:", e);
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
      console.error("Failed to remove game round:", e);
      toast.error("Failed to remove this game");
    } finally {
      router.refresh();
    }
  };

  return (
    <div className="mt-4 flex flex-col items-center justify-evenly space-y-2 border-t pt-3">
      <div className="flex w-full flex-col items-center justify-center gap-2 px-2 sm:flex-row sm:gap-4 sm:px-0">
        <Select
          value={selectedRound}
          onValueChange={(value) => {
            setSelectedRound(value);
            const option = rounds.find((r) => r.name === value);
            if (option) setPoint(option.point);
          }}
        >
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Select round" />
          </SelectTrigger>
          <SelectContent>
            {rounds.map((option) => (
              <SelectItem key={option.name} value={option.name}>
                {option.name}
              </SelectItem>
            ))}
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
