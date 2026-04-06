"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { formatInTimeZone } from "date-fns-tz";
import { getTeamLogoUrl } from "@/constants/teams";
import { Calendar, Clock, Trophy } from "lucide-react";

import { Game } from "@/types/IGames";
import { PredictionMap } from "@/types/IPredictions";

interface GameCardProps {
  game: Game;
  predictedTeam: string;
  onGuess: (gameApiId: number, team: string) => void;
  allOtherGameGuesses?: PredictionMap;
}

function TeamLogo({ teamName, size = 40 }: { teamName: string; size?: number }) {
  const logoUrl = getTeamLogoUrl(teamName);
  if (!logoUrl) return null;
  return (
    <Image
      src={logoUrl}
      alt={teamName}
      width={size}
      height={size}
      className="inline-block drop-shadow-md"
    />
  );
}

function StatusBadge({ status, time }: { status: string; time: string }) {
  const isScheduled = !isNaN(new Date(status).getTime());
  const isFinal = status === "Final";
  const isLive = !isScheduled && !isFinal;

  if (isScheduled) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
        <Calendar className="h-3 w-3" />
        Scheduled
      </span>
    );
  }

  if (isFinal) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">
        <Trophy className="h-3 w-3" />
        Final
      </span>
    );
  }

  return (
    <span className="inline-flex animate-pulse-glow items-center gap-1 rounded-full bg-orange-100 px-2.5 py-0.5 text-xs font-medium text-orange-700 dark:bg-orange-900/30 dark:text-orange-400">
      <span className="h-2 w-2 rounded-full bg-orange-500" />
      {status} {time}
    </span>
  );
}

export const GameCard = ({ game, predictedTeam, onGuess, allOtherGameGuesses }: GameCardProps) => {
  return (
    <div className="space-y-4 p-5">
      {/* Header: Status + Time + Round */}
      <div className="flex items-center justify-between">
        <StatusBadge status={game.status} time={game.time} />
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Clock className="h-3 w-3" />
          {formatInTimeZone(new Date(game.datetime), "America/New_York", "MMM d, h:mm a")}
        </div>
      </div>

      {game.round && (
        <div className="text-center text-xs font-semibold uppercase tracking-wider text-primary">
          {game.round}
        </div>
      )}

      {/* Matchup: Team vs Team */}
      <div className="flex items-center justify-between px-2">
        {/* Home Team */}
        <div className="flex flex-col items-center gap-1.5">
          <TeamLogo teamName={game.home_team.name} size={48} />
          <span className="text-sm font-semibold">{game.home_team.name}</span>
          <span className="text-[10px] uppercase tracking-wide text-muted-foreground">Home</span>
        </div>

        {/* Score */}
        <div className="flex flex-col items-center gap-0.5">
          <div className="text-3xl font-bold tabular-nums tracking-tight">
            {game.home_team_score}
            <span className="mx-1.5 text-muted-foreground">:</span>
            {game.visitor_team_score}
          </div>
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">vs</span>
        </div>

        {/* Away Team */}
        <div className="flex flex-col items-center gap-1.5">
          <TeamLogo teamName={game.visitor_team.name} size={48} />
          <span className="text-sm font-semibold">{game.visitor_team.name}</span>
          <span className="text-[10px] uppercase tracking-wide text-muted-foreground">Away</span>
        </div>
      </div>

      {/* Prediction Buttons */}
      <div className="space-y-2">
        <p className="text-center text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Your Pick
        </p>
        <div className="flex justify-center gap-3">
          {[game.home_team.name, game.visitor_team.name].map((team) => {
            const isSelected = predictedTeam === team;
            return (
              <button
                key={team}
                onClick={() => onGuess(game.id, team)}
                className={`flex cursor-pointer items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition-all duration-200 ${
                  isSelected
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25 ring-2 ring-primary ring-offset-2 ring-offset-background"
                    : "border border-border bg-card text-foreground hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-md"
                }`}
              >
                <TeamLogo teamName={team} size={20} />
                {team}
              </button>
            );
          })}
        </div>
      </div>

      {/* Others' Predictions */}
      {allOtherGameGuesses && allOtherGameGuesses[game.id]?.length > 0 && (
        <div className="space-y-1.5 border-t border-border/50 pt-3">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Others&apos; Picks
          </p>
          <div className="flex flex-wrap gap-2">
            {allOtherGameGuesses[game.id]?.map((guess) => (
              <span
                key={guess.user}
                className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-xs"
              >
                <span className="font-medium">{guess.user}</span>
                <span className="text-muted-foreground">{guess.predictedTeam}</span>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
