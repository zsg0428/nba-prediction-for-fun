import { NextResponse } from "next/server";
import { getTodaysUnbidUsers, sendRemindersForUsers } from "@/lib/reminders";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { upcomingGameCount, users } = await getTodaysUnbidUsers();

    if (upcomingGameCount === 0) {
      return NextResponse.json({
        ok: true,
        message: "No upcoming games today",
        emailsSent: 0,
      });
    }

    const targetIds = users
      .filter((u) => u.unbidGames.length > 0)
      .map((u) => u.id);

    const result = await sendRemindersForUsers(targetIds);

    return NextResponse.json({
      ok: true,
      emailsSent: result.sent,
      failed: result.failed,
      totalUsers: users.length,
      gamesAvailable: upcomingGameCount,
    });
  } catch (e) {
    console.error("Send reminders cron failed:", e);
    return NextResponse.json({ error: "Send reminders failed" }, { status: 500 });
  }
}
