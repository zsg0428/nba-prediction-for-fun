// app/predictions/page.tsx
"use client";

import { useState } from "react";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import AllGamesSection from "@/components/Games/AllGamesSection";
import TodaysGamesSection from "@/components/Games/TodaysGameSection";
import { PredictionRules } from "@/components/Predicitions/PredictionRules";

type Game = {
  id: string;
  home: string;
  away: string;
  startTime: string;
};

export default function PredictionsDashboard({ todaysGames, allGames }) {
  const todayGamesData = todaysGames.data;
  const todayGamesMeta = todaysGames.meta;

  const allGamesData = allGames.data;
  const allGamesMeta = allGames.meta;

  // console.log(allGamesData);

  const [guesses, setGuesses] = useState<Record<string, string>>({});

  const handleGuess = (gameId: string, team: string) => {
    setGuesses((prev) => ({ ...prev, [gameId]: team }));
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
        games={todayGamesData}
        guesses={guesses}
        onGuess={handleGuess}
      />
      <Separator />
      {/* All Games */}
      <AllGamesSection
        games={allGamesData}
        guesses={guesses}
        onGuess={handleGuess}
        isPrediction={true}
      />
    </main>
  );
}
