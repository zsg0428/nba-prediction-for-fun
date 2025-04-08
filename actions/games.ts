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
  return allGames;
};

export const fetchTodayGames = async (date) => {
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
