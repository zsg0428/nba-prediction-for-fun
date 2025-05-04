"use server";

import { format } from "date-fns";

import { prisma } from "@/lib/db";
import { api } from "@/lib/nbaApi";
import { ApiResponse, NBAGame } from "@balldontlie/sdk";
import { Game } from "@/types/IGames";

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

export const fetchGamesWithinDayRange = async (startDate: string, endDate: string) => {
  const todaysGames = await api.nba.getGames({
    seasons: [2024],
    per_page: 100,
    start_date: startDate,
    end_date: endDate,
  });
  return todaysGames;
};

export const fetchGamesInSingleDay = async (date: string) => {
  const todaysGames = await api.nba.getGames({
    seasons: [2024],
    per_page: 20,
    start_date: date,
    end_date: date,
  });
  return todaysGames;
};

export const assignGameToRound = async (
  gameApiId: number,
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
        apiGameId: gameApiId,
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

export const removeRoundFromGame = async (gameApiId: number) => {
  const game = await fetchSingleGameFromDb(gameApiId);

  try {
    await prisma.game.update({
      where: {
        apiGameId: gameApiId,
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

export const fetchSingleGameFromDb = async (gameApiId: number) => {
  const game = await prisma.game.findUnique({
    where: {
      apiGameId: gameApiId,
    },
    include: {
      round: true,
    },
  });

  if (!game) throw new Error(`game ${gameApiId} is not found`);

  return game;
};

export const fetchSingleGameIdAndIfStarted = async (gameApiId: number) => {
  const game = await fetchSingleGameFromDb(gameApiId);
  return { gameId: game.id, started: Date.now() > game.startTime.getTime() };
};

export const updateGameWinnerTeam = async (
  gameId: string,
  winnerTeam: string,
) => {
  await prisma.game.update({
    where: {
      id: gameId,
    },
    data: {
      winnerTeam: winnerTeam,
    },
  });
};

export const fetchAllPendingGamesFromDb = async () => {
  return await prisma.game.findMany({
    where: {
      winnerTeam: null,
      startTime: {
        lte: new Date(Date.now()),
      }
    },
  });
};

export const fetchAllGamesFromDb = async () => {
  const dbGames = await prisma.game.findMany({
    include: { round: true },
  });
  return dbGames;
};

export const fetchFinishedGamesSince = async (date: Date) => {
  const finishedGames = await prisma.game.findMany({
    where: {
      startTime: {
        gte: date,
      },
      winnerTeam: {
        not: null,
      },
    },
    include: {
      round: true,
    },
  });
  return finishedGames;
};

export const refreshGamesWithinOneMonth = async () => {
  const today = format(new Date(), "yyyy-MM-dd");
  const oneMonthFromToday = format(
    new Date(new Date().setMonth(new Date().getMonth() + 1)),
    "yyyy-MM-dd",
  );

  const allGames = await fetchGamesWithinDayRange(
    today,
    oneMonthFromToday,
  );

  for (const game of allGames.data as (NBAGame & { datetime: string })[]) {
    await prisma.game.upsert({
      where: {
        apiGameId: game.id,
      },
      update: {
        homeTeam: game.home_team.name,
        awayTeam: game.visitor_team.name,
        startTime: new Date(game.datetime),
      },
      create: {
        apiGameId: game.id,
        homeTeam: game.home_team.name,
        awayTeam: game.visitor_team.name,
        startTime: new Date(game.datetime),
      },
    });
  }
}

export const refreshTodaysGames = async () => {
  const today = format(new Date(), "yyyy-MM-dd");
  const todaysGames = await fetchGamesInSingleDay(today);

  for (const game of todaysGames.data as (NBAGame & { datetime: string })[]) {
    await prisma.game.upsert({
      where: {
        apiGameId: game.id,
      },
      update: {
        homeTeam: game.home_team.name,
        awayTeam: game.visitor_team.name,
        startTime: new Date(game.datetime),
      },
      create: {
        apiGameId: game.id,
        homeTeam: game.home_team.name,
        awayTeam: game.visitor_team.name,
        startTime: new Date(game.datetime),
      },
    });
  }
}