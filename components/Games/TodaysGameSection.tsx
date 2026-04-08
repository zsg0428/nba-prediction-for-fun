"use client";

import { assignGameToRound } from "@/actions/games";
import { format } from "date-fns";
import { toast } from "sonner";
import { Flame } from "lucide-react";

import { Card } from "@/components/ui/card";
import { AssignRoundAndPoints } from "@/components/Games/AssignRoundAndPoints";
import { Game } from "@/types/IGames";
import { PredictionMap } from "@/types/IPredictions";
import { GameCard } from "../Predicitions/GameCard";

type RoundOption = {
  name: string;
  point: number;
};

type Props = {
  games: Game[];
  guesses: Record<string, string>;
  onGuess: (gameApiId: number, team: string) => void;
  allOtherGameGuesses: PredictionMap;
  rounds: RoundOption[];
};

export default function TodaysGamesSection({ games, guesses, onGuess, allOtherGameGuesses, rounds }: Props) {
  const handleAssignRound = async (gameApiId: number, roundName: string) => {
    try {
      await assignGameToRound(gameApiId, roundName);
      toast.success("Round assigned");
    } catch (e) {
      toast.error("Failed to assign round");
    }
  };

  return (
    <section className="space-y-4">
      <div className="flex items-center gap-2">
        <Flame className="h-5 w-5 text-primary" />
        <h2 className="text-xl font-bold">Today&apos;s Games</h2>
        <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
          {format(new Date(), "MMM d")}
        </span>
        {games.length > 0 && (
          <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
            {games.length}
          </span>
        )}
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {games.length > 0 ? (
          games.map((game) => (
            <Card
              key={game.id}
              className="overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
            >
              <GameCard
                game={game}
                predictedTeam={guesses[game.id] ?? ""}
                onGuess={(gameId, team) => onGuess(gameId, team)}
                allOtherGameGuesses={allOtherGameGuesses}
              />
              <AssignRoundAndPoints
                gameId={game.id}
                rounds={rounds}
                onSubmit={(gameId, round) =>
                  handleAssignRound(gameId as number, round)
                }
              />
            </Card>
          ))
        ) : (
          <div className="col-span-2 flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-12 text-center">
            <p className="text-sm text-muted-foreground">No games scheduled for today</p>
          </div>
        )}
      </div>
    </section>
  );
}
