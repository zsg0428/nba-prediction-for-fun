// components/predictions/GameCard.tsx
"use client";

import { Button } from "@/components/ui/button";
import { CardContent } from "@/components/ui/card";
import { formatInTimeZone } from "date-fns-tz";

import { Game } from "@/types/IGames";
import { PredictionMap } from "@/types/IPredictions";

interface GameCardProps {
  game: Game;
  predictedTeam: string;
  onGuess: (gameApiId: number, team: string) => void;
  allOtherGameGuesses: PredictionMap;
}

export const GameCard = ({ game, predictedTeam, onGuess, allOtherGameGuesses }: GameCardProps) => {
  return (
    <CardContent className="space-y-3 p-4">
      <div className="text-large font-semibold">
        {game.round || "Please assign a round to this game"}
      </div>
      <div>
        {isNaN(new Date(game.status).getTime())
          ? `${game.status === "Final" ? "✅" : "🏀"} ${game.status} ${game.time}`
          : "🗓️ Scheduled"}
      </div>
      <div className="text-sm text-muted-foreground">
        {formatInTimeZone(new Date(game.datetime),  'America/New_York', "PPp")}
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
              predictedTeam === team ? "default" : "outline"
            }
            onClick={() => onGuess(game.id, team)}
          >
            {team}
          </Button>
        ))}
      </div>
      <div>
        Others&#39; Predictions:
      </div>
      <div className="flex flex-col gap-1">
        {allOtherGameGuesses[game.id]?.map((guess) => (
          <span key={guess.user} className="text-sm text-muted-foreground">
            {guess.user}: {guess.predictedTeam}
          </span>
        ))}
      </div>
    </CardContent>
  );
};
