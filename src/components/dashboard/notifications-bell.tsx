"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Bell } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Notification } from "@/lib/database.types";
import { markNotificationRead, markAllNotificationsRead } from "@/app/actions/notifications";

type Props = { initialNotifications: Notification[]; unreadCount: number };

export function NotificationsBell({ initialNotifications, unreadCount: initialUnread }: Props) {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState(initialNotifications);
  const [unreadCount, setUnreadCount] = useState(initialUnread);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener("click", onClickOutside);
    return () => document.removeEventListener("click", onClickOutside);
  }, [open]);

  const handleMarkOne = async (id: string) => {
    await markNotificationRead(id);
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read_at: new Date().toISOString() } : n)));
    setUnreadCount((c) => Math.max(0, c - 1));
  };

  const handleMarkAll = async () => {
    await markAllNotificationsRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, read_at: n.read_at ?? new Date().toISOString() })));
    setUnreadCount(0);
  };

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="relative rounded-lg p-2 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
        aria-label={unreadCount > 0 ? `${unreadCount} unread notifications` : "Notifications"}
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--primary-accent)] text-[10px] font-medium text-white animate-helderly-pulse">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 top-full z-50 mt-1 w-80 rounded-xl border border-zinc-200 bg-white shadow-lg dark:border-zinc-800 dark:bg-zinc-900 max-sm:right-auto max-sm:left-1/2 max-sm:-translate-x-1/2">
          <div className="flex items-center justify-between border-b border-zinc-200 px-3 py-2 dark:border-zinc-800">
            <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Notificaties</span>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAll}
                className="text-xs text-[var(--primary-accent)] hover:underline"
              >
                Alles gelezen
              </button>
            )}
          </div>
          <ul className="max-h-[60vh] overflow-auto">
            {notifications.length === 0 ? (
              <li className="px-3 py-6 text-center text-sm text-zinc-500">Geen notificaties</li>
            ) : (
              notifications.map((n) => (
                <li key={n.id}>
                  <Link
                    href={n.link ?? "/dashboard"}
                    onClick={() => {
                      if (!n.read_at) handleMarkOne(n.id);
                      setOpen(false);
                    }}
                    className={cn(
                      "block border-b border-zinc-100 px-3 py-2.5 text-left transition-colors last:border-0 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-800/50",
                      !n.read_at && "bg-[var(--primary-accent)]/5"
                    )}
                  >
                    <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{n.title}</p>
                    {n.body && <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">{n.body}</p>}
                    <p className="mt-1 text-xs text-zinc-400">{new Date(n.created_at).toLocaleDateString()}</p>
                  </Link>
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
