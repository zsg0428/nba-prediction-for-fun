"use client";

import { useState } from "react";
import { useRouter } from "next/router";
import { assignGameToRound } from "@/actions/games";
import { format } from "date-fns";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AssignRoundAndPoints } from "@/components/Games/AssignRoundAndPoints";
import { Game } from "@/types/IGames";


type Props = {
  games: Game[];
  guesses?: Record<string, string>;
  onGuess?: (gameApiId: number, team: string) => void;
  isPrediction?: boolean;
};

type GroupedGames = {
  [date: string]: any[];
};

export default function AllGamesSection({
  games,
  onGuess,
  guesses,
  isPrediction = true,
}: Props) {
  const [visibleDates, setVisibleDates] = useState(3); // show 3 days initially
  const groupGamesByDate = (games: any[]): GroupedGames => {
    return games.reduce((groups: GroupedGames, game) => {
      const date = game.date;
      if (!groups[date]) groups[date] = [];
      groups[date].push(game);
      return groups;
    }, {});
  };

  const groupeGames = groupGamesByDate(games);
  const dateKeys = Object.keys(groupeGames).sort(); // ascending order

  const handleAssignRound = async (gameApiId: number, roundName: string) => {
    try {
      await assignGameToRound(gameApiId, roundName);
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
            {groupeGames[date].map((game) => (
              <Card key={game.id}>
                <CardContent className="space-y-2 p-4">
                  <div className="text-large font-semibold">
                    {game.round || "Please assign a round to this game"}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {format(new Date(game.datetime), "PPpp")}
                  </div>
                  <div className="font-semibold">
                    {game.home_team.name} vs {game.visitor_team.name}
                  </div>
                  <div className="flex gap-2">
                    {isPrediction
                      ? [game.home_team.name, game.visitor_team.name].map(
                          (team: string) => (
                            <Button
                              key={team}
                              size="sm"
                              variant={
                                guesses?.[game.id] === team
                                  ? ("default" as const)
                                  : ("outline" as const)
                              }
                              onClick={() => onGuess?.(game.id, team)}
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
                  onSubmit={(gameId, round) =>
                    handleAssignRound(gameId as number, round)
                  }
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
