import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { formatInTimeZone } from "date-fns-tz";
import { getTeamLogoUrl } from "@/constants/teams";
import { CheckCircle2, Trophy } from "lucide-react";

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

interface Props {
  finishedGames: FinishedGame[];
}

function TeamLogo({ teamName }: { teamName: string }) {
  const logoUrl = getTeamLogoUrl(teamName);
  if (!logoUrl) return null;
  return (
    <Image src={logoUrl} alt={teamName} width={28} height={28} className="inline-block" />
  );
}

export default function PastGamesSection({ finishedGames }: Props) {
  const sortedGames = [...finishedGames].sort(
    (a, b) => b.startTime.getTime() - a.startTime.getTime()
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
          sortedGames.map((game) => (
            <Card key={game.id} className="overflow-hidden transition-all hover:shadow-md">
              <CardContent className="flex items-center justify-between gap-4 p-4">
                {/* Left: Teams + Score */}
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <TeamLogo teamName={game.homeTeam} />
                    <span className={`text-sm font-semibold ${game.winnerTeam === game.homeTeam ? "text-green-600 dark:text-green-400" : ""}`}>
                      {game.homeTeam}
                    </span>
                  </div>

                  <span className="text-sm font-bold tabular-nums text-muted-foreground">
                    {game.homeTeamScore ?? 0} - {game.awayTeamScore ?? 0}
                  </span>

                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-semibold ${game.winnerTeam === game.awayTeam ? "text-green-600 dark:text-green-400" : ""}`}>
                      {game.awayTeam}
                    </span>
                    <TeamLogo teamName={game.awayTeam} />
                  </div>
                </div>

                {/* Right: Meta */}
                <div className="flex flex-col items-end gap-1">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                    <span className="text-sm font-medium text-green-600 dark:text-green-400">
                      {game.winnerTeam}
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {formatInTimeZone(game.startTime, "America/New_York", "MMM d")}
                  </span>
                  {game.round && (
                    <span className="text-xs text-muted-foreground">
                      {game.round.name}
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
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
