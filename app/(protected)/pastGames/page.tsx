import { fetchFinishedGamesSince } from "@/actions/games";
import { fetchAllPredictions } from "@/actions/prediction";
import PastGamesSection from "@/components/Games/PastGamesSection";

export default async function PastGamesPage() {
  const pastOneWeek = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const finishedGames = await fetchFinishedGamesSince(pastOneWeek);
  const validFinishedGames = finishedGames.filter(
    (game): game is (typeof game & { winnerTeam: string }) =>
      game.winnerTeam !== null
  );

  const allPredictions = await fetchAllPredictions();
  // Group predictions by apiGameId
  const predictionsByGame: Record<number, { userName: string; predictedTeam: string; favoriteTeam?: string | null; avatar?: string | null }[]> = {};
  for (const { game, user, predictedTeam } of allPredictions) {
    if (!predictionsByGame[game.apiGameId]) {
      predictionsByGame[game.apiGameId] = [];
    }
    predictionsByGame[game.apiGameId].push({
      userName: user.name ?? "Unknown",
      predictedTeam,
      favoriteTeam: user.favoriteTeam,
      avatar: user.avatar,
    });
  }

  return (
    <main className="mx-auto max-w-3xl space-y-6 px-4 py-8">
      <PastGamesSection finishedGames={validFinishedGames} predictionsByGame={predictionsByGame} />
    </main>
  );
}
