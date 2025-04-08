"use client";

import { useState } from "react";
import { useUser } from "@/context/UserContext";
import { Role } from "@prisma/client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const ROUND_OPTIONS = [
  { label: "Play In", value: "Play In", point: 1 },
  { label: "First Round", value: "First Round", point: 1.5 },
  { label: "Conference Semifinals", value: "Conference Semifinals", point: 2 },
  { label: "Conference Finals", value: "Conference Finals", point: 3 },
  { label: "Finals", value: "Finals", point: 5 },
];
type AssignProps = {
  gameId: string | number;
  onSubmit: (gameId: string | number, round: string) => void;
};

export const AssignRoundAndPoints = ({ gameId, onSubmit }: AssignProps) => {
  const user = useUser();
  const [selectedRound, setSelectedRound] = useState(ROUND_OPTIONS[0].value);
  const [point, setPoint] = useState(ROUND_OPTIONS[0].point);

  if (user?.role !== "ADMIN") return null;

  const handleSubmit = () => {
    onSubmit(gameId, selectedRound);
  };

  return (
    <div className="mt-4 flex items-center justify-evenly space-y-2 border-t pt-3">
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
      />

      <Button size="sm" onClick={handleSubmit}>
        Assign
      </Button>
    </div>
  );
};
