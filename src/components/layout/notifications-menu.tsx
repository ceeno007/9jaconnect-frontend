"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Bell, CheckCheck, MessageSquare, Star, Ticket } from "lucide-react";
import { cn } from "@/lib/utils";

type NotificationItem = {
  id: string;
  title: string;
  body: string;
  time: string;
  href: string;
  type: "ticket" | "message" | "review";
  unread: boolean;
};

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "1",
    title: "New service request",
    body: "Chinedu Okeke replied on ticket #1042",
    time: "2m ago",
    href: "/tickets/1042",
    type: "ticket",
    unread: true,
  },
  {
    id: "2",
    title: "Message received",
    body: "Amina Plumbing Co. sent you a message",
    time: "1h ago",
    href: "/tickets/1042",
    type: "message",
    unread: true,
  },
  {
    id: "3",
    title: "Review reminder",
    body: "Leave a review for FreshCoat Painting",
    time: "Yesterday",
    href: "/review/1038",
    type: "review",
    unread: true,
  },
  {
    id: "4",
    title: "Ticket completed",
    body: "Tunde Woodworks marked ticket #1031 done",
    time: "2d ago",
    href: "/tickets/1031",
    type: "ticket",
    unread: false,
  },
];

function TypeIcon({ type }: { type: NotificationItem["type"] }) {
  if (type === "message") return <MessageSquare className="h-4 w-4" />;
  if (type === "review") return <Star className="h-4 w-4" />;
  return <Ticket className="h-4 w-4" />;
}

export function NotificationsMenu({
  variant = "icon",
}: {
  variant?: "icon" | "row";
}) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState(INITIAL_NOTIFICATIONS);
  const rootRef = useRef<HTMLDivElement>(null);
  const unreadCount = items.filter((item) => item.unread).length;

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

  function markAllRead() {
    setItems((current) => current.map((item) => ({ ...item, unread: false })));
  }

  function markRead(id: string) {
    setItems((current) =>
      current.map((item) =>
        item.id === id ? { ...item, unread: false } : item,
      ),
    );
  }

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
                  {unreadCount > 0
                    ? `${unreadCount} unread`
                    : "You're all caught up"}
                </p>
              </div>
              {unreadCount > 0 ? (
                <button
                  type="button"
                  onClick={markAllRead}
                  className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-xs font-bold text-black hover:bg-[#f3f2f1]"
                >
                  <CheckCheck className="h-3.5 w-3.5" />
                  Mark all read
                </button>
              ) : null}
            </div>

            <div className="max-h-[360px] overflow-y-auto">
              {items.map((item) => (
                <Link
                  key={item.id}
                  href={item.href}
                  onClick={() => {
                    markRead(item.id);
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
                        {item.time}
                      </span>
                    </span>
                    <span className="mt-0.5 block text-sm font-medium leading-snug text-muted">
                      {item.body}
                    </span>
                  </span>
                  {item.unread ? (
                    <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-[#0f9d58]" />
                  ) : null}
                </Link>
              ))}
            </div>

            <div className="border-t border-[#e4e2e0] px-4 py-3">
              <Link
                href="/dashboard/customer"
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
