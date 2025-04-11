"use client";

import React, { useState } from "react";
import { Trash } from "lucide-react";

import log from "@/common/logger";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { LoadingButton } from "@/components/ui/loading-button";

interface DestructiveModalParams {
  title: string;
  description: string;
  handler: () => void;
  className?: string;
  btnTitle?: string;
  variant?: "destructive" | "ghost";
  action?: string;
}

export default function DestructiveModal({
  handler,
  title,
  btnTitle,
  description,
  className,
  variant = "destructive",
  action,
}: DestructiveModalParams) {
  const [open, setOpen] = useState(false);
  const [requestInProgress, setRequestInProgress] = useState(false);

  async function handlerWrapper() {
    setRequestInProgress(true);
    await handler();
    setRequestInProgress(false);
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={() => setOpen(!open)}>
      <DialogTrigger asChild>
        <Button variant={variant} className={className}>
          <Trash className="size-4" />
          {btnTitle ? btnTitle : "Delete"}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <p>{description}</p>
        <div className="flex flex-col">
          {requestInProgress && (
            <LoadingButton className="destructive w-full" loading>
              {action ? action : "Deleting..."}
            </LoadingButton>
          )}
          {!requestInProgress && (
            <Button
              onClick={handlerWrapper}
              className="mt-4 self-end"
              variant="destructive"
            >
              Accept
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
