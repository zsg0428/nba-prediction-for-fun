import { formatInTimeZone } from "date-fns-tz";
import { prisma } from "@/lib/db";
import { sendUnbidReminder, type UnbidGame } from "@/lib/email";

export interface UnbidUserRow {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  emailReminders: boolean;
  unbidGames: UnbidGame[];
}

export interface ReminderSendResult {
  sent: number;
  failed: number;
  details: Array<{
    userId: string;
    email: string;
    status: "sent" | "failed" | "skipped";
    reason?: string;
  }>;
}

const getTodayWindow = () => {
  const today = formatInTimeZone(new Date(), "America/New_York", "yyyy-MM-dd");
  return {
    startOfDay: new Date(`${today}T00:00:00-04:00`),
    endOfDay: new Date(`${today}T23:59:59.999-04:00`),
    now: new Date(),
  };
};

export async function getTodaysUnbidUsers(): Promise<{
  upcomingGameCount: number;
  users: UnbidUserRow[];
}> {
  const { startOfDay, endOfDay, now } = getTodayWindow();

  const todaysUpcomingGames = await prisma.game.findMany({
    where: {
      startTime: { gte: startOfDay, lte: endOfDay, gt: now },
    },
    orderBy: { startTime: "asc" },
  });

  const users = await prisma.user.findMany({
    where: { emailReminders: true },
    include: {
      predictions: {
        where: { game: { startTime: { gte: startOfDay, lte: endOfDay } } },
        select: { gameId: true },
      },
    },
  });

  const rows: UnbidUserRow[] = users.map((u) => {
    const predicted = new Set(u.predictions.map((p) => p.gameId));
    const unbidGames = todaysUpcomingGames
      .filter((g) => !predicted.has(g.id))
      .map((g) => ({
        homeTeam: g.homeTeam,
        awayTeam: g.awayTeam,
        startTime: g.startTime,
      }));
    return {
      id: u.id,
      name: u.name,
      email: u.email,
      image: u.image,
      emailReminders: u.emailReminders,
      unbidGames,
    };
  });

  return { upcomingGameCount: todaysUpcomingGames.length, users: rows };
}

export async function sendRemindersForUsers(
  userIds: string[],
): Promise<ReminderSendResult> {
  const { users } = await getTodaysUnbidUsers();
  const targets = userIds.length
    ? users.filter((u) => userIds.includes(u.id))
    : users;

  const result: ReminderSendResult = { sent: 0, failed: 0, details: [] };

  for (const user of targets) {
    if (user.unbidGames.length === 0) {
      result.details.push({
        userId: user.id,
        email: user.email,
        status: "skipped",
        reason: "No unbid games",
      });
      continue;
    }
    const firstName = user.name?.split(" ")[0] || "there";
    try {
      await sendUnbidReminder(user.email, firstName, user.unbidGames);
      result.sent++;
      result.details.push({ userId: user.id, email: user.email, status: "sent" });
    } catch (err) {
      result.failed++;
      const reason = err instanceof Error ? err.message : String(err);
      result.details.push({
        userId: user.id,
        email: user.email,
        status: "failed",
        reason,
      });
      console.error(`Failed to send reminder to ${user.email}:`, err);
    }
  }

  return result;
}
