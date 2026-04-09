
import { format } from "date-fns";
import { formatInTimeZone } from "date-fns-tz";

import PredictionsDashboard from "@/components/Predicitions/PredictionDashboard";
import { getCurrentUserId } from "@/actions/user";
import {
  fetchTodaysGamesFromDb,
  fetchUpcomingGamesFromDb,
} from "@/actions/games";
import {
  fetchUsersPredictions,
  fetchAllPredictions,
  fetchTodaysUnbidGames,
} from "@/actions/prediction";
import { fetchAllRounds } from "@/actions/rounds";
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
  const upcomingDbGames = await fetchUpcomingGamesFromDb(today);

  const todayGames = todaysDbGames.map(dbGameToGame);
  const allGames = upcomingDbGames.map(dbGameToGame);

  const userId = await getCurrentUserId();

  const [currentUserGuesses, allOtherUserGuesses, rounds, unbidDbGames] =
    await Promise.all([
      fetchCurrentUserGuesses(userId),
      fetchAllUserGuesses(),
      fetchAllRounds(),
      fetchTodaysUnbidGames(userId, today),
    ]);

  const unbidGames = unbidDbGames.map(dbGameToGame);

  return (
    <PredictionsDashboard
      todaysGames={todayGames}
      allGames={allGames}
      currentUserGuesses={currentUserGuesses}
      allOtherGameGuesses={allOtherUserGuesses}
      rounds={rounds}
      unbidGames={unbidGames}
    />
  );
}


const fetchCurrentUserGuesses = async (userId: string) => {
  const currentUserPredictions = await fetchUsersPredictions(userId);
  const currentUserGuesses = Object.fromEntries(
    currentUserPredictions.map((p) => [p.game.apiGameId, p.predictedTeam]),
  );

  return currentUserGuesses;
};

const fetchAllUserGuesses = async () => {
  const allPredictions = await fetchAllPredictions();
  const groupedPredictions: PredictionMap = {};

  for (const { game, user, predictedTeam } of allPredictions) {
    if (!groupedPredictions[game.apiGameId]) {
      groupedPredictions[game.apiGameId] = [];
    }
    groupedPredictions[game.apiGameId].push({
      user: user.name,
      predictedTeam,
      favoriteTeam: user.favoriteTeam,
      avatar: user.avatar,
    });
  }

  return groupedPredictions;
};
