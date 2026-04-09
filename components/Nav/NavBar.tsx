"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Trophy, BarChart3, Clock, BookOpen, Shield, Bell, BellOff } from "lucide-react";
import { Session } from "next-auth";
import { toast } from "sonner";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SignoutButton } from "@/components/Signout/SignoutButton";
import { ThemeToggler } from "@/components/ThemeToggler/ThemeToggler";
import { updateEmailReminders } from "@/actions/user";

const NAV_ITEMS = [
  { href: "/predictions", label: "Predictions", icon: Trophy },
  { href: "/pastGames", label: "Past Games", icon: Clock },
  { href: "/leaderboard", label: "Leaderboard", icon: BarChart3 },
  { href: "/rules", label: "Rules", icon: BookOpen },
];

export const NavBar = ({
  session,
  isAdmin,
  userId,
  emailReminders: initialEmailReminders,
}: {
  session: Session | null;
  isAdmin?: boolean;
  userId: string;
  emailReminders: boolean;
}) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [emailReminders, setEmailReminders] = useState(initialEmailReminders);
  const pathname = usePathname();

  const handleToggleEmailReminders = async () => {
    const newValue = !emailReminders;
    setEmailReminders(newValue);
    try {
      await updateEmailReminders(userId, newValue);
      toast.success(
        newValue ? "Email reminders enabled" : "Email reminders disabled",
      );
    } catch {
      setEmailReminders(!newValue);
      toast.error("Failed to update email preference");
    }
  };

  return (
    <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-lg">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 text-lg font-bold tracking-tight sm:text-xl">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Trophy className="h-4 w-4" />
          </span>
          <span>NBA Predictor</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden items-center gap-1 md:flex">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
                {isActive && (
                  <span className="absolute bottom-0 left-1/2 h-0.5 w-6 -translate-x-1/2 rounded-full bg-primary" />
                )}
              </Link>
            );
          })}
          {isAdmin && (
            <Link
              href="/admin"
              className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                pathname === "/admin"
                  ? "text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <Shield className="h-4 w-4" />
              Admin
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-2">
          {/* Mobile hamburger */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileOpen(!mobileOpen)}
              className="cursor-pointer"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </Button>
          </div>

          <ThemeToggler />

          {/* User dropdown */}
          {session?.user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Avatar className="h-8 w-8 cursor-pointer ring-2 ring-border transition-all hover:ring-primary">
                  <AvatarImage src={session.user.image ?? ""} alt="user" />
                  <AvatarFallback className="bg-primary text-xs text-primary-foreground">
                    {session.user.name?.charAt(0) ?? "?"}
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem disabled className="flex flex-col items-start">
                  <span className="font-medium">{session.user.name}</span>
                  <span className="text-xs text-muted-foreground">{session.user.email}</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleToggleEmailReminders}
                  className="cursor-pointer"
                >
                  {emailReminders ? (
                    <Bell className="mr-2 h-4 w-4" />
                  ) : (
                    <BellOff className="mr-2 h-4 w-4" />
                  )}
                  Email Reminders: {emailReminders ? "On" : "Off"}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
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
        <nav className="animate-slide-up space-y-1 px-4 pb-4 md:hidden">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
                onClick={() => setMobileOpen(false)}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
          {isAdmin && (
            <Link
              href="/admin"
              className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
              onClick={() => setMobileOpen(false)}
            >
              <Shield className="h-4 w-4" />
              Admin
            </Link>
          )}
        </nav>
      )}
    </header>
  );
};
