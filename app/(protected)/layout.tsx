import { redirect } from "next/navigation";
import { auth } from "@/auth";

import { NavBar } from "@/components/Nav/NavBar";

const ProtectedLayout = async ({ children }) => {
  const session = await auth();
  console.log(session);
  if (!session) {
    redirect("/login");
  }

  return (
    <div>
      <NavBar session={session} />
      {children}
    </div>
  );
};

export default ProtectedLayout;
