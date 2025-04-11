"use client";

import { createContext, ReactNode, useContext } from "react";

interface UserContextProp {
  id: string;
  email: string;
  name?: string;
  image?: string;
  role?: string;
}
const UserContext = createContext<UserContextProp | undefined | null>(
  undefined,
);

export function UserProvider({
  children,
  user,
}: {
  children: ReactNode;
  user?: UserContextProp | null | undefined;
}) {
  return <UserContext.Provider value={user}>{children}</UserContext.Provider>;
}

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};
