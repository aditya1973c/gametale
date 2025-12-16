"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [interests, setInterests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    init();
  }, []);

  async function init() {
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) {
      setLoading(false);
      return;
    }

    setUser(auth.user);

    /* USER REVIEWS */
    const { data: reviewsData } = await supabase
      .from("reviews")
      .select(`
        id,
        content,
        created_at,
        games (
          id,
          title,
          image
        )
      `)
      .eq("user_id", auth.user.id)
      .order("created_at", { ascending: false });

    /* USER INTERESTED GAMES */
    const { data: interestData } = await supabase
      .from("user_interests")
      .select(`
        games (
          id,
          title,
          image,
          release_date
        )
      `)
      .eq("user_id", auth.user.id);

    setReviews(reviewsData || []);
    setInterests(interestData?.map(i => i.games) || []);
    setLoading(false);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        Loading profile...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        Please login to view profile
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-black text-white max-w-7xl mx-auto px-6 py-10 grid grid-cols-1 lg:grid-cols-4 gap-10">

      {/* LEFT – PROFILE */}
      <aside className="space-y-6">
        <div className="bg-zinc-900 rounded-xl p-6 text-center">
          <div className="w-24 h-24 rounded-full bg-zinc-700 flex items-center justify-center mx-auto text-3xl font-bold">
            {user.email[0].toUpperCase()}
          </div>

          <h2 className="mt-4 font-semibold">
            {user.user_metadata?.full_name || "User"}
          </h2>

          <p className="text-sm text-zinc-400">
            @{user.email.split("@")[0]}
          </p>

          <div className="flex justify-around mt-6 text-sm">
            <div>
              <p className="font-semibold">{reviews.length}</p>
              <p className="text-zinc-400">Reviews</p>
            </div>
            <div>
              <p className="font-semibold">{interests.length}</p>
              <p className="text-zinc-400">Interested</p>
            </div>
          </div>

          <button className="mt-6 w-full bg-zinc-800 hover:bg-zinc-700 py-2 rounded-lg text-sm">
            Edit Profile
          </button>
        </div>
      </aside>

      {/* CENTER – REVIEWS */}
      <section className="lg:col-span-2 space-y-6">
        <h2 className="text-lg font-semibold">Reviews</h2>

        {reviews.length === 0 && (
          <p className="text-zinc-500 text-sm">No reviews yet</p>
        )}

        {reviews.map(review => (
          <div
            key={review.id}
            className="bg-zinc-900 rounded-xl p-4 space-y-3"
          >
            <Link
              href={`/game/${review.games.id}`}
              className="flex gap-3 items-center"
            >
              <div className="relative w-14 h-20 rounded-lg overflow-hidden">
                <Image
                  src={review.games.image}
                  alt={review.games.title}
                  fill
                  className="object-cover"
                />
              </div>

              <div>
                <p className="font-medium">
                  {review.games.title}
                </p>
                <p className="text-xs text-zinc-400">
                  {new Date(review.created_at).toDateString()}
                </p>
              </div>
            </Link>

            <p className="text-sm text-zinc-300">
              {review.content}
            </p>
          </div>
        ))}
      </section>

      {/* RIGHT – INTERESTED IN */}
      <aside className="space-y-4">
        <h2 className="text-lg font-semibold">Interested In</h2>

        {interests.length === 0 && (
          <p className="text-zinc-500 text-sm">
            No games marked interested
          </p>
        )}

        {interests.map(game => (
          <Link
            key={game.id}
            href={`/game/${game.id}`}
            className="flex gap-3 items-center bg-zinc-900 p-3 rounded-xl hover:bg-zinc-800 transition"
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
              <p className="text-sm font-medium">
                {game.title}
              </p>
              <p className="text-xs text-zinc-400">
                {game.release_date
                  ? new Date(game.release_date).toDateString()
                  : "Coming Soon"}
              </p>
            </div>
          </Link>
        ))}
      </aside>
    </main>
  );
}
