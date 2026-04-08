"use server";

import { prisma } from "@/lib/db";
import { api } from "@/lib/nbaApi";

import { updateGameWinnerTeam } from "./games";

interface GameParam {
  gameId: number;
  homeTeam: string;
  awayTeam: string;
  startTime: string;
  roundId: string;
}

interface PredictionParam {
  userId: string;
  gameId: string;
  predictedTeam: string;
}

export const upsertGame = async (gameParam: GameParam) => {
  const game = await prisma.game.upsert({
    where: {
      apiGameId: gameParam.gameId,
    },
    update: {
      homeTeam: gameParam.homeTeam,
      awayTeam: gameParam.awayTeam,
      startTime: new Date(gameParam.startTime),
      roundId: gameParam.roundId,
    },
    create: {
      apiGameId: gameParam.gameId,
      homeTeam: gameParam.homeTeam,
      awayTeam: gameParam.awayTeam,
      startTime: new Date(gameParam.startTime),
      roundId: gameParam.roundId,
    },
  });

  return game;
};

export const upsertPrediction = async ({
  userId,
  gameId,
  predictedTeam,
}: PredictionParam) => {
  const prediction = await prisma.prediction.upsert({
    where: {
      userId_gameId: {
        userId,
        gameId,
      },
    },
    update: {
      predictedTeam,
      isCorrect: null,
    },
    create: {
      userId,
      gameId,
      predictedTeam,
    },
  });

  return prediction;
};

export const refreshPredictions = async () => {
  const now = new Date();

  // Single query: all unscored predictions with their game data
  const unscoredPredictions = await prisma.prediction.findMany({
    where: { isCorrect: null, game: { startTime: { lte: now } } },
    include: { game: true },
  });

  if (unscoredPredictions.length === 0) return;

  // Split into two groups: games with winner already known vs unknown
  const withWinner: { predictionId: string; predictedTeam: string; winnerTeam: string }[] = [];
  const needsApi = new Map<string, typeof unscoredPredictions>();

  for (const pred of unscoredPredictions) {
    if (pred.game.winnerTeam) {
      withWinner.push({
        predictionId: pred.id,
        predictedTeam: pred.predictedTeam,
        winnerTeam: pred.game.winnerTeam,
      });
    } else {
      const group = needsApi.get(pred.gameId) ?? [];
      group.push(pred);
      needsApi.set(pred.gameId, group);
    }
  }

  // Batch 1: Bulk score predictions where winner is already known (2 queries total)
  if (withWinner.length > 0) {
    const correctIds = withWinner.filter((p) => p.predictedTeam === p.winnerTeam).map((p) => p.predictionId);
    const incorrectIds = withWinner.filter((p) => p.predictedTeam !== p.winnerTeam).map((p) => p.predictionId);

    await prisma.$transaction([
      ...(correctIds.length > 0
        ? [prisma.prediction.updateMany({ where: { id: { in: correctIds } }, data: { isCorrect: true } })]
        : []),
      ...(incorrectIds.length > 0
        ? [prisma.prediction.updateMany({ where: { id: { in: incorrectIds } }, data: { isCorrect: false } })]
        : []),
    ]);

    console.log(`Bulk scored ${withWinner.length} predictions (${correctIds.length} correct, ${incorrectIds.length} incorrect)`);
  }

  // Batch 2: Games that need API call (no winner yet) — sequential due to rate limits
  for (const [gameId, preds] of needsApi) {
    const game = preds[0].game;
    try {
      const apiGame = await api.nba.getGame(game.apiGameId);
      if (apiGame.data.status !== "Final") continue;

      const winnerTeam =
        apiGame.data.home_team_score > apiGame.data.visitor_team_score
          ? apiGame.data.home_team.name
          : apiGame.data.visitor_team.name;

      await updateGameWinnerTeam(game.id, winnerTeam);

      const correctIds = preds.filter((p) => p.predictedTeam === winnerTeam).map((p) => p.id);
      const incorrectIds = preds.filter((p) => p.predictedTeam !== winnerTeam).map((p) => p.id);

      await prisma.$transaction([
        ...(correctIds.length > 0
          ? [prisma.prediction.updateMany({ where: { id: { in: correctIds } }, data: { isCorrect: true } })]
          : []),
        ...(incorrectIds.length > 0
          ? [prisma.prediction.updateMany({ where: { id: { in: incorrectIds } }, data: { isCorrect: false } })]
          : []),
      ]);

      console.log(`Scored ${preds.length} predictions for game ${game.apiGameId} (winner: ${winnerTeam})`);
    } catch (error) {
      console.error(`Failed to process game ${game.apiGameId}:`, error);
    }
  }
};

export const fetchPredictionsByGameId = async (gameId: string) => {
  return await prisma.prediction.findMany({
    where: {
      gameId: gameId,
    },
  });
};

export const fetchUsersPredictions = async (userId: string) => {
  return await prisma.prediction.findMany({
    where: {
      userId: userId,
    },
    include: {
      game: {
        select: {
          apiGameId: true,
        },
      },
    }, 
  });
}

export const fetchAllPredictions = async () => {
  return await prisma.prediction.findMany({
    include: {
      game: {
        select: {
          apiGameId: true,
        },
      },
      user: {
        select: {
          id: true,
          name: true,
        }
      }
    }, 
  });
};