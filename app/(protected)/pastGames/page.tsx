import { fetchFinishedGamesSince } from "@/actions/games";

import PastGamesSection from "@/components/Games/PastGamesSection";

export default async function PredictionPage() {
  const pastOneWeek = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const finishedGames = await fetchFinishedGamesSince(pastOneWeek);
  const validFinishedGames = finishedGames.filter(
    (game): game is (typeof game & { winnerTeam: string }) => 
    game.winnerTeam !== null
  );

  return (
    <main className="mx-auto max-w-4xl space-y-10 px-4 py-8">
      <PastGamesSection finishedGames={validFinishedGames}/>
    </main>
  );
}
