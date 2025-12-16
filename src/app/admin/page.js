"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function AdminPage() {
  const [games, setGames] = useState([]);
  const [statusMsg, setStatusMsg] = useState("");
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    title: "",
    platform: "",
    image: "",
    trailer_url: "",     // ✅ YouTube full link
    description: "",
    status: "announced",
    release_date: "",
  });

  // 🔄 LOAD GAMES
  async function fetchGames() {
    const { data } = await supabase
      .from("games")
      .select("*")
      .order("id", { ascending: true });

    setGames(data || []);
  }

  useEffect(() => {
    fetchGames();
  }, []);

  // ➕ ADD / ✏️ UPDATE GAME
  async function saveGame() {
    setStatusMsg(editingId ? "Updating..." : "Adding...");

    const payload = {
      title: form.title,
      platform: form.platform,
      image: form.image,
      trailer_url: form.trailer_url,
      description: form.description,
      status: form.status,
      release_date: form.release_date || null,
    };

    let error;

    if (editingId) {
      // ✏️ UPDATE
      ({ error } = await supabase
        .from("games")
        .update(payload)
        .eq("id", editingId));
    } else {
      // ➕ ADD
      ({ error } = await supabase.from("games").insert([
        { ...payload, interest_count: 0 },
      ]));
    }

    if (error) {
      console.error(error);
      setStatusMsg("❌ Error saving game");
      return;
    }

    setStatusMsg(editingId ? "✅ Game updated" : "✅ Game added");
    resetForm();
    fetchGames();
  }

  // ✏️ EDIT GAME (THIS IS THE IMPORTANT FIX)
  function editGame(game) {
    setEditingId(game.id);
    setForm({
      title: game.title || "",
      platform: game.platform || "",
      image: game.image || "",
      trailer_url: game.trailer_url || "",   // ✅ FIXED
      description: game.description || "",
      status: game.status || "announced",
      release_date: game.release_date || "",
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // ❌ DELETE GAME
  async function deleteGame(id) {
    if (!confirm("Delete this game?")) return;
    await supabase.from("games").delete().eq("id", id);
    fetchGames();
  }

  // 🔄 RESET FORM
  function resetForm() {
    setEditingId(null);
    setForm({
      title: "",
      platform: "",
      image: "",
      trailer_url: "",
      description: "",
      status: "announced",
      release_date: "",
    });
  }

  return (
    <main className="max-w-4xl mx-auto px-6 py-10 text-white">
      <h1 className="text-2xl font-bold mb-6">🛠 Admin – Manage Games</h1>

      {/* ADD / EDIT FORM */}
      <div className="space-y-3 mb-10">
        <input
          placeholder="Title"
          className="input"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
        />

        <input
          placeholder="Platform (PC / Console / Mobile)"
          className="input"
          value={form.platform}
          onChange={(e) => setForm({ ...form, platform: e.target.value })}
        />

        <input
          placeholder="Image URL"
          className="input"
          value={form.image}
          onChange={(e) => setForm({ ...form, image: e.target.value })}
        />

        <input
          placeholder="YouTube Trailer Link"
          className="input"
          value={form.trailer_url}
          onChange={(e) => setForm({ ...form, trailer_url: e.target.value })}
        />

        <textarea
          placeholder="Description"
          className="input h-24"
          value={form.description}
          onChange={(e) =>
            setForm({ ...form, description: e.target.value })
          }
        />

        <select
          className="input"
          value={form.status}
          onChange={(e) => setForm({ ...form, status: e.target.value })}
        >
          <option value="announced">Announced</option>
          <option value="upcoming">Upcoming</option>
          <option value="released">Released</option>
        </select>

        <input
          type="date"
          className="input"
          value={form.release_date}
          onChange={(e) =>
            setForm({ ...form, release_date: e.target.value })
          }
        />

        <button onClick={saveGame} className="btn-primary w-full">
          {editingId ? "Update Game" : "Add Game"}
        </button>

        {editingId && (
          <button
            onClick={resetForm}
            className="w-full text-sm text-zinc-400 hover:text-white"
          >
            Cancel Edit
          </button>
        )}

        <p className="text-sm opacity-80">{statusMsg}</p>
      </div>

      {/* GAME LIST */}
      <h2 className="text-xl font-semibold mb-4">📋 Existing Games</h2>

      <div className="space-y-3">
        {games.map((game) => (
          <div
            key={game.id}
            className="flex justify-between items-center bg-white/5 p-3 rounded"
          >
            <div>
              <p className="font-semibold">{game.title}</p>
              <p className="text-sm opacity-70">
                {game.platform} • {game.status}
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => editGame(game)}
                className="text-blue-400 hover:text-blue-300"
              >
                Edit
              </button>

              <button
                onClick={() => deleteGame(game.id)}
                className="text-red-400 hover:text-red-300"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
