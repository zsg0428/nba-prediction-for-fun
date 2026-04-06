"use client";

import { useState } from "react";
import { fetchSingleGameIdAndIfStarted } from "@/actions/games";
import { upsertPrediction } from "@/actions/prediction";
import { getCurrentUserId } from "@/actions/user";
import { toast } from "sonner";
import { Info } from "lucide-react";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
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

      {/* Floating Rules FAB */}
      <Popover>
        <PopoverTrigger asChild>
          <button className="fixed bottom-6 right-4 z-50 flex h-12 w-12 cursor-pointer items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:scale-105 hover:shadow-xl sm:right-6">
            <Info className="h-5 w-5" />
          </button>
        </PopoverTrigger>
        <PopoverContent align="end" side="top" className="w-60 max-w-[90vw] sm:w-64">
          <div className="space-y-2">
            <h4 className="text-sm font-semibold">Scoring Rules</h4>
            <ul className="space-y-1.5 text-sm text-muted-foreground">
              <li className="flex justify-between"><span>Play In</span><span className="font-medium text-foreground">1 pt</span></li>
              <li className="flex justify-between"><span>First Round</span><span className="font-medium text-foreground">1.5 pts</span></li>
              <li className="flex justify-between"><span>Conf. Semifinals</span><span className="font-medium text-foreground">2 pts</span></li>
              <li className="flex justify-between"><span>Conf. Finals</span><span className="font-medium text-foreground">3 pts</span></li>
              <li className="flex justify-between"><span>Finals</span><span className="font-medium text-foreground">5 pts</span></li>
            </ul>
            <p className="text-xs text-muted-foreground">Predictions lock when the game starts.</p>
          </div>
        </PopoverContent>
      </Popover>

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
