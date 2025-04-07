"use server";

import { api } from "@/lib/nbaApi";

export const fetchGames = async () => {
  const games = await api.nba.getGames({
    postseason: true,
    seasons: [2023],
  });
  console.log(games);
};
