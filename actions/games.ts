"use server";

import { api } from "@/lib/nbaApi";

// https://docs.balldontlie.io/?javascript#get-all-games   API doc
export const fetchGames = async () => {
  const allGames = await api.nba.getGames({
    // postseason: true,
    seasons: [2024],
    per_page: 100,
    start_date: "2025-04-07",
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
