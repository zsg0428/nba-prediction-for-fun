import { fetchAllGamesFromDb, fetchGames } from "@/actions/games";

import AllGamesSection from "@/components/Games/AllGamesSection";

export default async function PredictionPage() {
  const allGames = await fetchGames();
  const dbGames = await fetchAllGamesFromDb();
  const roundMap = Object.fromEntries(
    dbGames.map((g) => [String(g.apiGameId), g.round?.name ?? null]),
  );

  const gamesWithRound = allGames.data.map((game) => ({
    ...game,
    round: roundMap[String(game.id)] ?? null,
  }));
  return (
    <main className="mx-auto max-w-4xl space-y-10 px-4 py-8">
      <AllGamesSection games={gamesWithRound} isPrediction={false} />
    </main>
  );
}
