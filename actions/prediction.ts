"use server";

import { prisma } from "@/lib/db";
import { api } from "@/lib/nbaApi";
import { fetchAllPendingGamesFromDb, updateGameWinnerTeam } from "./games";

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

export const refreshPredictions = async() => {
  const pendingGames = await fetchAllPendingGamesFromDb()

  for (let pendingGame of pendingGames) {
    const game = await api.nba.getGame(pendingGame.apiGameId)
    if (game.data.status === 'Final') {
      const winnerTeam = game.data.home_team_score > game.data.visitor_team_score ? game.data.home_team.name : game.data.visitor_team.name

      await updateGameWinnerTeam(pendingGame.id, winnerTeam)
      await upsertPredictionResult(pendingGame.id, winnerTeam)
    }
  }
}

const upsertPredictionResult = async(
  gameId: string,
  winnerTeam: string
) => {
  const predictions = await fetchPredictionsByGameId(gameId)

  for (let prediction of predictions) {
    await prisma.prediction.update({
      where: {
        id: prediction.id
      },
      update: {
        isCorrect: prediction.predictedTeam === winnerTeam
      }
    })
  }
}

const fetchPredictionsByGameId = async(gameId: string) => {
  return await prisma.prediction.findMany({
    where: {
      gameId: gameId,
    }
  })
}