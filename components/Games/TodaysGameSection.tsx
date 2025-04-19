"use client";

import { assignGameToRound } from "@/actions/games";
import { format } from "date-fns";
import { toast } from "sonner";

import { Card } from "@/components/ui/card";
import { AssignRoundAndPoints } from "@/components/Games/AssignRoundAndPoints";
import { Game } from "@/types/IGames";
import { PredictionMap } from "@/types/IPredictions";
import { GameCard } from "../Predicitions/GameCard";

type Props = {
  games: Game[];
  guesses: Record<string, string>;
  onGuess: (gameApiId: number, team: string) => void;
  allOtherGameGuesses: PredictionMap;
};

export default function TodaysGamesSection({ games, guesses, onGuess, allOtherGameGuesses }: Props) {
  const handleAssignRound = async (gameApiId: number, roundName: string) => {
    try {
      await assignGameToRound(gameApiId, roundName);
      toast.success("Assign points successful");
    } catch (e) {
      toast.error("assign round and points failed");
    }
  };

  return (
    <section>
      <h2 className="mb-6 text-center text-2xl font-semibold">
        Today&#39;s Games ({format(new Date(), "yyyy-MM-dd")})
      </h2>
      <div className="grid gap-4 sm:grid-cols-2">
        {games.length > 0 ? (
          games.map((game) => (
            <Card key={game.id}>
              <GameCard
                game={game}
                predictedTeam={guesses[game.id] ?? ""}
                onGuess={(gameId, team) => onGuess(gameId, team)}
                allOtherGameGuesses={allOtherGameGuesses}
              />
              <AssignRoundAndPoints
                gameId={game.id}
                onSubmit={(gameId, round) =>
                  handleAssignRound(gameId as number, round)
                }
              />
            </Card>
          ))
        ) : (
          <p className="text-muted-foreground">No games today.</p>
        )}
      </div>
    </section>
  );
}
