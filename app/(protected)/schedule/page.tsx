import { fetchAllGamesFromDb, fetchGames } from "@/actions/games";

import AllGamesSection from "@/components/Games/AllGamesSection";
import { Game } from "@/types/IGames";
import { NBAGame } from "@balldontlie/sdk";

export default async function PredictionPage() {
  const allGames = await fetchGames() ;
  const dbGames = await fetchAllGamesFromDb();
  const roundMap = Object.fromEntries(
    dbGames.map((g) => [g.apiGameId, g.round?.name ?? null]),
  );

  const gamesWithRound: Game[] = (allGames.data as (NBAGame & { datetime: string })[]).map((game) => ({
    ...game,
    datetime: game.datetime,
    round: roundMap[game.id] ?? "",
  }));

  return (
    <main className="mx-auto max-w-4xl space-y-10 px-4 py-8">
      <AllGamesSection games={gamesWithRound} isPrediction={false} />
    </main>
  );
}
