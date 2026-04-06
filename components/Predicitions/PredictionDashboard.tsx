"use client";

import { useState } from "react";
import { fetchSingleGameIdAndIfStarted } from "@/actions/games";
import { upsertPrediction } from "@/actions/prediction";
import { getCurrentUserId } from "@/actions/user";
import { toast } from "sonner";

import AllGamesSection from "@/components/Games/AllGamesSection";
import TodaysGamesSection from "@/components/Games/TodaysGameSection";
import { Game } from "@/types/IGames";
import { PredictionMap } from "@/types/IPredictions";

type PredictionsDashboardProps = {
  todaysGames: Game[];
  allGames: Game[];
  currentUserGuesses: Record<number, string>;
  allOtherGameGuesses: PredictionMap;
};

export default function PredictionsDashboard({
  todaysGames,
  allGames,
  currentUserGuesses,
  allOtherGameGuesses,
}: PredictionsDashboardProps) {
  const [guesses, setGuesses] = useState<Record<number, string>>(currentUserGuesses);

  const handleGuess = async (gameApiId: number, team: string) => {
    const userId = await getCurrentUserId();
    const { gameId, started } = await fetchSingleGameIdAndIfStarted(gameApiId);

    if (!started) {
      await upsertPrediction({ userId, gameId, predictedTeam: team });
      setGuesses((prev) => ({ ...prev, [gameApiId]: team }));
      toast.success(`Locked in ${team}!`);
    } else {
      toast.error("Game has started, predictions are locked!");
    }
  };

  return (
    <main className="mx-auto max-w-5xl space-y-8 px-4 py-8">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight">Predictions</h1>
        <p className="text-muted-foreground">
          Make your picks and earn points!
        </p>
      </div>

      {/* Today's Games */}
      <TodaysGamesSection
        games={todaysGames}
        guesses={guesses}
        onGuess={handleGuess}
        allOtherGameGuesses={allOtherGameGuesses}
      />

      {/* Upcoming Games */}
      {allGames.length > 0 && (
        <AllGamesSection
          games={allGames}
          guesses={guesses}
          onGuess={handleGuess}
        />
      )}
    </main>
  );
}
