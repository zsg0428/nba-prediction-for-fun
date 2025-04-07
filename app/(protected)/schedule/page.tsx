import { fetchGames } from "@/actions/games";

import AllGamesSection from "@/components/Games/AllGamesSection";

export default async function PredictionPage() {
  const allGames = await fetchGames();
  const allGamesData = allGames.data;

  return (
    <main className="mx-auto max-w-4xl space-y-10 px-4 py-8">
      <AllGamesSection games={allGamesData} isPrediction={false} />
    </main>
  );
}
