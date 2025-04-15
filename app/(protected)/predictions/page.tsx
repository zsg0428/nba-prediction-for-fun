import {
  fetchAllGamesFromDb,
  fetchGames,
  fetchTodayGames,
} from "@/actions/games";
import { format } from "date-fns";

import PredictionsDashboard from "@/components/Predicitions/PredictionDashboard";

export default async function PredictionsPage() {
  const today = format(new Date(), "yyyy-MM-dd");
  const todaysGames = await fetchTodayGames(today);

  const allGames = await fetchGames(); // all games starting from 2025-04-07

  const dbGames = await fetchAllGamesFromDb();
  const roundMap = Object.fromEntries(
    dbGames.map((g) => [String(g.apiGameId), g.round?.name ?? null]),
  );

  const allGamesWithRound = allGames.data.map((game) => ({
    ...game,
    round: roundMap[String(game.id)] ?? null,
  }));

  const todayGamesWithRound = todaysGames.data.map((game) => ({
    ...game,
    round: roundMap[String(game.id)] ?? null,
  }));
  return (
    <PredictionsDashboard
      todaysGames={{ data: todayGamesWithRound, meta: todaysGames.meta ?? {} }}
      allGames={{ data: allGamesWithRound, meta: allGames.meta ?? {} }}
    />
  );
}
