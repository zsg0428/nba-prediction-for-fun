// app/predictions/page.tsx
"use client";

import { useState } from "react";
import { fetchSingleGameIdAndIfStarted } from "@/actions/games";
import { upsertPrediction } from "@/actions/prediction";
import { getCurrentUserId } from "@/actions/user";
import { toast } from "sonner";

import { Separator } from "@/components/ui/separator";
import AllGamesSection from "@/components/Games/AllGamesSection";
import TodaysGamesSection from "@/components/Games/TodaysGameSection";

type Game = {
  id: number | string;
  date: string; // e.g. "2025-04-07"
  datetime?: string; // full ISO datetime string
  status: string;
  home_team: { name: string };
  home_team_score: number;
  visitor_team: { name: string };
  visitor_team_score: number;
};

type PredictionsDashboardProps = {
  todaysGames: {
    data: any[];
    meta: Record<string, any>;
  };
  allGames: {
    data: any[];
    meta: Record<string, any>;
  };
};

export default function PredictionsDashboard({
  todaysGames,
  allGames,
}: PredictionsDashboardProps) {
  // console.log(allGamesData);

  const [guesses, setGuesses] = useState<Record<string, string>>({});

  const handleGuess = async (gameApiId: string, team: string) => {
    setGuesses((prev) => ({ ...prev, [gameApiId]: team }));

    const userId = await getCurrentUserId();
    const { gameId, started } = await fetchSingleGameIdAndIfStarted(gameApiId);

    if (!started) {
      await upsertPrediction({ userId, gameId, predictedTeam: team });
      toast.success(`Updated prediction to ${team}, good luck!`);
    } else {
      toast.error("Game has started, you cannot update prediction anymore!");
    }
  };

  return (
    <main className="mx-auto max-w-4xl space-y-10 px-4 py-8">
      {/* Heading */}
      <div>
        <h1 className="mb-2 text-3xl font-bold text-primary">🏀 Predictions</h1>
        <p className="text-muted-foreground">
          Make your picks and earn points!
        </p>
      </div>

      {/* Today’s Games */}
      <TodaysGamesSection
        games={todaysGames.data}
        guesses={guesses}
        onGuess={handleGuess}
      />
      <Separator />
      {/* All Games */}
      <AllGamesSection
        games={allGames.data}
        guesses={guesses}
        onGuess={handleGuess}
        isPrediction={true}
      />
    </main>
  );
}
