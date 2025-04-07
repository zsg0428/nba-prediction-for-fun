"use client";

import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

type Game = {
  id: number | string;
  datetime: string;
  home_team: { name: string };
  visitor_team: { name: string };
};

type Props = {
  games: Game[];
  guesses: Record<string, string>;
  onGuess: (gameId: string, team: string) => void;
};

export default function TodaysGamesSection({ games, guesses, onGuess }: Props) {
  return (
    <section>
      <h2 className="mb-4 text-2xl font-semibold">Today's Games</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        {games.length > 0 ? (
          games.map((game) => (
            <Card key={game.id}>
              <CardContent className="space-y-3 p-4">
                <div className="text-lg font-semibold">
                  {game.home_team.name} vs {game.visitor_team.name}
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
            </Card>
          ))
        ) : (
          <p className="text-muted-foreground">No games today.</p>
        )}
      </div>
    </section>
  );
}
