"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function MostInterested() {
  const [games, setGames] = useState([]);
  const [mode, setMode] = useState("month");
  const [monthLabel, setMonthLabel] = useState("");

  useEffect(() => {
    loadTopGames();

    // 🔴 REALTIME LISTENER
    const channel = supabase
      .channel("interest-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "user_interests",
        },
        () => {
          loadTopGames(); // re-fetch on any change
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [mode]);

  async function loadTopGames() {
    const start = new Date();

    if (mode === "month") {
      start.setDate(1);
    } else {
      start.setDate(start.getDate() - 7);
    }

    start.setHours(0, 0, 0, 0);

    const end = new Date();
    end.setHours(23, 59, 59, 999);

    setMonthLabel(
      new Date().toLocaleString("en-US", {
        month: "long",
        year: "numeric",
      })
    );

    const { data, error } = await supabase
      .from("user_interests")
      .select("game_id, games(*)")
      .gte("created_at", start.toISOString())
      .lte("created_at", end.toISOString());

    if (error) {
      console.error(error);
      return;
    }

    const countMap = {};
    data.forEach((row) => {
      countMap[row.game_id] =
        (countMap[row.game_id] || 0) + 1;
    });

    const top5 = Object.entries(countMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([gameId, count]) => {
        const game = data.find(
          (d) => d.game_id == gameId
        )?.games;

        return {
          ...game,
          interest_count: count,
        };
      });

    setGames(top5);
  }

  return (
    <aside className="bg-zinc-900/80 rounded-2xl p-4 w-full">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-semibold flex items-center gap-2">
          🔥 Most Interested
        </h3>

        {/* TOGGLE */}
        <div className="flex bg-zinc-800 rounded-md p-1 text-xs">
          <button
            onClick={() => setMode("week")}
            className={`px-2 py-1 rounded transition ${
              mode === "week"
                ? "bg-orange-500 text-black"
                : "text-zinc-400"
            }`}
          >
            Week
          </button>

          <button
            onClick={() => setMode("month")}
            className={`px-2 py-1 rounded transition ${
              mode === "month"
                ? "bg-orange-500 text-black"
                : "text-zinc-400"
            }`}
          >
            {monthLabel}
          </button>
        </div>
      </div>

      {/* LIST */}
      <div className="space-y-3">
        {games.map((game, index) => (
          <Link
            key={game.id}
            href={`/game/${game.id}`}
            className="group glow-hover animate-fade-slide
                       flex items-center gap-3 p-2 rounded-xl
                       hover:bg-zinc-800 transition-all"
          >
            {/* RANK */}
            <div className="text-xl font-bold w-6 text-center text-zinc-500">
              {index + 1}
            </div>

            {/* IMAGE */}
            <div className="relative w-12 h-16 rounded-lg overflow-hidden">
              <Image
                src={game.image}
                alt={game.title}
                fill
                className="object-cover"
              />
            </div>

            {/* INFO */}
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-medium truncate">
                {game.title}
              </p>

              <p className="text-zinc-400 text-xs capitalize">
                {game.status || "announced"}
              </p>

              <p className="text-orange-400 text-xs mt-1">
                🔥 {game.interest_count.toLocaleString()} Interested
              </p>
            </div>
          </Link>
        ))}

        {games.length === 0 && (
          <p className="text-zinc-500 text-sm">
            No activity in this period
          </p>
        )}
      </div>
    </aside>
  );
}
