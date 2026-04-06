
import { format } from "date-fns";
import { formatInTimeZone } from "date-fns-tz";

import PredictionsDashboard from "@/components/Predicitions/PredictionDashboard";
import { getCurrentUserId } from "@/actions/user";
import {
  fetchTodaysGamesFromDb,
  fetchUpcomingGamesFromDb,
} from "@/actions/games";
import { fetchUsersPredictions, fetchAllPredictions } from "@/actions/prediction";
import { PredictionMap } from "@/types/IPredictions";
import { Game } from "@/types/IGames";

// Convert DB game to the Game type that components expect
function dbGameToGame(dbGame: any): Game {
  return {
    id: dbGame.apiGameId,
    date: format(dbGame.startTime, "yyyy-MM-dd"),
    datetime: dbGame.startTime.toISOString(),
    status: dbGame.status ?? "Scheduled",
    home_team: { name: dbGame.homeTeam },
    home_team_score: dbGame.homeTeamScore ?? 0,
    visitor_team: { name: dbGame.awayTeam },
    visitor_team_score: dbGame.awayTeamScore ?? 0,
    round: dbGame.round?.name ?? null,
    time: "",
  };
}

export default async function PredictionsPage() {
  const today = formatInTimeZone(new Date(), "America/New_York", "yyyy-MM-dd");

  const todaysDbGames = await fetchTodaysGamesFromDb(today);
  const upcomingDbGames = await fetchUpcomingGamesFromDb();

  const todayGames = todaysDbGames.map(dbGameToGame);
  const allGames = upcomingDbGames.map(dbGameToGame);

  const currentUserGueeses = await fetchCurrentUserGueeses();
  const allOtherUserGuesses = await fetchAllUserGuesses();

  return (
    <PredictionsDashboard
      todaysGames={{ data: todayGames, meta: {} }}
      allGames={{ data: allGames, meta: {} }}
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
