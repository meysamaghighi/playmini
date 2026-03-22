"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const games = [
  { href: "/2048", label: "2048", color: "from-amber-500 to-orange-600" },
  { href: "/snake", label: "Snake", color: "from-green-500 to-emerald-600" },
];

export default function MoreGames() {
  const pathname = usePathname();

  const others = games.filter((g) => g.href !== pathname);

  if (others.length === 0) return null;

  return (
    <div className="mt-10 text-center">
      <h3 className="text-gray-500 text-sm uppercase tracking-wider mb-3">More Games</h3>
      <div className="flex flex-wrap gap-2 justify-center">
        {others.map((game) => (
          <Link
            key={game.href}
            href={game.href}
            className={`px-4 py-2 rounded-xl bg-gradient-to-r ${game.color} text-white font-bold text-sm hover:opacity-90 transition-opacity`}
          >
            {game.label}
          </Link>
        ))}
        <Link
          href="/"
          className="px-4 py-2 rounded-xl bg-gray-800 text-gray-300 font-bold text-sm hover:bg-gray-700 transition-colors"
        >
          All Games
        </Link>
      </div>
    </div>
  );
}
