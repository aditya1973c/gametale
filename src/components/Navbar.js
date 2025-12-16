"use client";

import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";

export default function Navbar() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
    });

    const { data: listener } =
      supabase.auth.onAuthStateChange((_event, session) => {
        setUser(session?.user ?? null);
      });

    return () => listener.subscription.unsubscribe();
  }, []);

  return (
    <header className="sticky top-0 z-50 bg-black/80 backdrop-blur border-b border-white/10">
      <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
        {/* LEFT */}
        <div className="flex items-center gap-6">
          <Link href="/" className="text-white font-bold text-lg">
            🎮 GameTale
          </Link>

          <Link
            href="/"
            className="text-sm text-zinc-300 hover:text-white transition"
          >
            Explore
          </Link>
        </div>

        {/* RIGHT */}
        <div className="flex items-center gap-4 text-zinc-400">
          <button className="hover:text-white">📅</button>
          <button className="hover:text-white">👥</button>
          <button className="hover:text-white">🔲</button>
          <button className="hover:text-white">🔔</button>
          <button className="hover:text-white">🔍</button>

          {user ? (
            <button
              onClick={() => supabase.auth.signOut()}
              className="ml-2 bg-zinc-800 text-white px-3 py-1 rounded-md text-xs"
            >
              Logout
            </button>
          ) : (
            <button
              onClick={() =>
                supabase.auth.signInWithOAuth({ provider: "google" })
              }
              className="ml-2 bg-white text-black px-3 py-1 rounded-md text-xs"
            >
              Login
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
