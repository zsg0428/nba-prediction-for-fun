"use client";

import { useState } from "react";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { formatInTimeZone } from "date-fns-tz";
import { getTeamLogoUrl } from "@/constants/teams";
import { CheckCircle2, ChevronDown, ChevronUp, Trophy, XCircle } from "lucide-react";
import AvatarBadge from "@/components/AvatarBadge";

interface FinishedGame {
  id: string;
  apiGameId: number;
  homeTeam: string;
  awayTeam: string;
  startTime: Date;
  homeTeamScore?: number | null;
  awayTeamScore?: number | null;
  winnerTeam: string | null;
  round?: {
    name: string;
    id: string;
    point: number;
  } | null;
}

interface PlayerPrediction {
  userName: string;
  predictedTeam: string;
  favoriteTeam?: string | null;
  avatar?: string | null;
}

interface Props {
  finishedGames: FinishedGame[];
  predictionsByGame: Record<number, PlayerPrediction[]>;
}

function TeamLogo({ teamName }: { teamName: string }) {
  const logoUrl = getTeamLogoUrl(teamName);
  if (!logoUrl) return null;
  return (
    <Image src={logoUrl} alt={teamName} width={28} height={28} className="inline-block" />
  );
}

const VISIBLE_COUNT = 3;

function PredictionsList({ predictions, winnerTeam }: { predictions: PlayerPrediction[]; winnerTeam: string | null }) {
  const [expanded, setExpanded] = useState(false);

  if (predictions.length === 0) {
    return <span className="text-xs text-muted-foreground">No picks</span>;
  }

  const sorted = [...predictions].sort((a, b) => {
    const aCorrect = a.predictedTeam === winnerTeam;
    const bCorrect = b.predictedTeam === winnerTeam;
    if (aCorrect && !bCorrect) return -1;
    if (!aCorrect && bCorrect) return 1;
    return 0;
  });

  const visible = expanded ? sorted : sorted.slice(0, VISIBLE_COUNT);
  const hasMore = sorted.length > VISIBLE_COUNT;

  return (
    <div className="space-y-1">
      <div className="flex flex-wrap gap-x-3 gap-y-1">
        {visible.map((p) => {
          const isCorrect = p.predictedTeam === winnerTeam;
          return (
            <span
              key={p.userName}
              className={`inline-flex items-center gap-1 text-xs font-medium ${
                isCorrect
                  ? "text-green-600 dark:text-green-400"
                  : "text-red-500 dark:text-red-400"
              }`}
            >
              {isCorrect ? (
                <CheckCircle2 className="h-3 w-3" />
              ) : (
                <XCircle className="h-3 w-3" />
              )}
              <AvatarBadge avatar={p.avatar} favoriteTeam={p.favoriteTeam} size={14} />
              {p.userName}
            </span>
          );
        })}
      </div>
      {hasMore && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex cursor-pointer items-center gap-0.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
        >
          {expanded ? (
            <>Show less <ChevronUp className="h-3 w-3" /></>
          ) : (
            <>{sorted.length - VISIBLE_COUNT} more <ChevronDown className="h-3 w-3" /></>
          )}
        </button>
      )}
    </div>
  );
}

export default function PastGamesSection({ finishedGames, predictionsByGame }: Props) {
  const sortedGames = [...finishedGames].sort(
    (a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Trophy className="h-5 w-5 text-primary" />
        <h2 className="text-xl font-bold">Past Games</h2>
        <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
          {sortedGames.length}
        </span>
      </div>

      <div className="space-y-3">
        {sortedGames.length > 0 ? (
          sortedGames.map((game) => {
            const predictions = predictionsByGame[game.apiGameId] ?? [];
            return (
              <Card key={game.id} className="overflow-hidden transition-all hover:shadow-md">
                <CardContent className="space-y-3 p-3 sm:p-4">
                  {/* Top row: teams + score + meta */}
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    {/* Teams + Score */}
                    <div className="flex items-center gap-2 sm:gap-4">
                      <div className="flex items-center gap-1.5">
                        <TeamLogo teamName={game.homeTeam} />
                        <span className={`text-xs font-semibold sm:text-sm ${game.winnerTeam === game.homeTeam ? "text-green-600 dark:text-green-400" : ""}`}>
                          {game.homeTeam}
                        </span>
                      </div>

                      <span className="text-xs font-bold tabular-nums text-muted-foreground sm:text-sm">
                        {game.homeTeamScore ?? 0} - {game.awayTeamScore ?? 0}
                      </span>

                      <div className="flex items-center gap-1.5">
                        <span className={`text-xs font-semibold sm:text-sm ${game.winnerTeam === game.awayTeam ? "text-green-600 dark:text-green-400" : ""}`}>
                          {game.awayTeam}
                        </span>
                        <TeamLogo teamName={game.awayTeam} />
                      </div>
                    </div>

                    {/* Date + Round */}
                    <div className="flex items-center gap-2 sm:flex-col sm:items-end sm:gap-0.5">
                      <span className="text-xs text-muted-foreground">
                        {formatInTimeZone(new Date(game.startTime), "America/New_York", "MMM d")}
                      </span>
                      {game.round && (
                        <span className="text-xs text-muted-foreground">
                          {game.round.name}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Predictions row */}
                  {predictions.length > 0 && (
                    <div className="border-t border-border/50 pt-2">
                      <PredictionsList predictions={predictions} winnerTeam={game.winnerTeam} />
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })
        ) : (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-12 text-center">
            <p className="text-sm text-muted-foreground">
              No finished games found in the past week.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
