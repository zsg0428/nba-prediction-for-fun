import { NextResponse } from "next/server";
import { formatInTimeZone } from "date-fns-tz";
import { prisma } from "@/lib/db";
import { sendUnbidReminder } from "@/lib/email";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const today = formatInTimeZone(
      new Date(),
      "America/New_York",
      "yyyy-MM-dd",
    );
    const startOfDay = new Date(`${today}T00:00:00-04:00`);
    const endOfDay = new Date(`${today}T23:59:59.999-04:00`);
    const now = new Date();

    // Get today's games that haven't started yet
    const todaysUpcomingGames = await prisma.game.findMany({
      where: {
        startTime: {
          gte: startOfDay,
          lte: endOfDay,
          gt: now,
        },
      },
      orderBy: { startTime: "asc" },
    });

    if (todaysUpcomingGames.length === 0) {
      return NextResponse.json({
        ok: true,
        message: "No upcoming games today",
        emailsSent: 0,
      });
    }

    // Get all users with email reminders enabled
    const users = await prisma.user.findMany({
      where: { emailReminders: true },
      include: {
        predictions: {
          where: {
            game: {
              startTime: { gte: startOfDay, lte: endOfDay },
            },
          },
          select: { gameId: true },
        },
      },
    });

    let emailsSent = 0;

    for (const user of users) {
      const predictedGameIds = new Set(user.predictions.map((p) => p.gameId));
      const unbidGames = todaysUpcomingGames.filter(
        (g) => !predictedGameIds.has(g.id),
      );

      if (unbidGames.length === 0) continue;

      try {
        const firstName = user.name?.split(" ")[0] || "there";
        await sendUnbidReminder(
          user.email,
          firstName,
          unbidGames.map((g) => ({
            homeTeam: g.homeTeam,
            awayTeam: g.awayTeam,
            startTime: g.startTime,
          })),
        );
        emailsSent++;
        console.log(`Sent reminder to ${user.email}: ${unbidGames.length} unbid games`);
      } catch (error) {
        console.error(`Failed to send reminder to ${user.email}:`, error);
      }
    }

    return NextResponse.json({
      ok: true,
      emailsSent,
      totalUsers: users.length,
      gamesAvailable: todaysUpcomingGames.length,
    });
  } catch (e) {
    console.error("Send reminders cron failed:", e);
    return NextResponse.json({ error: "Send reminders failed" }, { status: 500 });
  }
}
