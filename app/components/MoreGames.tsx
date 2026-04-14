"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const games = [
  { href: "/chess", label: "Chess", color: "from-amber-400 to-yellow-600" },
  { href: "/frogger", label: "Frogger", color: "from-green-500 to-emerald-600" },
  { href: "/pac-man", label: "Pac-Man", color: "from-yellow-400 to-amber-500" },
  { href: "/2048", label: "2048", color: "from-amber-500 to-orange-600" },
  { href: "/snake", label: "Snake", color: "from-green-500 to-emerald-600" },
  { href: "/minesweeper", label: "Minesweeper", color: "from-blue-500 to-cyan-600" },
  { href: "/memory", label: "Memory Match", color: "from-purple-500 to-pink-600" },
  { href: "/whack-a-mole", label: "Whack-a-Mole", color: "from-yellow-500 to-amber-600" },
  { href: "/tic-tac-toe", label: "Tic-Tac-Toe", color: "from-cyan-500 to-blue-600" },
  { href: "/flappy", label: "Flappy Bird", color: "from-sky-400 to-blue-500" },
  { href: "/block-drop", label: "Block Drop", color: "from-violet-500 to-purple-600" },
  { href: "/wordle", label: "Word Guess", color: "from-emerald-500 to-teal-600" },
  { href: "/dino-runner", label: "Dino Runner", color: "from-lime-500 to-green-600" },
  { href: "/sudoku", label: "Sudoku", color: "from-indigo-500 to-blue-600" },
  { href: "/voxel", label: "Voxel Builder", color: "from-green-500 to-teal-600" },
  { href: "/car-racer", label: "Car Racer", color: "from-red-500 to-orange-600" },
  { href: "/tower-builder", label: "Tower Builder", color: "from-pink-500 to-rose-600" },
  { href: "/soccer", label: "Penalty Kicks", color: "from-green-500 to-lime-600" },
  { href: "/table-tennis", label: "Table Tennis", color: "from-teal-500 to-cyan-600" },
  { href: "/music-trivia", label: "Music Trivia", color: "from-purple-500 to-pink-600" },
  { href: "/connect4", label: "Connect 4", color: "from-red-500 to-yellow-500" },
  { href: "/hangman", label: "Hangman", color: "from-slate-500 to-gray-600" },
  { href: "/crossword", label: "Crossword", color: "from-amber-500 to-yellow-600" },
  { href: "/checkers", label: "Checkers", color: "from-red-600 to-gray-600" },
  { href: "/breakout", label: "Breakout", color: "from-red-500 to-purple-600" },
  { href: "/typing-race", label: "Typing Race", color: "from-blue-500 to-purple-600" },
  { href: "/word-search", label: "Word Search", color: "from-green-500 to-emerald-600" },
  { href: "/maze", label: "Maze Runner", color: "from-purple-500 to-violet-600" },
  { href: "/space-invaders", label: "Space Invaders", color: "from-red-500 to-pink-600" },
  { href: "/bubble-shooter", label: "Bubble Shooter", color: "from-purple-500 to-fuchsia-600" },
  { href: "/simon", label: "Simon Says", color: "from-blue-500 to-cyan-600" },
  { href: "/sliding-puzzle", label: "Sliding Puzzle", color: "from-green-500 to-teal-600" },
  { href: "/solitaire", label: "Solitaire", color: "from-blue-600 to-indigo-700" },
  { href: "/word-builder", label: "Word Builder", color: "from-emerald-500 to-cyan-600" },
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
