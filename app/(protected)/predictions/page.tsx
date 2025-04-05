// app/predictions/page.tsx
"use client";

import { useState } from "react";

import { GameCard } from "@/components/Predicitions/GameCard";
import { PredictionRules } from "@/components/Predicitions/PredictionRules";
import { ScoreSummary } from "@/components/Predicitions/ScoreSummary";

type Game = {
  id: string;
  home: string;
  away: string;
  startTime: string; // ISO string
};

const mockGames: Game[] = [
  {
    id: "1",
    home: "Lakers",
    away: "Warriors",
    startTime: new Date(Date.now() + 1000 * 60 * 60).toISOString(), // 1小时后
  },
  {
    id: "2",
    home: "Celtics",
    away: "Heat",
    startTime: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(), // 3小时前
  },
  {
    id: "3",
    home: "Rockets",
    away: "Lakers",
    startTime: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(), // 6小时前
  },
];

export default function PredictionsPage() {
  const [guesses, setGuesses] = useState<Record<string, string>>({});

  const handleGuess = (gameId: string, team: string) => {
    setGuesses((prev) => ({ ...prev, [gameId]: team }));
  };

  const sortedGames = [...mockGames].sort(
    (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime(),
  );

  return (
    <div className="mx-auto max-w-4xl space-y-8 px-4 py-6 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold">🏀 All Games</h1>

      {sortedGames.map((game) => (
        <GameCard
          key={game.id}
          game={game}
          guess={guesses[game.id]}
          onGuess={handleGuess}
        />
      ))}

      <ScoreSummary score={12} />

      <PredictionRules />
    </div>
  );
}
