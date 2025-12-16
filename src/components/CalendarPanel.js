"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function CalendarPanel({ open, onClose }) {
  const [games, setGames] = useState([]);

  useEffect(() => {
    if (!open) return;

    async function loadUpcoming() {
      const today = new Date().toISOString();

      const { data } = await supabase
        .from("games")
        .select("id, title, release_date")
        .gte("release_date", today)
        .order("release_date", { ascending: true })
        .limit(10);

      setGames(data || []);
    }

    loadUpcoming();
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* BACKDROP */}
      <div
        className="absolute inset-0 bg-black/60"
        onClick={onClose}
      />

      {/* PANEL */}
      <div className="absolute right-0 top-0 h-full w-80 bg-zinc-900 border-l border-white/10 p-5">
        <h2 className="text-lg font-semibold mb-4">📅 Upcoming Releases</h2>

        <p className="text-xs text-zinc-400 mb-4">
          {new Date().toDateString()}
        </p>

        <div className="space-y-3">
          {games.length === 0 && (
            <p className="text-zinc-500 text-sm">No upcoming games</p>
          )}

          {games.map((game) => (
            <div
              key={game.id}
              className="bg-zinc-800 rounded-lg p-3"
            >
              <p className="text-white text-sm font-medium">
                {game.title}
              </p>
              <p className="text-zinc-400 text-xs">
                {new Date(game.release_date).toLocaleDateString("en-US", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
