"use server";

import { prisma } from "@/lib/db";

export async function getLeaderboard() {
  const users = await prisma.user.findMany({
    include: {
      predictions: {
        include: {
          game: {
            include: {
              round: true,
            },
          },
        },
      },
    },
  });

  const leaderboard = users.map((user) => {
    let totalPoints = 0;
    let wins = 0;
    let losses = 0;

    for (const prediction of user.predictions) {
      if (!prediction.game?.round) continue;

      if (prediction.isCorrect === true) {
        wins += 1;
        totalPoints += prediction.game.round.point;
      } else if (prediction.isCorrect === false) {
        losses += 1;
      }
    }

    const decided = wins + losses;
    const winRate = decided > 0 ? wins / decided : null;

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      image: user.image,
      favoriteTeam: user.favoriteTeam,
      avatar: user.avatar,
      totalPoints,
      wins,
      losses,
      winRate,
    };
  });

  return leaderboard.sort((a, b) => b.totalPoints - a.totalPoints);
}
