import { fetchFinishedGamesSince } from "@/actions/games";
import { refreshPredictions } from "@/actions/prediction";

import PastGamesSection from "@/components/Games/PastGamesSection";
import { Game } from "@/types/IGames";
import { NBAGame } from "@balldontlie/sdk";

export default async function PredictionPage() {
  await refreshPredictions();
  
  const today = new Date();
  const pastOneWeek = new Date(today.setDate(today.getDate() - 7));
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
