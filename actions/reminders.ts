"use server";

import { revalidatePath } from "next/cache";
import { Role } from "@prisma/client";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { buildUnbidReminderHtml } from "@/lib/email";
import {
  getTodaysUnbidUsers,
  sendRemindersForUsers,
  type ReminderSendResult,
  type UnbidUserRow,
} from "@/lib/reminders";

const requireAdmin = async () => {
  const session = await auth();
  if (!session?.user?.email) {
    throw new Error("Unauthorized");
  }
  const me = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { role: true },
  });
  if (me?.role !== Role.ADMIN) {
    throw new Error("Forbidden");
  }
};

export async function getReminderOverview(): Promise<{
  upcomingGameCount: number;
  users: UnbidUserRow[];
}> {
  await requireAdmin();
  return getTodaysUnbidUsers();
}

export async function sendBulkReminders(): Promise<ReminderSendResult> {
  await requireAdmin();
  const { users } = await getTodaysUnbidUsers();
  const targetIds = users
    .filter((u) => u.unbidGames.length > 0)
    .map((u) => u.id);
  const result = await sendRemindersForUsers(targetIds);
  revalidatePath("/admin");
  return result;
}

export async function sendReminderToUser(
  userId: string,
): Promise<ReminderSendResult> {
  await requireAdmin();
  const result = await sendRemindersForUsers([userId]);
  revalidatePath("/admin");
  return result;
}

export async function previewReminderHtml(userId: string): Promise<{
  html: string;
  unbidCount: number;
}> {
  await requireAdmin();
  const { users } = await getTodaysUnbidUsers();
  const user = users.find((u) => u.id === userId);
  if (!user) {
    throw new Error("User not found or has email reminders disabled");
  }
  const firstName = user.name?.split(" ")[0] || "there";
  const html = buildUnbidReminderHtml(firstName, user.unbidGames);
  return { html, unbidCount: user.unbidGames.length };
}
