
import { format } from "date-fns";

import PredictionsDashboard from "@/components/Predicitions/PredictionDashboard";
import { getCurrentUserId } from "@/actions/user";
import {
  fetchAllGamesFromDb,
  fetchGames,
  fetchGamesInSingleDay,
  refreshGamesWithinOneMonth,
  refreshGameRounds,
} from "@/actions/games";
import { fetchUsersPredictions, fetchAllPredictions, refreshPredictions } from "@/actions/prediction";
import { PredictionMap } from "@/types/IPredictions";
import { NBAGame } from "@balldontlie/sdk";

const init = async () => {
  // Fetch any required data or state here
  await refreshGamesWithinOneMonth();
  await refreshGameRounds();
  await refreshPredictions();
}

export default async function PredictionsPage() { 
  await init();

  const today = format(new Date().toLocaleString("en-US", { timeZone: "America/New_York" }), "yyyy-MM-dd");
  const todaysGames = await fetchGamesInSingleDay(today);

  const allGames = await fetchGames(); // all games starting from 2025-04-07

  const dbGames = await fetchAllGamesFromDb();
  const roundMap = Object.fromEntries(
    dbGames.map((g) => [String(g.apiGameId), g.round?.name ?? null]),
  );

  const allGamesWithRound = allGames.data.map((game) => ({
    ...game,
    round: roundMap[String(game.id)] ?? null,
  }));

  const todayGamesWithRound = (todaysGames.data as (NBAGame & { datetime: string })[]).map((game) => ({
    ...game,
    round: roundMap[String(game.id)] ?? null,
  })).sort((a, b) => {
    const datetimeA = new Date(a.datetime);
    const datetimeB = new Date(b.datetime);
    return datetimeA.getTime() - datetimeB.getTime();
  });

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
