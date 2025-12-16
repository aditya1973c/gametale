import { supabase } from "@/lib/supabase";

export async function autoReleaseGames() {
  const today = new Date().toISOString().split("T")[0];

  // 1️⃣ Get games that should be released today
  const { data: games } = await supabase
    .from("games")
    .select("id, title")
    .eq("status", "upcoming")
    .lte("release_date", today);

  if (!games || games.length === 0) return;

  for (const game of games) {
    // 2️⃣ Mark game as released
    await supabase
      .from("games")
      .update({ status: "released" })
      .eq("id", game.id);

    // 3️⃣ Get interested users
    const { data: interests } = await supabase
      .from("user_interests")
      .select("user_id")
      .eq("game_id", game.id);

    if (!interests) continue;

    // 4️⃣ Create notifications
    const notifications = interests.map((i) => ({
      user_id: i.user_id,
      game_id: game.id,
      message: `🔥 ${game.title} is now released!`,
    }));

    if (notifications.length > 0) {
      await supabase.from("notifications").insert(notifications);
    }
  }
}
