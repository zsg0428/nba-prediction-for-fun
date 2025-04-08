// scripts/seedRounds.ts
import { prisma } from "@/lib/db";

const roundData = [
  { name: "Play In", point: 1 },
  { name: "First Round", point: 1.5 },
  { name: "Conference Semifinals", point: 2 },
  { name: "Conference Finals", point: 3 },
  { name: "Finals", point: 5 },
];

async function main() {
  for (const round of roundData) {
    await prisma.round.upsert({
      where: { name: round.name },
      update: { point: round.point },
      create: { name: round.name, point: round.point },
    });
  }
  console.log("✅ Rounds seeded.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect();
  });
