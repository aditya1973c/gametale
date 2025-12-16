"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function NotificationPanel({ open, onClose }) {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (!open) return;
    loadNotifications();
  }, [open]);

  async function loadNotifications() {
    const { data } = await supabase
      .from("notifications")
      .select("id, message, game_id, is_read")
      .order("created_at", { ascending: false })
      .limit(10);

    setNotifications(data || []);
  }

  async function markAsRead(id) {
    await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("id", id);

    loadNotifications();
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* BACKDROP */}
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />

      {/* PANEL */}
      <div className="absolute right-6 top-20 w-80 bg-zinc-900
                      border border-white/10 rounded-xl p-4">

        <h3 className="text-white font-semibold mb-3">🔔 Notifications</h3>

        {notifications.length === 0 && (
          <p className="text-zinc-400 text-sm">No notifications</p>
        )}

        <div className="space-y-2">
          {notifications.map((n) => (
            <Link
              key={n.id}
              href={`/game/${n.game_id}`}
              onClick={() => markAsRead(n.id)}
              className={`block p-3 rounded-lg text-sm transition
                ${
                  n.is_read
                    ? "bg-zinc-800 text-zinc-400"
                    : "bg-zinc-800/60 text-white hover:bg-zinc-700"
                }
              `}
            >
              {n.message}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
