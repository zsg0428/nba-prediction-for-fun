"use client";

import { useState, useEffect } from "react";
import { formatInTimeZone } from "date-fns-tz";
import { AlertTriangle, Clock } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Game } from "@/types/IGames";

interface UnbidGamesModalProps {
  unbidGames: Game[];
}

export default function UnbidGamesModal({ unbidGames }: UnbidGamesModalProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (unbidGames.length === 0) return;

    const today = new Date().toISOString().slice(0, 10);
    const key = `unbid-reminder-dismissed-${today}`;
    if (sessionStorage.getItem(key)) return;

    setOpen(true);
  }, [unbidGames]);

  const handleDismiss = () => {
    const today = new Date().toISOString().slice(0, 10);
    sessionStorage.setItem(`unbid-reminder-dismissed-${today}`, "1");
    setOpen(false);
  };

  if (unbidGames.length === 0) return null;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleDismiss()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            You have {unbidGames.length} game
            {unbidGames.length > 1 ? "s" : ""} to predict!
          </DialogTitle>
          <DialogDescription>
            Don&apos;t miss out on earning points — make your picks before the
            games start.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          {unbidGames.map((game) => (
            <div
              key={game.id}
              className="flex items-center justify-between rounded-lg border p-3"
            >
              <span className="text-sm font-medium">
                {game.visitor_team.name} @ {game.home_team.name}
              </span>
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                {formatInTimeZone(
                  new Date(game.datetime),
                  "America/New_York",
                  "h:mm a",
                )}
              </span>
            </div>
          ))}
        </div>

        <DialogFooter>
          <Button onClick={handleDismiss} className="w-full cursor-pointer">
            Got it, let me pick!
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
