"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Bell, CheckCheck, MessageSquare, Star, Ticket } from "lucide-react";
import { useAuth } from "@/components/providers/auth-provider";
import {
  getUnreadNotificationCount,
  listNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "@/lib/api/auth-client";
import type { InAppNotification } from "@/lib/api/types";
import { cn } from "@/lib/utils";

function TypeIcon({ type }: { type: string }) {
  const key = type.toLowerCase();
  if (key.includes("message") || key.includes("chat")) {
    return <MessageSquare className="h-4 w-4" />;
  }
  if (key.includes("review")) return <Star className="h-4 w-4" />;
  return <Ticket className="h-4 w-4" />;
}

function formatRelativeTime(value?: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const diffMs = Date.now() - date.getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString();
}

export function NotificationsMenu({
  variant = "icon",
}: {
  variant?: "icon" | "row";
}) {
  const { isAuthenticated, user } = useAuth();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<InAppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const rootRef = useRef<HTMLDivElement>(null);

  const refreshUnread = useCallback(async () => {
    if (!isAuthenticated) {
      setUnreadCount(0);
      return;
    }
    try {
      const count = await getUnreadNotificationCount();
      setUnreadCount(Number.isFinite(count) ? count : 0);
    } catch {
      // Endpoint may not be live yet; keep UI quiet.
      setUnreadCount(0);
    }
  }, [isAuthenticated]);

  const refreshList = useCallback(async () => {
    if (!isAuthenticated) {
      setItems([]);
      setError("");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const next = await listNotifications();
      setItems(next);
      setUnreadCount(next.filter((item) => item.unread).length);
    } catch {
      setItems([]);
      setError("Notifications are unavailable right now.");
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    void refreshUnread();
    const timer = window.setInterval(() => {
      void refreshUnread();
    }, 60000);
    return () => window.clearInterval(timer);
  }, [refreshUnread]);

  useEffect(() => {
    if (!open) return;
    void refreshList();
  }, [open, refreshList]);

  useEffect(() => {
    if (!open) return;

    function onPointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  async function markAllRead() {
    try {
      await markAllNotificationsRead();
      setItems((current) => current.map((item) => ({ ...item, unread: false })));
      setUnreadCount(0);
    } catch {
      setError("Could not mark notifications as read.");
    }
  }

  async function markRead(id: string) {
    setItems((current) =>
      current.map((item) =>
        item.id === id ? { ...item, unread: false } : item,
      ),
    );
    setUnreadCount((count) => Math.max(0, count - 1));
    try {
      await markNotificationRead(id);
    } catch {
      // Keep optimistic UI; next refresh will correct.
    }
  }

  const activityHref =
    user?.user_type === "professional"
      ? "/dashboard/professional"
      : "/dashboard/customer";

  return (
    <div className={cn("relative", variant === "row" && "w-full")} ref={rootRef}>
      {variant === "row" ? (
        <button
          type="button"
          className="flex w-full items-center justify-between border-b border-[#f0eeec] py-4 text-[17px] font-bold text-black"
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
        >
          <span className="inline-flex items-center gap-3">
            <Bell className="h-5 w-5" />
            Notifications
          </span>
          {unreadCount > 0 ? (
            <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-[#0f9d58] px-1.5 text-[11px] font-bold text-white">
              {unreadCount}
            </span>
          ) : null}
        </button>
      ) : (
        <button
          type="button"
          className="relative inline-flex h-10 w-10 items-center justify-center rounded-full text-[#2d2d2d] hover:bg-[#f3f2f1]"
          aria-label="Notifications"
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 ? (
            <span className="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#0f9d58] px-1 text-[10px] font-bold leading-none text-white">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          ) : null}
        </button>
      )}

      <AnimatePresence>
        {open ? (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.98 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            className={cn(
              "z-[70] overflow-hidden rounded-[16px] border border-[#e4e2e0] bg-white shadow-[0_18px_50px_rgba(0,0,0,0.12)]",
              variant === "row"
                ? "relative mt-2 w-full"
                : "absolute right-0 top-12 w-[min(92vw,360px)]",
            )}
          >
            <div className="flex items-center justify-between border-b border-[#e4e2e0] px-4 py-3">
              <div>
                <p className="text-base font-bold text-black">Notifications</p>
                <p className="text-sm font-medium text-muted">
                  {!isAuthenticated
                    ? "Sign in to see updates"
                    : unreadCount > 0
                      ? `${unreadCount} unread`
                      : "You're all caught up"}
                </p>
              </div>
              {isAuthenticated && unreadCount > 0 ? (
                <button
                  type="button"
                  onClick={() => void markAllRead()}
                  className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-xs font-bold text-black hover:bg-[#f3f2f1]"
                >
                  <CheckCheck className="h-3.5 w-3.5" />
                  Mark all read
                </button>
              ) : null}
            </div>

            <div className="max-h-[360px] overflow-y-auto">
              {!isAuthenticated ? (
                <div className="px-4 py-8 text-center">
                  <p className="text-sm font-medium text-muted">
                    Log in to get ticket and review alerts.
                  </p>
                  <Link
                    href="/login"
                    onClick={() => setOpen(false)}
                    className="mt-3 inline-block text-sm font-bold text-black hover:underline"
                  >
                    Login
                  </Link>
                </div>
              ) : loading ? (
                <div className="space-y-3 px-4 py-4">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <div
                      key={index}
                      className="h-14 animate-pulse rounded-[12px] bg-[#f3f2f1]"
                    />
                  ))}
                </div>
              ) : error ? (
                <p className="px-4 py-8 text-center text-sm font-medium text-muted">
                  {error}
                </p>
              ) : items.length === 0 ? (
                <p className="px-4 py-8 text-center text-sm font-medium text-muted">
                  No notifications yet.
                </p>
              ) : (
                items.map((item) => (
                  <Link
                    key={item.id}
                    href={item.href}
                    onClick={() => {
                      void markRead(item.id);
                      setOpen(false);
                    }}
                    className={cn(
                      "flex gap-3 border-b border-[#f0eeec] px-4 py-3.5 transition hover:bg-[#fafafa]",
                      item.unread && "bg-[#f7fbf8]",
                    )}
                  >
                    <span
                      className={cn(
                        "mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full",
                        item.unread
                          ? "bg-[#0f9d58] text-white"
                          : "bg-[#f3f2f1] text-black",
                      )}
                    >
                      <TypeIcon type={item.type} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-start justify-between gap-2">
                        <span className="text-sm font-bold text-black">
                          {item.title}
                        </span>
                        <span className="shrink-0 text-xs font-semibold text-muted">
                          {formatRelativeTime(item.created_at)}
                        </span>
                      </span>
                      {item.body ? (
                        <span className="mt-0.5 block text-sm font-medium leading-snug text-muted">
                          {item.body}
                        </span>
                      ) : null}
                    </span>
                    {item.unread ? (
                      <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-[#0f9d58]" />
                    ) : null}
                  </Link>
                ))
              )}
            </div>

            <div className="border-t border-[#e4e2e0] px-4 py-3">
              <Link
                href={activityHref}
                onClick={() => setOpen(false)}
                className="block text-center text-sm font-bold text-black hover:underline"
              >
                View all activity
              </Link>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
