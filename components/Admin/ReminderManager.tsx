"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { Bell, Eye, Send, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  sendBulkReminders,
  sendReminderToUser,
  previewReminderHtml,
} from "@/actions/reminders";
import type { UnbidUserRow } from "@/lib/reminders";

interface Props {
  upcomingGameCount: number;
  users: UnbidUserRow[];
}

export default function ReminderManager({ upcomingGameCount, users }: Props) {
  const [isPending, startTransition] = useTransition();
  const [rowLoading, setRowLoading] = useState<string | null>(null);
  const [previewHtml, setPreviewHtml] = useState<string | null>(null);
  const [previewName, setPreviewName] = useState<string>("");

  const unbidUsers = users.filter((u) => u.unbidGames.length > 0);

  const handleBulkSend = () => {
    startTransition(async () => {
      try {
        const result = await sendBulkReminders();
        if (result.failed === 0 && result.sent > 0) {
          toast.success(`Sent ${result.sent} reminder${result.sent > 1 ? "s" : ""}`);
        } else if (result.sent === 0) {
          toast.info("No reminders to send");
        } else {
          toast.warning(`Sent ${result.sent}, failed ${result.failed}`);
        }
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Bulk send failed");
      }
    });
  };

  const handleSendOne = (userId: string, email: string) => {
    setRowLoading(userId);
    startTransition(async () => {
      try {
        const result = await sendReminderToUser(userId);
        if (result.sent === 1) {
          toast.success(`Sent to ${email}`);
        } else if (result.details[0]?.status === "skipped") {
          toast.info(`Skipped ${email}: ${result.details[0]?.reason}`);
        } else {
          toast.error(`Failed to send to ${email}`);
        }
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Send failed");
      } finally {
        setRowLoading(null);
      }
    });
  };

  const handlePreview = (userId: string, userName: string | null) => {
    setRowLoading(userId);
    startTransition(async () => {
      try {
        const { html } = await previewReminderHtml(userId);
        setPreviewHtml(html);
        setPreviewName(userName || "User");
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Preview failed");
      } finally {
        setRowLoading(null);
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Bell className="h-5 w-5 text-primary" />
        <h2 className="text-xl font-semibold">Email Reminders</h2>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <StatCard label="Upcoming games today" value={upcomingGameCount} />
        <StatCard label="Users with reminders on" value={users.length} />
        <StatCard
          label="Users with unbid games"
          value={unbidUsers.length}
          highlight={unbidUsers.length > 0}
        />
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Send reminder emails to users who haven&apos;t predicted today&apos;s upcoming games.
        </p>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button disabled={isPending || unbidUsers.length === 0}>
              {isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Send className="mr-2 h-4 w-4" />
              )}
              Send to all unbid ({unbidUsers.length})
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Send bulk reminders?</AlertDialogTitle>
              <AlertDialogDescription>
                This will send a reminder email to {unbidUsers.length} user
                {unbidUsers.length === 1 ? "" : "s"} who haven&apos;t made all of
                their predictions today. Emails go out immediately.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleBulkSend}>
                Send {unbidUsers.length} email{unbidUsers.length === 1 ? "" : "s"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground">
                  No users with email reminders enabled.
                </TableCell>
              </TableRow>
            )}
            {users.map((user) => {
              const hasUnbid = user.unbidGames.length > 0;
              const loading = rowLoading === user.id;
              return (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {user.image ? (
                        <Image
                          src={user.image}
                          alt=""
                          width={28}
                          height={28}
                          className="rounded-full"
                        />
                      ) : (
                        <div className="h-7 w-7 rounded-full bg-muted" />
                      )}
                      <span className="font-medium">{user.name || "—"}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{user.email}</TableCell>
                  <TableCell>
                    {hasUnbid ? (
                      <Badge variant="destructive">
                        {user.unbidGames.length} unbid
                      </Badge>
                    ) : (
                      <Badge variant="secondary">All bid</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={!hasUnbid || loading || isPending}
                        onClick={() => handlePreview(user.id, user.name)}
                      >
                        <Eye className="mr-1 h-3.5 w-3.5" />
                        Preview
                      </Button>
                      <Button
                        size="sm"
                        disabled={!hasUnbid || loading || isPending}
                        onClick={() => handleSendOne(user.id, user.email)}
                      >
                        {loading ? (
                          <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Send className="mr-1 h-3.5 w-3.5" />
                        )}
                        Send
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!previewHtml} onOpenChange={(o) => !o && setPreviewHtml(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Email preview — {previewName}</DialogTitle>
          </DialogHeader>
          {previewHtml && (
            <iframe
              sandbox="allow-same-origin"
              srcDoc={previewHtml}
              className="h-[70vh] w-full rounded border"
              title="Email preview"
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function StatCard({
  label,
  value,
  highlight,
}: {
  label: string;
  value: number;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-lg border p-4 ${
        highlight ? "border-destructive/40 bg-destructive/5" : "bg-card"
      }`}
    >
      <div className="text-xs uppercase tracking-wide text-muted-foreground">
        {label}
      </div>
      <div className="mt-1 text-2xl font-bold">{value}</div>
    </div>
  );
}
