"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { Session } from "next-auth";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SignoutButton } from "@/components/Signout/SignoutButton";
import { ThemeToggler } from "@/components/ThemeToggler/ThemeToggler";

export const NavBar = ({ session }: { session: Session | null }) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="text-xl font-bold">
          🏀 NBA Predictor
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden gap-6 text-sm font-medium md:flex">
          <Link href="/predictions" className="hover:underline">
            Predictions
          </Link>
          <Link href="/schedule" className="hover:underline">
            All Schedules
          </Link>
          <Link href="/leaderboard" className="hover:underline">
            Leaderboard
          </Link>
          <Link
            href="/rules"
            className="block text-sm"
            onClick={() => setMobileOpen(false)}
          >
            Rules
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          {/* Mobile hamburger */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </Button>
          </div>

          <ThemeToggler />
          {/* User dropdown */}
          {session?.user && (
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
                <DropdownMenuItem disabled>
                  {session.user.email}
                </DropdownMenuItem>
                <DropdownMenuItem disabled>
                  {session.user.name}
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <SignoutButton />
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      {/* Mobile Nav */}
      {mobileOpen && (
        <nav className="space-y-2 px-4 pb-4 md:hidden">
          <Link
            href="/predictions"
            className="block text-sm"
            onClick={() => setMobileOpen(false)}
          >
            Predictions
          </Link>
          <Link
            href="/schedule"
            className="block text-sm"
            onClick={() => setMobileOpen(false)}
          >
            All Schedules
          </Link>
          <Link
            href="/leaderboard"
            className="block text-sm"
            onClick={() => setMobileOpen(false)}
          >
            Leaderboard
          </Link>
          <Link
            href="/rules"
            className="block text-sm"
            onClick={() => setMobileOpen(false)}
          >
            Rules
          </Link>
        </nav>
      )}
    </header>
  );
};
