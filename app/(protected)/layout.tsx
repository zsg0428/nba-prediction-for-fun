import { redirect } from "next/navigation";
import { fetchGames } from "@/actions/games";
import { createUserIfNotExists } from "@/actions/user";
import { auth } from "@/auth";

import { NavBar } from "@/components/Nav/NavBar";

const ProtectedLayout = async ({ children }) => {
  const session = await auth();
  // console.log(session);
  if (!session) {
    redirect("/login");
  }

  await createUserIfNotExists(session?.user);

  await fetchGames();
  return (
    <div>
      <NavBar session={session} />
      {children}
    </div>
  );
};

export default ProtectedLayout;
