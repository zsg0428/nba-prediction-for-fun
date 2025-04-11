"use client";

import { useState } from "react";
import { assignGameToRound } from "@/actions/games";
import { format } from "date-fns";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AssignRoundAndPoints } from "@/components/Games/AssignRoundAndPoints";

type Game = {
  id: number | string;
  date: string; // e.g. "2025-04-07"
  datetime: string; // full ISO datetime string
  home_team: { name: string };
  visitor_team: { name: string };
};

type Props = {
  games: Game[];
  guesses?: Record<string, string>;
  onGuess?: (gameId: string, team: string) => void;
  isPrediction?: boolean;
};

type GroupedGames = {
  [date: string]: Game[];
};

export default function AllGamesSection({
  games,
  onGuess,
  guesses,
  isPrediction = true,
}: Props) {
  const [visibleDates, setVisibleDates] = useState(3); // show 3 days initially

  const groupGamesByDate = (games: Game[]): GroupedGames => {
    return games.reduce((groups: GroupedGames, game) => {
      const date = game.date;
      if (!groups[date]) groups[date] = [];
      groups[date].push(game);
      return groups;
    }, {});
  };

  const grouped = groupGamesByDate(games);
  const dateKeys = Object.keys(grouped).sort(); // ascending order

  const handleAssignRound = async (gameId: string, roundName: string) => {
    try {
      await assignGameToRound(gameId, roundName);
      toast.success("Assign points successful");
    } catch (e) {
      toast.error("assign round and points failed");
    }
  };

  return (
    <section className="space-y-6">
      <h2 className="mb-4 text-center text-2xl font-semibold">All Games</h2>

      {dateKeys.slice(0, visibleDates).map((date) => (
        <div key={date} className="space-y-3">
          <h3 className="text-xl font-bold text-primary">{date}</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            {grouped[date].map((game) => (
              <Card key={game.id}>
                <CardContent className="space-y-2 p-4">
                  <div className="font-semibold">
                    {game.home_team.name} vs {game.visitor_team.name}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {format(new Date(game.datetime), "PPpp")}
                  </div>

                  <div className="flex gap-2">
                    {isPrediction
                      ? [game.home_team.name, game.visitor_team.name].map(
                          (team: string) => (
                            <Button
                              key={team}
                              size="sm"
                              variant={
                                guesses[game.id] === team
                                  ? ("default" as const)
                                  : ("outline" as const)
                              }
                              onClick={() => onGuess?.(String(game.id), team)}
                            >
                              {team}
                            </Button>
                          ),
                        )
                      : ""}
                  </div>
                </CardContent>
                <AssignRoundAndPoints
                  gameId={game.id}
                  onSubmit={handleAssignRound}
                />
              </Card>
            ))}
          </div>
        </div>
      ))}

      {/* Load More */}
      {visibleDates < dateKeys.length ? (
        <div className="pt-4 text-center">
          <Button onClick={() => setVisibleDates((v) => v + 3)}>
            Load More
          </Button>
        </div>
      ) : (
        <div className="pt-4 text-center">
          <Button onClick={() => setVisibleDates(3)}>Load Less</Button>
        </div>
      )}
    </section>
  );
}
