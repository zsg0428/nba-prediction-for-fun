// components/predictions/GameCard.tsx
"use client";

import { cn } from "@/lib/utils";

interface GameCardProps {
  game: {
    id: string;
    home: string;
    away: string;
    startTime: string;
  };
  guess?: string;
  onGuess: (gameId: string, team: string) => void;
}

export const GameCard = ({ game, guess, onGuess }: GameCardProps) => {
  const now = new Date();
  const gameStart = new Date(game.startTime);
  const hasStarted = gameStart <= now;

  return (
    <div
      className={cn(
        "rounded-lg border p-4 transition-all",
        hasStarted ? "opacity-50" : "bg-card shadow-sm",
      )}
    >
      <div className="mb-2 flex flex-col text-base font-semibold sm:flex-row sm:items-center sm:justify-between sm:text-lg">
        <span>
          {game.home} vs {game.away}
        </span>
        <span className="text-sm text-muted-foreground">
          {gameStart.toLocaleString()}
        </span>
      </div>

      <div className="mt-2 flex flex-wrap gap-4">
        {[game.home, game.away].map((team) => (
          <button
            key={team}
            className={cn(
              "rounded border px-4 py-2 text-sm text-black dark:text-white sm:text-base",
              guess === team
                ? "bg-primary text-white dark:text-black"
                : "hover:bg-muted",
            )}
            disabled={hasStarted}
            onClick={() => onGuess(game.id, team)}
          >
            {team}
          </button>
        ))}
      </div>
    </div>
  );
};
