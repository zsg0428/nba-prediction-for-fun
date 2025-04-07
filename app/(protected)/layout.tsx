import { redirect } from "next/navigation";
import { fetchGames } from "@/actions/games";
import { createUserIfNotExists, getCurrentUser } from "@/actions/user";
import { auth } from "@/auth";

import { NavBar } from "@/components/Nav/NavBar";

const ProtectedLayout = async ({ children }) => {
  const session = await auth();
  // console.log(session);
  if (!session || !session.user?.email) {
    redirect("/login");
  }

  await createUserIfNotExists(session?.user);
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
