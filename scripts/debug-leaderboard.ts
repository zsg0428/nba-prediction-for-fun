import { prisma } from "../lib/db";

async function main() {
  const email = process.argv[2];
  if (!email) {
    console.log("Usage: npx tsx scripts/debug-leaderboard.ts <email>");
    process.exit(1);
  }

  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      predictions: {
        include: {
          game: { include: { round: true } },
        },
      },
    },
  });

  if (!user) {
    console.log(`User ${email} not found`);
    process.exit(1);
  }

  console.log(`\n=== ${user.name} (${user.email}) ===`);
  console.log(`Total predictions in DB: ${user.predictions.length}\n`);

  const byRound: Record<
    string,
    { wins: number; losses: number; pending: number; games: string[] }
  > = {};
  const noRound: { wins: number; losses: number; pending: number } = {
    wins: 0,
    losses: 0,
    pending: 0,
  };

  for (const p of user.predictions) {
    const roundName = p.game?.round?.name ?? null;
    const label = `${p.game.awayTeam} @ ${p.game.homeTeam} (${p.game.startTime.toISOString().slice(0, 10)}) [${p.game.status}] isPlayoff=${p.game.isPlayoff} isCorrect=${p.isCorrect}`;

    if (!roundName) {
      if (p.isCorrect === true) noRound.wins += 1;
      else if (p.isCorrect === false) noRound.losses += 1;
      else noRound.pending += 1;
      continue;
    }

    byRound[roundName] ??= { wins: 0, losses: 0, pending: 0, games: [] };
    if (p.isCorrect === true) byRound[roundName].wins += 1;
    else if (p.isCorrect === false) byRound[roundName].losses += 1;
    else byRound[roundName].pending += 1;
    byRound[roundName].games.push(label);
  }

  console.log("--- By Round (counted in leaderboard) ---");
  for (const [round, stats] of Object.entries(byRound)) {
    console.log(
      `${round}: ${stats.wins}W / ${stats.losses}L / ${stats.pending} pending  (total ${stats.wins + stats.losses + stats.pending})`,
    );
  }

  console.log("\n--- No Round (NOT counted) ---");
  console.log(
    `${noRound.wins}W / ${noRound.losses}L / ${noRound.pending} pending`,
  );

  const totalCounted = Object.values(byRound).reduce(
    (acc, r) => acc + r.wins + r.losses,
    0,
  );
  const totalWins = Object.values(byRound).reduce((acc, r) => acc + r.wins, 0);
  const totalLosses = Object.values(byRound).reduce(
    (acc, r) => acc + r.losses,
    0,
  );
  console.log(
    `\nLeaderboard shows: ${totalWins}W / ${totalLosses}L (decided: ${totalCounted})`,
  );

  console.log("\n--- Game Detail (by round) ---");
  for (const [round, stats] of Object.entries(byRound)) {
    console.log(`\n### ${round} (${stats.games.length} games)`);
    stats.games.forEach((g) => console.log(`  ${g}`));
  }
}

main().finally(() => prisma.$disconnect());
