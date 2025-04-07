import { fetchGames, fetchTodayGames } from "@/actions/games";
import { format } from "date-fns";

import PredictionsDashboard from "@/components/Predicitions/PredictionDashboard";

export default async function PredictionsPage() {
  const today = format(new Date(), "yyyy-MM-dd");
  const todaysGames = await fetchTodayGames(today);

  const allGames = await fetchGames(); // all games starting from 2025-04-07

  return <PredictionsDashboard todaysGames={todaysGames} allGames={allGames} />;
}
