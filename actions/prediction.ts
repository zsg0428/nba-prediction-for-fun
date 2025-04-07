"use server";

import { prisma } from "@/lib/db";

interface GameParam {
  gameId: number;
  homeTeam: string;
  awayTeam: string;
  startTime: string; // ISO stirng
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
