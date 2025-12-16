"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

/* 🎥 YouTube helper */
function getYouTubeId(value) {
  if (!value) return null;
  if (!value.includes("http")) return value;
  if (value.includes("youtu.be/")) return value.split("youtu.be/")[1].split("?")[0];
  if (value.includes("v=")) return value.split("v=")[1].split("&")[0];
  return null;
}

/* 🎨 Status color */
function statusColor(status) {
  if (status === "released") return "bg-green-500/20 text-green-400";
  if (status === "upcoming") return "bg-blue-500/20 text-blue-400";
  return "bg-purple-500/20 text-purple-400";
}

export default function GameDetail() {
  const { id } = useParams();

  const [game, setGame] = useState(null);
  const [user, setUser] = useState(null);
  const [liked, setLiked] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [reviewText, setReviewText] = useState("");
  const [pulse, setPulse] = useState(false);

  /* 🔐 AUTH */
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const { data: listener } =
      supabase.auth.onAuthStateChange((_e, session) =>
        setUser(session?.user ?? null)
      );
    return () => listener.subscription.unsubscribe();
  }, []);

  /* LOAD ALL */
  useEffect(() => {
    if (id) loadAll();
  }, [id, user]);

  async function loadAll() {
    const { data: gameData } = await supabase
      .from("games")
      .select("*")
      .eq("id", id)
      .single();

    let isLiked = false;
    if (user) {
      const { data } = await supabase
        .from("user_interests")
        .select("id")
        .eq("user_id", user.id)
        .eq("game_id", id)
        .single();
      isLiked = !!data;
    }

    const { data: reviewsData } = await supabase
      .from("reviews")
      .select("id, content")
      .eq("game_id", id)
      .order("created_at", { ascending: false });

    setGame(gameData);
    setLiked(isLiked);
    setReviews(reviewsData || []);
  }

  /* 🔥 INTEREST */
  async function toggleInterest() {
    if (!user) return alert("Login required");

    const delta = liked ? -1 : 1;

    if (liked) {
      await supabase.from("user_interests")
        .delete()
        .eq("user_id", user.id)
        .eq("game_id", id);
    } else {
      await supabase.from("user_interests")
        .insert({ user_id: user.id, game_id: id });
    }

    await supabase.from("games")
      .update({ interest_count: game.interest_count + delta })
      .eq("id", id);

    setLiked(!liked);
    setGame({ ...game, interest_count: game.interest_count + delta });
    setPulse(true);
    setTimeout(() => setPulse(false), 250);
  }

  /* 📝 REVIEW */
  async function postReview() {
    if (!user || !reviewText.trim()) return;

    await supabase.from("reviews").insert({
      user_id: user.id,
      game_id: id,
      content: reviewText,
    });

    setReviewText("");
    loadAll();
  }

  if (!game) {
    return <div className="min-h-screen flex items-center justify-center text-white">Loading...</div>;
  }

  const videoId = getYouTubeId(game.trailer_url);

  return (
    <main className="bg-black text-white min-h-screen">
      {/* HERO */}
      <section className="relative h-[60vh]">
        {videoId && (
          <iframe
            className="absolute inset-0 w-full h-full"
            src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&controls=0&loop=1&playlist=${videoId}`}
            allow="autoplay"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent" />
        <div className="absolute bottom-10 left-10">
          <h1 className="text-4xl font-bold">{game.title}</h1>
          <p className="text-zinc-400">{game.platform}</p>
        </div>
      </section>

      {/* CONTENT */}
      <section className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* LEFT */}
        <div className="lg:col-span-8 space-y-12">
          <div>
            <h2 className="text-xl font-semibold mb-3">Overview</h2>
            <p className="text-zinc-400">{game.description}</p>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4">Reviews</h2>

            {user && (
              <>
                <textarea
                  className="w-full bg-zinc-900 p-4 rounded-lg"
                  placeholder="Write your review..."
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                />
                <button
                  onClick={postReview}
                  className="mt-3 bg-white text-black px-4 py-2 rounded-lg"
                >
                  Post Review
                </button>
              </>
            )}

            <div className="space-y-4 mt-6">
              {reviews.map(r => (
                <div key={r.id} className="bg-zinc-900 p-4 rounded-xl">
                  {r.content}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <aside className="lg:col-span-4">
          <div className="sticky top-24 space-y-5">

            {/* STATUS */}
            <div className="bg-zinc-900 rounded-xl p-4">
              <span className={`px-3 py-1 rounded-full text-xs ${statusColor(game.status)}`}>
                {game.status || "announced"}
              </span>
            </div>

            {/* RELEASE DATE */}
            {game.release_date && (
              <div className="bg-zinc-900 rounded-xl p-4">
                <p className="text-sm text-zinc-400">Release Date</p>
                <p className="text-white">
                  {new Date(game.release_date).toDateString()}
                </p>
              </div>
            )}

            {/* GENRES */}
            {Array.isArray(game.genres) && game.genres.length > 0 && (
              <div className="bg-zinc-900 rounded-xl p-4">
                <p className="text-sm text-zinc-400 mb-2">Genres</p>
                <div className="flex flex-wrap gap-2">
                  {game.genres.map((g, i) => (
                    <span key={i} className="px-3 py-1 bg-zinc-800 rounded-full text-xs">
                      {g}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* INTEREST */}
            <div className="bg-zinc-900 rounded-xl p-4">
              <p className={`text-sm text-zinc-400 ${pulse && "scale-110"}`}>
                {game.interest_count.toLocaleString()} interested
              </p>
              <button
                onClick={toggleInterest}
                className={`mt-3 w-full py-3 rounded-xl transition-all
                  ${liked
                    ? "bg-orange-500 text-black shadow-[0_0_20px_rgba(249,115,22,0.6)]"
                    : "bg-orange-500/10 text-orange-400 hover:bg-orange-500/20"}
                `}
              >
                🔥 {liked ? "Interested" : "Mark Interested"}
              </button>
            </div>

            {/* SHARE */}
            <div className="bg-zinc-900 rounded-xl p-4">
              <button
                onClick={() => navigator.share?.({
                  title: game.title,
                  url: window.location.href,
                })}
                className="w-full py-2 bg-zinc-800 rounded-lg hover:bg-zinc-700"
              >
                🔗 Share Game
              </button>
            </div>

          </div>
        </aside>
      </section>
    </main>
  );
}
