"use server";

import { format } from "date-fns";

import { prisma } from "@/lib/db";
import { api } from "@/lib/nbaApi";
import { NBAGame } from "@balldontlie/sdk";

export const fetchGames = async () => {
  const today = format(new Date(), "yyyy-MM-dd");
  const allGames = await api.nba.getGames({
    seasons: [2025],
    per_page: 100,
    start_date: today,
  });
  return allGames;
};

export const fetchGamesWithinDayRange = async (startDate: string, endDate: string) => {
  const todaysGames = await api.nba.getGames({
    seasons: [2025],
    per_page: 100,
    start_date: startDate,
    end_date: endDate,
  });
  return todaysGames;
};

export const fetchGamesInSingleDay = async (date: string) => {
  const todaysGames = await api.nba.getGames({
    seasons: [2025],
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

export const fetchAllSortedPlayoffGamesFromDb = async () => {
  const dbGames = await prisma.game.findMany({
    where: {
      isPlayoff: true,
    },
    orderBy: {
      startTime: "asc",
    },
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
  try {
    const threeDaysAgo = format(
      new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      "yyyy-MM-dd",
    );
    const oneMonthFromToday = format(
      new Date(new Date().setMonth(new Date().getMonth() + 1)),
      "yyyy-MM-dd",
    );

    const allGames = await fetchGamesWithinDayRange(
      threeDaysAgo,
      oneMonthFromToday,
    );

    for (const game of allGames.data as (NBAGame & { datetime: string })[]) {
      const isFinished = game.status === "Final";
      const winnerTeam = isFinished
        ? game.home_team_score > game.visitor_team_score
          ? game.home_team.name
          : game.visitor_team.name
        : undefined;

      await prisma.game.upsert({
        where: {
          apiGameId: game.id,
        },
        update: {
          homeTeam: game.home_team.name,
          awayTeam: game.visitor_team.name,
          startTime: new Date(game.datetime),
          isPlayoff: game.postseason,
          homeTeamScore: game.home_team_score ?? null,
          awayTeamScore: game.visitor_team_score ?? null,
          status: isNaN(new Date(game.status).getTime()) ? game.status : "Scheduled",
          ...(winnerTeam ? { winnerTeam } : {}),
        },
        create: {
          apiGameId: game.id,
          homeTeam: game.home_team.name,
          awayTeam: game.visitor_team.name,
          startTime: new Date(game.datetime),
          isPlayoff: game.postseason,
          homeTeamScore: game.home_team_score ?? null,
          awayTeamScore: game.visitor_team_score ?? null,
          status: isNaN(new Date(game.status).getTime()) ? game.status : "Scheduled",
          ...(winnerTeam ? { winnerTeam } : {}),
        },
      });
    }
  } catch (e) {
    console.error("Failed to refresh games from API (rate limited?):", e);
  }
}

export const fetchTodaysGamesFromDb = async (todayStr: string) => {
  const startOfDay = new Date(`${todayStr}T00:00:00.000Z`);
  const endOfDay = new Date(`${todayStr}T23:59:59.999Z`);

  return await prisma.game.findMany({
    where: {
      startTime: {
        gte: startOfDay,
        lte: endOfDay,
      },
    },
    include: { round: true },
    orderBy: { startTime: "asc" },
  });
};

export const fetchUpcomingGamesFromDb = async () => {
  return await prisma.game.findMany({
    where: {
      startTime: {
        gt: new Date(),
      },
    },
    include: { round: true },
    orderBy: { startTime: "asc" },
  });
};

export const refreshGameRounds = async () => {
  const sortedPlayoffGamesByStartTime = await fetchAllSortedPlayoffGamesFromDb();
  const indexedRounds = ["First Round", "Conference Semifinals", "Conference Finals", "Finals"];

  // Calculate matchups for each team
  const teamToMatchupMap = new Map<string, string[]>();
  for (const game of sortedPlayoffGamesByStartTime) {
    const homeTeam = game.homeTeam;
    const awayTeam = game.awayTeam;

    if (!teamToMatchupMap.has(homeTeam)) {
      teamToMatchupMap.set(homeTeam, []);
    }
    if (!teamToMatchupMap.has(awayTeam)) {
      teamToMatchupMap.set(awayTeam, []);
    }

    if (!teamToMatchupMap.get(homeTeam)?.includes(awayTeam)) {
      teamToMatchupMap.get(homeTeam)?.push(awayTeam);
    }
  
    if (!teamToMatchupMap.get(awayTeam)?.includes(homeTeam)) {
      teamToMatchupMap.get(awayTeam)?.push(homeTeam);
    }
  }

  const unassignedGames = sortedPlayoffGamesByStartTime.filter((game) => !game.roundId);
  for (const game of unassignedGames) {
    const homeTeamMatchups = teamToMatchupMap.get(game.homeTeam);
    const awayTeamMatchups = teamToMatchupMap.get(game.awayTeam);

    const homeIndex = homeTeamMatchups?.indexOf(game.awayTeam) ?? -1;
    const awayIndex = awayTeamMatchups?.indexOf(game.homeTeam) ?? -1;

    if (homeIndex !== -1 && homeIndex === awayIndex) {
      const roundName = indexedRounds[homeIndex];
      if (!roundName) continue;
      try {
        await assignGameToRound(game.apiGameId, roundName);
      } catch (e) {
        console.error(`Failed to assign round for ${game.homeTeam} vs ${game.awayTeam}:`, e);
      }
    }
  }
}