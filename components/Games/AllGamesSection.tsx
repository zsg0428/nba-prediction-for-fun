"use client";

import { useState } from "react";
import { assignGameToRound } from "@/actions/games";
import { toast } from "sonner";
import { CalendarDays } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AssignRoundAndPoints } from "@/components/Games/AssignRoundAndPoints";
import { Game } from "@/types/IGames";
import { GameCard } from "../Predicitions/GameCard";

type RoundOption = {
  name: string;
  point: number;
};

type Props = {
  games: Game[];
  guesses: Record<string, string>;
  onGuess: (gameApiId: number, team: string) => void;
  rounds: RoundOption[];
};

type GroupedGames = Record<string, Game[]>;

export default function AllGamesSection({
  games,
  onGuess,
  guesses,
  rounds,
}: Props) {
  const [visibleDates, setVisibleDates] = useState(3);

  const groupGamesByDate = (games: Game[]): GroupedGames => {
    return games.reduce((groups: GroupedGames, game) => {
      const date = game.date;
      if (!groups[date]) groups[date] = [];
      groups[date].push(game);
      return groups;
    }, {});
  };

  const groupedGames = groupGamesByDate(games);
  const dateKeys = Object.keys(groupedGames).sort();

  const handleAssignRound = async (gameApiId: number, roundName: string) => {
    try {
      await assignGameToRound(gameApiId, roundName);
      toast.success("Round assigned");
    } catch (e) {
      toast.error("Failed to assign round");
    }
  };

  return (
    <section className="space-y-6">
      <div className="flex items-center gap-2">
        <CalendarDays className="h-5 w-5 text-accent" />
        <h2 className="text-xl font-bold">Upcoming Games</h2>
        <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
          {games.length}
        </span>
      </div>

      <div className="space-y-6">
        {dateKeys.slice(0, visibleDates).map((date) => (
          <div key={date} className="space-y-3">
            <div className="sticky top-16 z-10 flex items-center gap-2 bg-background/80 py-2 backdrop-blur-sm">
              <span className="rounded-full bg-accent/10 px-3 py-1 text-sm font-semibold text-accent">
                {date}
              </span>
              <span className="text-xs text-muted-foreground">
                {groupedGames[date].length} game{groupedGames[date].length > 1 ? "s" : ""}
              </span>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {groupedGames[date].map((game) => (
                <Card
                  key={game.id}
                  className="overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
                >
                  <GameCard
                    game={game}
                    predictedTeam={guesses[game.id] ?? ""}
                    onGuess={(gameId, team) => onGuess(gameId, team)}
                    allOtherGameGuesses={undefined}
                  />
                  <AssignRoundAndPoints
                    gameId={game.id}
                    rounds={rounds}
                    onSubmit={(gameId, round) =>
                      handleAssignRound(gameId as number, round)
                    }
                  />
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Load More / Less */}
      <div className="flex justify-center pt-2">
        {visibleDates < dateKeys.length ? (
          <Button
            variant="outline"
            onClick={() => setVisibleDates((v) => v + 3)}
            className="cursor-pointer"
          >
            Load More
          </Button>
        ) : dateKeys.length > 3 ? (
          <Button
            variant="ghost"
            onClick={() => setVisibleDates(3)}
            className="cursor-pointer text-muted-foreground"
          >
            Show Less
          </Button>
        ) : null}
      </div>
    </section>
  );
}
