"use client";

import { assignGameToRound } from "@/actions/games";
import { format } from "date-fns";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AssignRoundAndPoints } from "@/components/Games/AssignRoundAndPoints";
import { Game } from "@/types/IGames";
import { PredictionMap } from "@/types/IPredictions";

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
              <CardContent className="space-y-3 p-4">
                <div className="text-large font-semibold">
                  {game.round || "Please assign a round to this game"}
                </div>
                <div>
                  {isNaN(new Date(game.status).getTime())
                    ? `${game.status === "Final" ? "✅" : "🏀"} ${game.status}`
                    : "🗓️ Scheduled"}
                </div>
                <div className="text-sm text-muted-foreground">
                  {format(new Date(game.datetime), "PPpp")}
                </div>
                <div className="text-lg font-semibold">
                  {game.home_team.name} vs {game.visitor_team.name}
                </div>
                <div className="text-lg font-semibold">
                  {game.home_team_score} : {game.visitor_team_score}
                </div>
                <div className="flex gap-3">
                  Your Choice:
                </div>             
                <div className="flex gap-3">
                  {[game.home_team.name, game.visitor_team.name].map((team) => (
                    <Button
                      key={team}
                      variant={
                        guesses[game.id] === team ? "default" : "outline"
                      }
                      onClick={() => onGuess(game.id, team)}
                    >
                      {team}
                    </Button>
                  ))}
                </div>
                <div>
                  Other Guesses:
                </div>
                <div className="flex gap-3">
                  {allOtherGameGuesses[game.id]?.map((guess) => (
                    <span key={guess.user} className="text-sm text-muted-foreground">
                      {guess.user}: {guess.predictedTeam}
                    </span>
                  ))}
                </div>
              </CardContent>
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
