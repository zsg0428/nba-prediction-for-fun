"use client";

import { assignGameToRound } from "@/actions/games";
import { CalendarCheck } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AssignRoundAndPoints } from "@/components/Games/AssignRoundAndPoints";

type Game = {
  id: number | string;
  datetime: string;
  status: string;
  home_team: { name: string };
  home_team_score: number;
  visitor_team: { name: string };
  visitor_team_score: number;
};

type Props = {
  games: Game[];
  guesses: Record<string, string>;
  onGuess: (gameId: string, team: string) => void;
};

export default function TodaysGamesSection({ games, guesses, onGuess }: Props) {
  const handleAssignRound = async (gameId: string, roundName: string) => {
    try {
      await assignGameToRound(gameId, roundName);
      toast.success("Assign points successful");
    } catch (e) {
      toast.error("assign round and points failed");
    }
  };

  return (
    <section>
      <h2 className="mb-6 text-center text-2xl font-semibold">
        Today's Games ({format(new Date(), "yyyy-MM-dd")})
      </h2>
      <div className="grid gap-4 sm:grid-cols-2">
        {games.length > 0 ? (
          games.map((game) => (
            <Card key={game.id}>
              <CardContent className="space-y-3 p-4">
                <div>
                  {isNaN(new Date(game.status).getTime()) ? `${game.status === 'Final' ? '✅' : '🏀' } ${game.status}` : '🗓️ Scheduled'}
                </div>
                <div className="text-lg font-semibold">
                  {game.home_team.name} vs {game.visitor_team.name}
                </div>
                <div>
                  {game.home_team_score} : {game.visitor_team_score}
                </div>
                <div className="text-sm text-muted-foreground">
                  {format(new Date(game.datetime), "PPpp")}
                </div>
                <div className="flex gap-3">
                  {[game.home_team.name, game.visitor_team.name].map((team) => (
                    <Button
                      key={team}
                      variant={
                        guesses[game.id] === team ? "default" : "outline"
                      }
                      onClick={() => onGuess(String(game.id), team)}
                    >
                      {team}
                    </Button>
                  ))}
                </div>
              </CardContent>
              <AssignRoundAndPoints
                gameId={game.id}
                onSubmit={handleAssignRound}
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
