"use client";

import { useEffect, useState } from "react";
import GameCard from "@/components/GameCard";
import MostInterested from "@/components/MostInterested";
import { supabase } from "@/lib/supabase";

export default function Home() {
  const [games, setGames] = useState([]);
  const [user, setUser] = useState(null);

  // 🔐 AUTH
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
    });

    const { data: listener } =
      supabase.auth.onAuthStateChange((_event, session) => {
        setUser(session?.user ?? null);
      });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  // 🎮 LOAD GAMES + USER INTERESTS
  async function loadGames() {
    const { data: gamesData } = await supabase
      .from("games")
      .select("*")
      .order("interest_count", { ascending: false });

    let userLikes = [];
    if (user) {
      const { data } = await supabase
        .from("user_interests")
        .select("game_id")
        .eq("user_id", user.id);

      userLikes = data?.map((i) => i.game_id) || [];
    }

    setGames(
      gamesData.map((g) => ({
        ...g,
        liked: userLikes.includes(g.id),
      }))
    );
  }

  useEffect(() => {
    loadGames();
  }, [user]);

  // 🔥 TOGGLE INTEREST
  async function toggleInterest(game) {
    if (!user) {
      alert("Please login to mark interest");
      return;
    }

    if (game.liked) {
      await supabase
        .from("user_interests")
        .delete()
        .eq("user_id", user.id)
        .eq("game_id", game.id);

      await supabase
        .from("games")
        .update({ interest_count: game.interest_count - 1 })
        .eq("id", game.id);
    } else {
      await supabase.from("user_interests").insert({
        user_id: user.id,
        game_id: game.id,
      });

      await supabase
        .from("games")
        .update({ interest_count: game.interest_count + 1 })
        .eq("id", game.id);
    }

    loadGames();
  }

  return (
    <main className="min-h-screen bg-black text-white">
      {/* CONTENT */}
      <section className="px-6 py-8 grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* LEFT */}
        <div className="lg:col-span-3">
          <h2 className="text-2xl font-semibold mb-4">
            🔥 Talk of the Town
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {games.map((game) => (
              <GameCard
                key={game.id}
                game={game}
                onToggle={() => toggleInterest(game)}
              />
            ))}
          </div>
        </div>

        {/* RIGHT */}
        <MostInterested games={games} />
      </section>
    </main>
  );
}
