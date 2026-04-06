"use client";

import { useState } from "react";
import { assignGameToRound } from "@/actions/games";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AssignRoundAndPoints } from "@/components/Games/AssignRoundAndPoints";
import { Game } from "@/types/IGames";
import { GameCard } from "../Predicitions/GameCard";

type Props = {
  games: Game[];
  guesses: Record<string, string>;
  onGuess: (gameApiId: number, team: string) => void;
};

type GroupedGames = Record<string, Game[]>;

export default function AllGamesSection({
  games,
  onGuess,
  guesses,
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
            {groupedGames[date].map((game) => (
              <Card key={game.id}>
                <GameCard
                  game={game}
                  predictedTeam={guesses[game.id] ?? ""}
                  onGuess={(gameId, team) => onGuess(gameId, team)}
                  allOtherGameGuesses={undefined}
                />
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
