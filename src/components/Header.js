"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase";

import SearchModal from "@/components/SearchModal";
import NotificationPanel from "@/components/NotificationPanel";

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();

  const [user, setUser] = useState(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  /* 🔐 AUTH STATE */
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

  async function login() {
    await supabase.auth.signInWithOAuth({ provider: "google" });
  }

  async function logout() {
    await supabase.auth.signOut();
    router.push("/");
  }

  return (
    <>
      {/* NAVBAR */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-black/80 backdrop-blur">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          
          {/* LEFT */}
          <div className="flex items-center gap-6">
            {/* LOGO */}
            <Link
              href="/"
              className="flex items-center gap-2 font-bold text-lg"
            >
               GameTale
            </Link>

            {/* EXPLORE */}
            <Link
              href="/"
              className={`relative text-sm transition
                ${
                  pathname === "/"
                    ? "text-white"
                    : "text-zinc-400 hover:text-white"
                }
              `}
            >
              Explore
              <span
                className={`absolute left-0 -bottom-1 h-[2px]
                  bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.9)]
                  transition-all duration-300
                  ${pathname === "/" ? "w-full" : "w-0 hover:w-full"}
                `}
              />
            </Link>
          </div>

          {/* RIGHT */}
          <div className="flex items-center gap-4 text-zinc-400">
            {/* CALENDAR */}
            <button
              onClick={() => router.push("/calendar")}
              className="hover:text-white transition"
              title="Calendar"
            >
              📅
            </button>

            {/* PROFILE (FIXED) */}
            <button
              onClick={() => router.push("/profile")}
              className={`hover:text-white transition ${
                pathname === "/profile" ? "text-white" : ""
              }`}
              title="Profile"
            >
              👥
            </button>

            {/* NOTIFICATIONS */}
            <button
              onClick={() => setNotifOpen(true)}
              className="hover:text-white transition"
              title="Notifications"
            >
              🔔
            </button>

            {/* SEARCH */}
            <button
              onClick={() => setSearchOpen(true)}
              className="hover:text-white transition"
              title="Search"
            >
              🔍
            </button>

            {/* AUTH */}
            {user ? (
              <button
                onClick={logout}
                className="ml-2 text-sm bg-zinc-800 hover:bg-zinc-700
                           px-4 py-2 rounded-lg transition"
              >
                Logout
              </button>
            ) : (
              <button
                onClick={login}
                className="ml-2 text-sm bg-white text-black
                           px-4 py-2 rounded-lg hover:bg-zinc-200 transition"
              >
                Login
              </button>
            )}
          </div>
        </div>
      </header>

      {/* SEARCH MODAL */}
      <SearchModal
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
      />

      {/* NOTIFICATION PANEL */}
      <NotificationPanel
        open={notifOpen}
        onClose={() => setNotifOpen(false)}
      />
    </>
  );
}
