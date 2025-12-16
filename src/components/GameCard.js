import Image from "next/image";
import Link from "next/link";

export default function GameCard({ game, onToggle }) {
  return (
    <div className="bg-zinc-900 rounded-xl overflow-hidden hover:scale-[1.03] hover:shadow-xl hover:shadow-orange-500/10 transition">
      
      {/* CLICKABLE IMAGE + TITLE */}
      <Link href={`/game/${game.id}`}>
        <div className="relative h-40 cursor-pointer">
          <Image
            src={game.image}
            alt={game.title}
            fill
            className="object-cover"
          />
        </div>
      </Link>

      <div className="p-4">
        <Link href={`/game/${game.id}`}>
          <h3 className="font-semibold text-sm mb-1 hover:underline cursor-pointer">
            {game.title}
          </h3>
        </Link>

        <p className="text-xs text-zinc-400">
          {game.platform}
        </p>

        <button
          onClick={() => onToggle(game)}
          className={`mt-3 w-full text-xs py-2 rounded-lg transition
            ${
              game.liked
                ? "bg-orange-500 text-black"
                : "bg-orange-500/10 text-orange-400 hover:bg-orange-500/20"
            }`}
        >
          🔥 {game.liked ? "Interested" : "Mark Interested"}
        </button>
      </div>
    </div>
  );
}
