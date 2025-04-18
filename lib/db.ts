import { PrismaClient } from "@prisma/client";

declare global {
  var cachedPrisma: PrismaClient | undefined;
}

export const prisma = globalThis.cachedPrisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") globalThis.cachedPrisma = prisma;
