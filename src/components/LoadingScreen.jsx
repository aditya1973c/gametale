"use client";

export default function LoadingScreen() {
  return (
    <div className="fixed inset-0 z-[9999] bg-black flex flex-col items-center justify-center">
      
      {/* LOGO */}
      <div className="flex items-center gap-3 mb-6 animate-fadeIn">
        <span className="text-3xl">🎮</span>
        <h1 className="text-3xl font-bold tracking-wide text-white">
          GameTale
        </h1>
      </div>

      {/* PULSE RING */}
      <div className="relative mb-6">
        <div className="w-16 h-16 rounded-full border-2 border-orange-500 animate-ping absolute"></div>
        <div className="w-16 h-16 rounded-full border-2 border-orange-500"></div>
      </div>

      {/* LOADING DOTS */}
      <div className="flex gap-2">
        <span className="loading-dot delay-0"></span>
        <span className="loading-dot delay-150"></span>
        <span className="loading-dot delay-300"></span>
      </div>

      {/* TEXT */}
      <p className="text-zinc-400 text-sm mt-6 tracking-wide animate-fadeInSlow">
        Loading your experience...
      </p>
    </div>
  );
}
