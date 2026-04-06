"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { CardContent } from "@/components/ui/card";
import { formatInTimeZone } from "date-fns-tz";
import { getTeamLogoUrl } from "@/constants/teams";

import { Game } from "@/types/IGames";
import { PredictionMap } from "@/types/IPredictions";

interface GameCardProps {
  game: Game;
  predictedTeam: string;
  onGuess: (gameApiId: number, team: string) => void;
  allOtherGameGuesses?: PredictionMap;
}

function TeamLogo({ teamName }: { teamName: string }) {
  const logoUrl = getTeamLogoUrl(teamName);
  if (!logoUrl) return null;
  return (
    <Image
      src={logoUrl}
      alt={teamName}
      width={32}
      height={32}
      className="inline-block"
    />
  );
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
        {formatInTimeZone(new Date(game.datetime), "America/New_York", "PPp")}
      </div>
      <div className="text-sm text-muted-foreground">
        Home | Away
      </div>
      <div className="flex items-center justify-center gap-6 text-lg font-semibold">
        <div className="flex flex-col items-center gap-1">
          <TeamLogo teamName={game.home_team.name} />
          <span className="text-sm">{game.home_team.name}</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-xl">{game.home_team_score} : {game.visitor_team_score}</span>
          <span className="text-xs text-muted-foreground">vs</span>
        </div>
        <div className="flex flex-col items-center gap-1">
          <TeamLogo teamName={game.visitor_team.name} />
          <span className="text-sm">{game.visitor_team.name}</span>
        </div>
      </div>
      <div className="flex gap-3">
        Your Choice:
      </div>
      <div className="flex gap-3">
        {[game.home_team.name, game.visitor_team.name].map((team) => (
          <Button
            key={team}
            variant={predictedTeam === team ? "default" : "outline"}
            className="flex items-center gap-2"
            onClick={() => onGuess(game.id, team)}
          >
            <TeamLogo teamName={team} />
            {team}
          </Button>
        ))}
      </div>
      { allOtherGameGuesses ? (
          <>
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
          </>
        ) : (null)
      }
    </CardContent>
  );
};
