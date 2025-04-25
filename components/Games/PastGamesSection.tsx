import { Card, CardContent } from "@/components/ui/card";
import { format } from "date-fns";

interface FinishedGame {
  id: string;
  apiGameId: number;
  homeTeam: string;
  awayTeam: string;
  startTime: Date;
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

export default function PastGamesSection({ finishedGames }: Props) {
  const sortedGames = [...finishedGames].sort(
    (a, b) => b.startTime.getTime() - a.startTime.getTime()
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Past Games</h2>
      </div>
      <div className="flex flex-col gap-4">
        {sortedGames.length > 0 ? (
          sortedGames.map((game) => (
            <Card key={game.id} className="w-full">
              <CardContent className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 gap-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-6 w-full">
                  <div className="text-sm font-semibold">
                    {game.round?.name || "Unassigned"}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {format(game.startTime, "PPp")}
                  </div>
                  <div className="text-sm">
                    {game.homeTeam} vs {game.awayTeam}
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-2 sm:mt-0">
                  <span className="text-sm font-medium">Winner:</span>
                  <span className="text-sm text-green-600 dark:text-green-400">
                    {game.winnerTeam}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <p className="col-span-2 text-center text-muted-foreground">
            No finished games found in the past week.
          </p>
        )}
      </div>
    </div>
  );
}