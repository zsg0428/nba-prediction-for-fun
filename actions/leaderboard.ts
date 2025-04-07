"use server";

import { prisma } from "@/lib/db";

export async function getLeaderboard() {
  const users = await prisma.user.findMany({
    include: {
      predictions: {
        where: {
          isCorrect: true,
        },
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
    const totalPoints = user.predictions.reduce((sum, prediction) => {
      return sum + (prediction.game.round.point || 0);
    }, 0);

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      image: user.image,
      totalPoints,
    };
  });

  return leaderboard.sort((a, b) => b.totalPoints - a.totalPoints);
}
