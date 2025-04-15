import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { fetchGames } from "@/actions/games";
import {
  createUserIfNotExists,
  getCurrentUser,
  UserData,
} from "@/actions/user";
import { auth } from "@/auth";

import { NavBar } from "@/components/Nav/NavBar";

const ProtectedLayout = async ({ children }: { children: ReactNode }) => {
  const session = await auth();
  // console.log(session);
  if (!session || !session.user?.email) {
    redirect("/login");
  }

  await createUserIfNotExists(session?.user as UserData);
  const user = await getCurrentUser();

  // fetch all games
  // TODO: change this later
  // await fetchGames();
  return (
    <div>
      <NavBar session={session} />
      {children}
    </div>
  );
};

export default ProtectedLayout;
