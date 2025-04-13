"use server";

import { format } from "date-fns";

import { prisma } from "@/lib/db";
import { api } from "@/lib/nbaApi";

// https://docs.balldontlie.io/?javascript#get-all-games   API doc
export const fetchGames = async () => {
  const today = format(new Date(), "yyyy-MM-dd");
  const allGames = await api.nba.getGames({
    // postseason: true,
    seasons: [2024],
    per_page: 100,
    start_date: today,
  });
  // console.log(allGames);
  return allGames;
};

export const fetchTodayGames = async (date: string) => {
  const todaysGames = await api.nba.getGames({
    seasons: [2024],
    per_page: 20,
    start_date: date,
    end_date: date,
  });
  return todaysGames;
};

export const assignGameToRound = async (
  gameApiId: string,
  roundName: string,
) => {
  const round = await prisma.round.findUnique({
    where: {
      name: roundName,
    },
  });
  if (!round) throw new Error(`round ${roundName} is not found`);

  try {
    await prisma.game.update({
      where: {
        apiGameId: parseInt(gameApiId),
      },
      data: {
        roundId: round.id,
      },
    });
  } catch (e) {
    console.error("updating game round failed", e);
    throw new Error("updating game round failed");
  }
};

export const removeRoundFromGame = async (gameApiId: string) => {
  const game = await fetchSingleGameFromDb(gameApiId)

  try {
    await prisma.game.update({
      where: {
        apiGameId: parseInt(gameApiId),
      },
      data: {
        roundId: null,
      },
    });
  } catch (e) {
    console.error("updating game round failed", e);
    throw new Error("updating game round failed");
  }
};

export const fetchSingleGameFromDb = async (gameApiId: string) => {
  const game = await prisma.game.findUnique({
    where: {
      apiGameId: parseInt(gameApiId),
    },
  });

  if (!game) throw new Error(`game ${gameApiId} is not found`);

  return game
}

export const fetchSingleGameIdAndIfStarted = async (gameApiId: string) => {
  const game = await fetchSingleGameFromDb(gameApiId)
  return { gameId: game.id, started: Date.now() > game.startTime.getTime() }
}

export const updateGameWinnerTeam = async (gameId: string, winnerTeam: string) => {
  await prisma.game.update({
    where: {
      id: gameId,
    },
    data: {
      winnerTeam: winnerTeam,
    }
  })
}

export const fetchAllPendingGamesFromDb = async () => {
  return await prisma.game.findMany({
    where: {
      winnerTeam: null
    }
  })
}