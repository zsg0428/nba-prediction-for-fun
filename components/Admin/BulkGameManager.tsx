"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { bulkAssignGameRound, bulkRemoveGameRound } from "@/actions/games";
import { format } from "date-fns";
import { formatInTimeZone } from "date-fns-tz";
import { toast } from "sonner";
import { CalendarDays, Check, Minus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Round = {
  id: string;
  name: string;
  point: number;
};

type Game = {
  apiGameId: number;
  homeTeam: string;
  awayTeam: string;
  startTime: Date;
  status: string;
  round: Round | null;
};

type Props = {
  games: Game[];
  rounds: Round[];
};

type GroupedGames = Record<string, Game[]>;

function groupByDate(games: Game[]): GroupedGames {
  return games.reduce((groups: GroupedGames, game) => {
    const date = formatInTimeZone(game.startTime, "America/New_York", "yyyy-MM-dd");
    if (!groups[date]) groups[date] = [];
    groups[date].push(game);
    return groups;
  }, {});
}

export default function BulkGameManager({ games, rounds }: Props) {
  const router = useRouter();
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [selectedRound, setSelectedRound] = useState(rounds[0]?.name ?? "");
  const [loading, setLoading] = useState(false);

  const grouped = groupByDate(games);
  const dateKeys = Object.keys(grouped).sort();

  const toggleGame = (apiGameId: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(apiGameId)) next.delete(apiGameId);
      else next.add(apiGameId);
      return next;
    });
  };

  const toggleDate = (date: string) => {
    const dateGames = grouped[date];
    const allSelected = dateGames.every((g) => selected.has(g.apiGameId));
    setSelected((prev) => {
      const next = new Set(prev);
      for (const g of dateGames) {
        if (allSelected) next.delete(g.apiGameId);
        else next.add(g.apiGameId);
      }
      return next;
    });
  };

  const toggleAll = () => {
    const allSelected = games.every((g) => selected.has(g.apiGameId));
    if (allSelected) setSelected(new Set());
    else setSelected(new Set(games.map((g) => g.apiGameId)));
  };

  const handleAssign = async () => {
    if (selected.size === 0) return;
    setLoading(true);
    try {
      await bulkAssignGameRound([...selected], selectedRound);
      toast.success(`Assigned ${selected.size} games to ${selectedRound}`);
      setSelected(new Set());
      router.refresh();
    } catch {
      toast.error("Failed to assign round");
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async () => {
    if (selected.size === 0) return;
    setLoading(true);
    try {
      await bulkRemoveGameRound([...selected]);
      toast.success(`Removed round from ${selected.size} games`);
      setSelected(new Set());
      router.refresh();
    } catch {
      toast.error("Failed to remove round");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <CalendarDays className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-semibold">Bulk Game Management</h2>
        <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
          {games.length} games
        </span>
      </div>

      {/* Action bar */}
      <div className="flex flex-wrap items-center gap-2 rounded-lg border border-border bg-muted/50 p-3">
        <div className="flex items-center gap-2">
          <Checkbox
            checked={games.length > 0 && games.every((g) => selected.has(g.apiGameId))}
            onCheckedChange={toggleAll}
          />
          <span className="text-sm text-muted-foreground">
            {selected.size > 0 ? `${selected.size} selected` : "Select all"}
          </span>
        </div>

        <div className="ml-auto flex flex-wrap items-center gap-2">
          <Select value={selectedRound} onValueChange={setSelectedRound}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select round" />
            </SelectTrigger>
            <SelectContent>
              {rounds.map((r) => (
                <SelectItem key={r.name} value={r.name}>
                  {r.name} ({r.point} pts)
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            size="sm"
            disabled={selected.size === 0 || loading}
            onClick={handleAssign}
          >
            <Check className="mr-1 h-3.5 w-3.5" />
            Assign
          </Button>
          <Button
            size="sm"
            variant="destructive"
            disabled={selected.size === 0 || loading}
            onClick={handleRemove}
          >
            <Minus className="mr-1 h-3.5 w-3.5" />
            Remove
          </Button>
        </div>
      </div>

      {/* Game list grouped by date */}
      <div className="max-h-[600px] space-y-4 overflow-y-auto">
        {dateKeys.map((date) => {
          const dateGames = grouped[date];
          const allDateSelected = dateGames.every((g) => selected.has(g.apiGameId));
          const someDateSelected = dateGames.some((g) => selected.has(g.apiGameId));

          return (
            <div key={date} className="space-y-1">
              {/* Date header */}
              <div className="flex items-center gap-2 py-1">
                <Checkbox
                  checked={allDateSelected}
                  className={!allDateSelected && someDateSelected ? "opacity-50" : ""}
                  onCheckedChange={() => toggleDate(date)}
                />
                <span className="text-sm font-semibold">
                  {format(new Date(date + "T12:00:00"), "EEE, MMM d, yyyy")}
                </span>
                <span className="text-xs text-muted-foreground">
                  {dateGames.length} game{dateGames.length > 1 ? "s" : ""}
                </span>
              </div>

              {/* Games */}
              <div className="space-y-1 pl-6">
                {dateGames.map((game) => (
                  <label
                    key={game.apiGameId}
                    className="flex cursor-pointer items-center gap-3 rounded-md px-2 py-1.5 transition-colors hover:bg-muted/50"
                  >
                    <Checkbox
                      checked={selected.has(game.apiGameId)}
                      onCheckedChange={() => toggleGame(game.apiGameId)}
                    />
                    <span className="flex-1 text-sm">
                      {game.homeTeam} vs {game.awayTeam}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatInTimeZone(game.startTime, "America/New_York", "h:mm a")}
                    </span>
                    {game.round ? (
                      <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                        {game.round.name}
                      </span>
                    ) : (
                      <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                        Unassigned
                      </span>
                    )}
                  </label>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
