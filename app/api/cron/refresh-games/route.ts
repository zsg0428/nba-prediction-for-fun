import { NextResponse } from "next/server";
import { refreshGamesWithinOneMonth, refreshGameRounds } from "@/actions/games";
import { refreshPredictions } from "@/actions/prediction";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await refreshGamesWithinOneMonth();
    await refreshGameRounds();
    await refreshPredictions();

    return NextResponse.json({ ok: true, refreshedAt: new Date().toISOString() });
  } catch (e) {
    console.error("Cron refresh failed:", e);
    return NextResponse.json({ error: "Refresh failed" }, { status: 500 });
  }
}
