import {
  fetchAllGamesFromDb,
  fetchGames,
  fetchTodayGames,
} from "@/actions/games";
import { format } from "date-fns";

import PredictionsDashboard from "@/components/Predicitions/PredictionDashboard";
import { getCurrentUser, getCurrentUserId } from "@/actions/user";
import { fetchUsersPredictions, fetchAllPredictions } from "@/actions/prediction";

import { PredictionMap } from "@/types/IPredictions";

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

  const currentUserGueeses = await fetchCurrentUserGueeses();
  const allOtherUserGuesses = await fetchAllUserGuesses();

  return (
    <PredictionsDashboard
      todaysGames={{ data: todayGamesWithRound, meta: todaysGames.meta ?? {} }}
      allGames={{ data: allGamesWithRound, meta: allGames.meta ?? {} }}
      currentUserGueeses={currentUserGueeses}
      allOtherGameGuesses={allOtherUserGuesses}
    />
  );
}


const fetchCurrentUserGueeses = async () => {
  const userId = await getCurrentUserId();
  const currentUserPredictions = await fetchUsersPredictions(userId);
  const currentUserGueeses = Object.fromEntries(
    currentUserPredictions.map((p) => [p.game.apiGameId, p.predictedTeam]),
  );

  return currentUserGueeses;
}

const fetchAllUserGuesses = async () => {
  const currentUserId = await getCurrentUserId();
  const allPredictions = await fetchAllPredictions();
  const groupedPredictions: PredictionMap = {};

  for (const { game, user, predictedTeam } of allPredictions) {
    if (!groupedPredictions[game.apiGameId]) {
      groupedPredictions[game.apiGameId] = [];
    }
    if (user.id !== currentUserId) {
      groupedPredictions[game.apiGameId].push({ user: user.name, predictedTeam });
    }
  }

  return groupedPredictions
}
