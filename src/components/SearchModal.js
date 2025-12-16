"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { supabase } from "@/lib/supabase";

export default function SearchModal({ open, onClose }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const delay = setTimeout(() => {
      searchGames();
    }, 300);

    return () => clearTimeout(delay);
  }, [query]);

  async function searchGames() {
    setLoading(true);

    const { data } = await supabase
      .from("games")
      .select("id, title, image, platform")
      .ilike("title", `%${query}%`)
      .limit(10);

    setResults(data || []);
    setLoading(false);
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* BACKDROP */}
      <div
        className="absolute inset-0 bg-black/70"
        onClick={onClose}
      />

      {/* MODAL */}
      <div className="absolute top-24 left-1/2 -translate-x-1/2
                      w-full max-w-xl bg-zinc-900 rounded-xl p-4">

        <input
          autoFocus
          placeholder="Search games..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full bg-zinc-800 rounded-lg px-4 py-3
                     outline-none text-white"
        />

        <div className="mt-4 space-y-2 max-h-80 overflow-y-auto">
          {loading && (
            <p className="text-zinc-400 text-sm">Searching...</p>
          )}

          {!loading && results.length === 0 && query && (
            <p className="text-zinc-400 text-sm">No results found</p>
          )}

          {results.map((game) => (
            <Link
              key={game.id}
              href={`/game/${game.id}`}
              onClick={onClose}
              className="flex items-center gap-3 p-2 rounded-lg
                         hover:bg-zinc-800 transition"
            >
              <div className="relative w-10 h-14 rounded overflow-hidden">
                <Image
                  src={game.image}
                  alt={game.title}
                  fill
                  className="object-cover"
                />
              </div>

              <div>
                <p className="text-white text-sm font-medium">
                  {game.title}
                </p>
                <p className="text-xs text-zinc-400">
                  {game.platform}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
