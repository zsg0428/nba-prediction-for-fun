"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SignoutButton } from "@/components/Signout/SignoutButton";

export const NavBar = ({ session }) => {
  return (
    <div className="flex items-center justify-between border-b border-gray-800 bg-gradient-to-r from-gray-900 to-gray-950 px-8 py-4 shadow-md">
      {/* Logo */}
      <Link href="/" className="text-xl font-bold text-white">
        🏀 NBA Predictor
      </Link>

      {/* Nav links */}
      <div className="flex gap-6 font-medium text-white">
        <Link href="/schedule" className="hover:underline">
          Schedule
        </Link>
        <Link href="/predictions" className="hover:underline">
          Predictions
        </Link>
        <Link href="/leaderboard" className="hover:underline">
          Leaderboard
        </Link>
      </div>

      {/* User dropdown */}

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Avatar className="cursor-pointer">
            <AvatarImage src={session.user.image ?? ""} alt="user" />
            <AvatarFallback>
              {session.user.name?.charAt(0) ?? "?"}
            </AvatarFallback>
          </Avatar>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem disabled>{session.user.email}</DropdownMenuItem>
          <DropdownMenuItem disabled>{session.user.name}</DropdownMenuItem>

          <DropdownMenuItem>
            <SignoutButton />
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
