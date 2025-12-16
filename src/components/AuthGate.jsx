"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import LoadingScreen from "@/components/LoadingScreen";

/* 🔀 SHUFFLE HELPER */
function shuffleArray(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export default function AuthGate({ children }) {
  const [user, setUser] = useState(null);
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
    });

    const { data: listener } =
      supabase.auth.onAuthStateChange((_event, session) => {
        setUser(session?.user ?? null);
      });

    loadGames();

    return () => listener.subscription.unsubscribe();
  }, []);

  async function loadGames() {
    const { data } = await supabase
      .from("games")
      .select("id, image")
      .not("image", "is", null);

    // 🔀 RANDOMIZE ORDER EVERY REFRESH
    const shuffled = shuffleArray(data || []).slice(0, 18);

    setGames(shuffled);
    setLoading(false);
  }

  if (loading) {
  return <LoadingScreen />;
   }

  if (!user) {
    return <LandingLogin games={games} />;
  }

  return children;
}

/* 🔐 LANDING LOGIN PAGE */
function LandingLogin({ games }) {
  async function login() {
    await supabase.auth.signInWithOAuth({
      provider: "google",
    });
  }

  const col1 = games.slice(0, 6);
  const col2 = games.slice(6, 12);
  const col3 = games.slice(12, 18);

  return (
    <main className="min-h-screen bg-black grid grid-cols-1 lg:grid-cols-2">
      {/* LEFT – POSTER WALL */}
      <div className="hidden lg:grid grid-cols-3 gap-4 p-6 relative overflow-hidden">
        <PosterColumn images={col1} animation="animate-[floatUp_18s_linear_infinite]" />
        <PosterColumn images={col2} animation="animate-[floatDown_22s_linear_infinite]" />
        <PosterColumn images={col3} animation="animate-[floatUp_20s_linear_infinite]" />

        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/40 to-black" />
      </div>

      {/* RIGHT – LOGIN */}
      <div className="flex items-center justify-center px-6">
        <div className="bg-white text-black rounded-2xl p-8 w-[360px] shadow-2xl">
          <h1 className="text-2xl font-bold text-center mb-6">
            GameTale
          </h1>

          <button
            onClick={login}
            className="w-full bg-black text-white py-3 rounded-lg font-medium hover:opacity-90 transition"
          >
            Login with Google
          </button>

          <p className="text-xs text-center text-zinc-500 mt-4">
            By continuing, you agree to our Terms & Privacy Policy
          </p>
        </div>
      </div>
    </main>
  );
}

/* 🎞 POSTER COLUMN */
function PosterColumn({ images, animation }) {
  return (
    <div className={`space-y-4 ${animation}`}>
      {images.map((game) => (
        <div
          key={game.id}
          className="relative aspect-[2/3] rounded-xl overflow-hidden bg-zinc-900 shadow-lg"
        >
          <Image
            src={game.image}
            alt="Game Poster"
            fill
            className="object-cover"
          />
        </div>
      ))}
    </div>
  );
}
