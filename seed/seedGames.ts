import { fetchGames } from "@/actions/games";
import { NBAGame } from "@balldontlie/sdk";

import { prisma } from "@/lib/db";

export const seedGames = async () => {
  const allGames = await fetchGames();

  for (const game of allGames.data as (NBAGame & { datetime: string })[]) {
    await prisma.game.upsert({
      where: {
        apiGameId: game.id,
      },
      update: {
        homeTeam: game.home_team.name,
        awayTeam: game.visitor_team.name,
        startTime: new Date(game.datetime),
        isPlayoff: game.postseason,
      },
      create: {
        apiGameId: game.id,
        homeTeam: game.home_team.name,
        awayTeam: game.visitor_team.name,
        startTime: new Date(game.datetime),
        isPlayoff: game.postseason,
      },
    });
  }
  console.log("✅ Games seeded.");
};

seedGames()
  .catch((e) => {
    console.error("❌ Failed to seed games:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
