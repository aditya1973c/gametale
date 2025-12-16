"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { autoReleaseGames } from "@/lib/autoRelease";

export default function CalendarPage() {
  const [activeTab, setActiveTab] = useState("upcoming");
  const [platform, setPlatform] = useState("all");
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 🔥 AUTO MOVE UPCOMING → RELEASED
    autoReleaseGames();
    loadGames();
  }, [activeTab, platform]);

  async function loadGames() {
    setLoading(true);

    let query = supabase
      .from("games")
      .select("id, title, image, platform, status")
      .ilike("status", `%${activeTab}%`)
      .order("interest_count", { ascending: false });

    if (platform !== "all") {
      query = query.ilike("platform", `%${platform}%`);
    }

    const { data, error } = await query;

    if (error) {
      console.error(error);
    }

    setGames(data || []);
    setLoading(false);
  }

  return (
    <main className="min-h-screen bg-black text-white flex">
      {/* SIDEBAR */}
      <aside className="w-64 border-r border-white/10 p-4 space-y-2">
        <h3 className="text-sm text-zinc-400 mb-2">Schedule</h3>

        {[
          { id: "upcoming", label: "Upcoming" },
          { id: "announced", label: "Announced" },
          { id: "released", label: "Released" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition
              ${
                activeTab === tab.id
                  ? "bg-purple-600 text-white"
                  : "text-zinc-400 hover:bg-zinc-800"
              }
            `}
          >
            {tab.label}
          </button>
        ))}
      </aside>

      {/* MAIN */}
      <section className="flex-1 px-6 py-6">
        <h1 className="text-xl font-semibold mb-4 capitalize">
          {activeTab} Games
        </h1>

        {/* PLATFORM FILTER */}
        <div className="flex items-center gap-3 mb-6">
          {["all", "pc", "console", "mobile"].map((p) => (
            <button
              key={p}
              onClick={() => setPlatform(p)}
              className={`px-4 py-1.5 rounded-full text-sm transition
                ${
                  platform === p
                    ? "bg-white text-black"
                    : "bg-zinc-800 text-zinc-400 hover:text-white"
                }
              `}
            >
              {p.toUpperCase()}
            </button>
          ))}
        </div>

        {loading && <p className="text-zinc-500">Loading games...</p>}

        {!loading && games.length === 0 && (
          <p className="text-zinc-500">No games found.</p>
        )}

        {/* GRID */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {games.map((game) => (
            <Link
              key={game.id}
              href={`/game/${game.id}`}
              className="group transition-all duration-300
                         hover:-translate-y-1
                         hover:shadow-[0_0_25px_rgba(168,85,247,0.25)]"
            >
              <div className="relative aspect-[2/3] rounded-xl overflow-hidden bg-zinc-900">
                <Image
                  src={game.image}
                  alt={game.title}
                  fill
                  className="object-cover transition-transform duration-300
                             group-hover:scale-110"
                />
              </div>

              <h4 className="mt-2 text-sm font-medium group-hover:text-purple-400 transition">
                {game.title}
              </h4>

              <p className="text-xs text-zinc-400">{game.platform}</p>

              <p
                className={`text-xs capitalize font-medium
                  ${
                    game.status === "released"
                      ? "text-green-400"
                      : game.status === "upcoming"
                      ? "text-blue-400"
                      : "text-purple-400"
                  }
                `}
              >
                {game.status}
              </p>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
