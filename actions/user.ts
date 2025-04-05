import { prisma } from "@/lib/db";

interface UserData {
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
