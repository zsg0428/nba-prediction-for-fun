"use server";

import { prisma } from "@/lib/db";

export const fetchAllRounds = async () => {
  return await prisma.round.findMany({
    orderBy: { point: "asc" },
  });
};

export const updateRoundPoint = async (roundId: string, newPoint: number) => {
  if (newPoint <= 0) throw new Error("Point value must be greater than 0");

  return await prisma.round.update({
    where: { id: roundId },
    data: { point: newPoint },
  });
};
