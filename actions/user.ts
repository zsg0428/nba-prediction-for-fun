"use server";

import { auth } from "@/auth";

import { prisma } from "@/lib/db";

export interface UserData {
  name?: string | null;
  email: string;
  image?: string | null;
}

export const createUserIfNotExists = async (user: UserData): Promise<void> => {
  if (!user.email) return;

  const existingUser = await prisma.user.findUnique({
    where: {
      email: user.email,
    },
  });

  if (!existingUser) {
    await prisma.user.create({
      data: {
        email: user.email,
        name: user.name ?? "",
        image: user.image ?? "",
      },
    });
  }
};

export const updateUserProfile = async (data: {
  name: string;
  favoriteTeam: string | null;
  avatar?: string | null;
}) => {
  const userId = await getCurrentUserId();
  await prisma.user.update({
    where: { id: userId },
    data: {
      name: data.name,
      favoriteTeam: data.favoriteTeam,
      avatar: data.avatar ?? null,
    },
  });
};

export const updateEmailReminders = async (
  userId: string,
  enabled: boolean,
) => {
  await prisma.user.update({
    where: { id: userId },
    data: { emailReminders: enabled },
  });
};

export const getCurrentUser = async () => {
  const session = await auth();
  if (!session?.user?.email) return null;

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { predictions: true },
  });

  return user;
};

export const getCurrentUserId = async () => {
  const user = await getCurrentUser();

  const userId = user?.id;

  if (!userId) {
    throw new Error(`Invalid user: ${user}`);
  }

  return userId;
};
