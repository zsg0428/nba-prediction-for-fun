import { ReactNode } from "react";
import { redirect } from "next/navigation";
import {
  createUserIfNotExists,
  getCurrentUser,
  UserData,
} from "@/actions/user";
import { auth } from "@/auth";
import { Role } from "@prisma/client";

import { NavBar } from "@/components/Nav/NavBar";

const ProtectedLayout = async ({ children }: { children: ReactNode }) => {
  const session = await auth();
  if (!session || !session.user?.email) {
    redirect("/login");
  }

  await createUserIfNotExists(session?.user as UserData);
  const user = await getCurrentUser();

  return (
    <div>
      <NavBar
        session={session}
        isAdmin={user?.role === Role.ADMIN}
        userId={user?.id ?? ""}
        emailReminders={user?.emailReminders ?? true}
        favoriteTeam={user?.favoriteTeam ?? null}
      />
      {children}
    </div>
  );
};

export default ProtectedLayout;
