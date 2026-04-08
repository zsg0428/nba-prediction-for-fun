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

export const createRound = async (name: string, point: number) => {
  if (!name.trim()) throw new Error("Round name is required");
  if (point <= 0) throw new Error("Point value must be greater than 0");

  const existing = await prisma.round.findUnique({ where: { name: name.trim() } });
  if (existing) throw new Error(`Round "${name}" already exists`);

  return await prisma.round.create({
    data: { name: name.trim(), point },
  });
};

export const deleteRound = async (roundId: string) => {
  const gamesUsingRound = await prisma.game.count({ where: { roundId } });
  if (gamesUsingRound > 0) {
    throw new Error(`Cannot delete: ${gamesUsingRound} game(s) are assigned to this round`);
  }

  return await prisma.round.delete({ where: { id: roundId } });
};
