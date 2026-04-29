import React from "react";

export type FilterTag = "1 min" | "5 min" | "15+ min" | "Solo" | "2P" | "Word" | "Reflex" | "Memory" | "Logic";
export type CuratedGroup = "classics" | "reflexes";

export type Game = {
  slug: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  tags: FilterTag[];
  curated?: CuratedGroup[];
};

export const GAMES: Game[] = [
  {
    slug: "snake",
    title: "Snake",
    description: "Classic arcade - eat food and grow longer",
    tags: ["5 min", "Solo", "Reflex"],
    curated: ["classics", "reflexes"],
    icon: (
      <svg viewBox="0 0 48 48" className="w-full h-full" fill="none">
        <path d="M8 24h8v-8h8v8h8v8h8" stroke="#22c55e" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="40" cy="32" r="3" fill="#ef4444" />
      </svg>
    ),
  },
  {
    slug: "2048",
    title: "2048",
    description: "Classic number puzzle - merge tiles to 2048",
    tags: ["5 min", "Solo", "Logic"],
    curated: ["classics"],
    icon: (
      <svg viewBox="0 0 48 48" className="w-full h-full" fill="none">
        <rect x="4" y="4" width="18" height="18" rx="3" fill="#f59e0b" />
        <rect x="26" y="4" width="18" height="18" rx="3" fill="#ef4444" />
        <rect x="4" y="26" width="18" height="18" rx="3" fill="#8b5cf6" />
        <rect x="26" y="26" width="18" height="18" rx="3" fill="#22c55e" />
        <text x="13" y="17" textAnchor="middle" fill="white" fontSize="10" fontWeight="bold">2</text>
        <text x="35" y="17" textAnchor="middle" fill="white" fontSize="10" fontWeight="bold">4</text>
        <text x="13" y="39" textAnchor="middle" fill="white" fontSize="10" fontWeight="bold">8</text>
        <text x="35" y="39" textAnchor="middle" fill="white" fontSize="9" fontWeight="bold">16</text>
      </svg>
    ),
  },
  {
    slug: "flappy",
    title: "Flappy Bird",
    description: "Tap to flap through the pipes",
    tags: ["1 min", "Solo", "Reflex"],
    curated: ["classics", "reflexes"],
    icon: (
      <svg viewBox="0 0 48 48" className="w-full h-full" fill="none">
        <circle cx="24" cy="24" r="12" fill="#facc15" />
        <circle cx="29" cy="20" r="3" fill="white" />
        <circle cx="30" cy="20" r="1.5" fill="#111" />
        <path d="M32 24h8l-4 4z" fill="#f97316" />
        <path d="M12 22h10v4H12z" fill="#a3e635" />
      </svg>
    ),
  },
  {
    slug: "minesweeper",
    title: "Minesweeper",
    description: "Classic logic puzzle - clear board without mines",
    tags: ["5 min", "Solo", "Logic"],
    curated: ["classics"],
    icon: (
      <svg viewBox="0 0 48 48" className="w-full h-full" fill="none">
        <circle cx="24" cy="24" r="10" fill="#ef4444" />
        <line x1="24" y1="8" x2="24" y2="14" stroke="#ef4444" strokeWidth="3" strokeLinecap="round" />
        <line x1="24" y1="34" x2="24" y2="40" stroke="#ef4444" strokeWidth="3" strokeLinecap="round" />
        <line x1="8" y1="24" x2="14" y2="24" stroke="#ef4444" strokeWidth="3" strokeLinecap="round" />
        <line x1="34" y1="24" x2="40" y2="24" stroke="#ef4444" strokeWidth="3" strokeLinecap="round" />
        <circle cx="24" cy="24" r="4" fill="white" />
      </svg>
    ),
  },
  {
    slug: "pac-man",
    title: "Pac-Man",
    description: "Eat dots, dodge ghosts, grab power pellets",
    tags: ["5 min", "Solo", "Reflex"],
    curated: ["classics"],
    icon: (
      <svg viewBox="0 0 48 48" className="w-full h-full" fill="none">
        <circle cx="24" cy="24" r="18" fill="#ffe000" />
        <path d="M24 24 L42 18 A18 18 0 0 0 42 30 Z" fill="#000" />
        <circle cx="24" cy="14" r="2.5" fill="#000" />
        <circle cx="10" cy="18" r="5" fill="#ff0000" />
        <circle cx="10" cy="30" r="5" fill="#ffb8ff" />
        <circle cx="20" cy="36" r="5" fill="#00ffff" />
        <circle cx="36" cy="36" r="5" fill="#ffb852" />
      </svg>
    ),
  },
  {
    slug: "breakout",
    title: "Breakout",
    description: "Smash bricks with a bouncing ball",
    tags: ["5 min", "Solo", "Reflex"],
    curated: ["classics", "reflexes"],
    icon: (
      <svg viewBox="0 0 48 48" className="w-full h-full" fill="none">
        <rect x="4" y="4" width="12" height="5" rx="1" fill="#ef4444" />
        <rect x="18" y="4" width="12" height="5" rx="1" fill="#f59e0b" />
        <rect x="32" y="4" width="12" height="5" rx="1" fill="#22c55e" />
        <rect x="4" y="11" width="12" height="5" rx="1" fill="#3b82f6" />
        <rect x="18" y="11" width="12" height="5" rx="1" fill="#a855f7" />
        <rect x="32" y="11" width="12" height="5" rx="1" fill="#ec4899" />
        <circle cx="24" cy="30" r="3" fill="white" />
        <rect x="14" y="40" width="20" height="4" rx="2" fill="#94a3b8" />
      </svg>
    ),
  },
  {
    slug: "space-invaders",
    title: "Space Invaders",
    description: "Defend Earth from alien invaders",
    tags: ["5 min", "Solo", "Reflex"],
    curated: ["classics", "reflexes"],
    icon: (
      <svg viewBox="0 0 48 48" className="w-full h-full" fill="none">
        <rect x="8" y="16" width="8" height="8" fill="#ef4444" />
        <rect x="20" y="16" width="8" height="8" fill="#ef4444" />
        <rect x="32" y="16" width="8" height="8" fill="#ef4444" />
        <rect x="14" y="24" width="8" height="8" fill="#ef4444" />
        <rect x="26" y="24" width="8" height="8" fill="#ef4444" />
        <path d="M20 38h8l-2 4h-4z" fill="#22c55e" />
        <rect x="18" y="36" width="12" height="4" fill="#22c55e" />
        <rect x="22" y="42" width="2" height="2" fill="#facc15" />
      </svg>
    ),
  },
  {
    slug: "block-drop",
    title: "Block Drop",
    description: "Classic falling blocks puzzle",
    tags: ["5 min", "Solo", "Logic"],
    curated: ["classics"],
    icon: (
      <svg viewBox="0 0 48 48" className="w-full h-full" fill="none">
        <rect x="8" y="28" width="10" height="10" rx="1" fill="#06b6d4" />
        <rect x="18" y="28" width="10" height="10" rx="1" fill="#06b6d4" />
        <rect x="18" y="18" width="10" height="10" rx="1" fill="#06b6d4" />
        <rect x="28" y="18" width="10" height="10" rx="1" fill="#06b6d4" />
        <rect x="10" y="8" width="8" height="8" rx="1" fill="#a855f7" opacity="0.4" />
        <rect x="18" y="8" width="8" height="8" rx="1" fill="#a855f7" opacity="0.4" />
        <rect x="26" y="8" width="8" height="8" rx="1" fill="#a855f7" opacity="0.4" />
      </svg>
    ),
  },
  {
    slug: "whack-a-mole",
    title: "Whack-a-Mole",
    description: "Whack moles as fast as you can!",
    tags: ["1 min", "Solo", "Reflex"],
    curated: ["reflexes"],
    icon: (
      <svg viewBox="0 0 48 48" className="w-full h-full" fill="none">
        <ellipse cx="24" cy="36" rx="16" ry="6" fill="#44403c" />
        <circle cx="24" cy="24" r="10" fill="#a16207" />
        <circle cx="20" cy="22" r="2" fill="white" />
        <circle cx="28" cy="22" r="2" fill="white" />
        <circle cx="20" cy="22" r="1" fill="#111" />
        <circle cx="28" cy="22" r="1" fill="#111" />
        <ellipse cx="24" cy="27" rx="2" ry="1.5" fill="#92400e" />
      </svg>
    ),
  },
  {
    slug: "car-racer",
    title: "Car Racer",
    description: "Dodge traffic on the endless highway",
    tags: ["1 min", "Solo", "Reflex"],
    curated: ["reflexes"],
    icon: (
      <svg viewBox="0 0 48 48" className="w-full h-full" fill="none">
        <rect x="18" y="12" width="12" height="24" rx="3" fill="#ef4444" />
        <rect x="20" y="14" width="8" height="6" rx="1" fill="#93c5fd" />
        <circle cx="20" cy="32" r="3" fill="#374151" />
        <circle cx="28" cy="32" r="3" fill="#374151" />
        <circle cx="20" cy="16" r="3" fill="#374151" />
        <circle cx="28" cy="16" r="3" fill="#374151" />
        <line x1="12" y1="40" x2="12" y2="8" stroke="#6b7280" strokeWidth="1" strokeDasharray="4 3" />
        <line x1="36" y1="40" x2="36" y2="8" stroke="#6b7280" strokeWidth="1" strokeDasharray="4 3" />
      </svg>
    ),
  },
  {
    slug: "dino-runner",
    title: "Dino Runner",
    description: "Jump and duck in this endless runner",
    tags: ["1 min", "Solo", "Reflex"],
    curated: ["reflexes"],
    icon: (
      <svg viewBox="0 0 48 48" className="w-full h-full" fill="none">
        <rect x="20" y="10" width="14" height="12" rx="2" fill="#d1d5db" />
        <rect x="20" y="22" width="8" height="10" fill="#d1d5db" />
        <rect x="16" y="26" width="4" height="6" fill="#d1d5db" />
        <rect x="22" y="32" width="4" height="6" fill="#d1d5db" />
        <rect x="28" y="32" width="4" height="6" fill="#d1d5db" />
        <circle cx="30" cy="14" r="2" fill="#111" />
        <line x1="8" y1="38" x2="42" y2="38" stroke="#6b7280" strokeWidth="2" />
      </svg>
    ),
  },
  {
    slug: "frogger",
    title: "Frogger",
    description: "Cross roads and rivers to reach home",
    tags: ["5 min", "Solo", "Reflex"],
    curated: ["classics", "reflexes"],
    icon: (
      <svg viewBox="0 0 48 48" className="w-full h-full" fill="none">
        <ellipse cx="24" cy="28" rx="12" ry="10" fill="#00cc44" />
        <circle cx="17" cy="20" r="5" fill="#00cc44" />
        <circle cx="31" cy="20" r="5" fill="#00cc44" />
        <circle cx="17" cy="19" r="3" fill="#fff" />
        <circle cx="31" cy="19" r="3" fill="#fff" />
        <circle cx="18" cy="19" r="1.5" fill="#000" />
        <circle cx="32" cy="19" r="1.5" fill="#000" />
        <path d="M12 34 L6 38 M36 34 L42 38" stroke="#00cc44" strokeWidth="3" strokeLinecap="round" />
        <path d="M12 30 L6 26 M36 30 L42 26" stroke="#00cc44" strokeWidth="3" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    slug: "bubble-shooter",
    title: "Bubble Shooter",
    description: "Match 3+ bubbles to pop them",
    tags: ["5 min", "Solo", "Reflex"],
    curated: ["reflexes"],
    icon: (
      <svg viewBox="0 0 48 48" className="w-full h-full" fill="none">
        <circle cx="14" cy="12" r="6" fill="#ef4444" opacity="0.8" />
        <circle cx="24" cy="12" r="6" fill="#3b82f6" opacity="0.8" />
        <circle cx="34" cy="12" r="6" fill="#22c55e" opacity="0.8" />
        <circle cx="19" cy="20" r="6" fill="#a855f7" opacity="0.8" />
        <circle cx="29" cy="20" r="6" fill="#f59e0b" opacity="0.8" />
        <circle cx="24" cy="28" r="6" fill="#ec4899" opacity="0.8" />
        <path d="M24 38L28 42L20 42Z" fill="#6b7280" />
        <circle cx="24" cy="38" r="3" fill="#ef4444" />
      </svg>
    ),
  },
  {
    slug: "asteroids",
    title: "Asteroids",
    description: "Shoot asteroids before they get you",
    tags: ["5 min", "Solo", "Reflex"],
    curated: ["reflexes"],
    icon: (
      <svg viewBox="0 0 48 48" className="w-full h-full" fill="none">
        <polygon points="24,4 18,36 6,30 12,30 2,42" fill="none" stroke="#22d3ee" strokeWidth="2" strokeLinejoin="round" />
        <polygon points="36,10 28,18 22,8 30,14 34,4 40,14 48,10 42,20 48,28 38,22 36,32 30,22 20,26 28,18" fill="none" stroke="#9ca3af" strokeWidth="1.5" strokeLinejoin="round" />
        <circle cx="40" cy="36" r="6" fill="none" stroke="#9ca3af" strokeWidth="1.5" />
      </svg>
    ),
  },
  {
    slug: "tower-builder",
    title: "Tower Builder",
    description: "Stack swinging blocks to build high",
    tags: ["1 min", "Solo", "Reflex"],
    curated: ["reflexes"],
    icon: (
      <svg viewBox="0 0 48 48" className="w-full h-full" fill="none">
        <rect x="10" y="34" width="28" height="6" rx="1" fill="#fb7185" />
        <rect x="12" y="28" width="24" height="6" rx="1" fill="#f472b6" />
        <rect x="14" y="22" width="20" height="6" rx="1" fill="#e879f9" />
        <rect x="16" y="16" width="16" height="6" rx="1" fill="#c084fc" />
        <rect x="18" y="10" width="12" height="6" rx="1" fill="#a78bfa" opacity="0.6" />
        <line x1="24" y1="4" x2="24" y2="10" stroke="#a78bfa" strokeWidth="1" strokeDasharray="2 2" />
      </svg>
    ),
  },
  {
    slug: "maze",
    title: "Maze Runner",
    description: "Navigate through generated mazes to the goal",
    tags: ["5 min", "Solo", "Logic"],
    icon: (
      <svg viewBox="0 0 48 48" className="w-full h-full" fill="none">
        <rect x="4" y="4" width="40" height="40" rx="2" fill="#1f2937" />
        <path d="M8 8h32v8H32v8h8v8H32v8h8v-8" stroke="#a855f7" strokeWidth="3" fill="none" />
        <path d="M8 16h8v8H8v8h8v8" stroke="#a855f7" strokeWidth="3" fill="none" />
        <circle cx="12" cy="12" r="3" fill="#3b82f6" />
        <circle cx="36" cy="36" r="3" fill="#22c55e" />
      </svg>
    ),
  },
  {
    slug: "chess",
    title: "Chess",
    description: "Play chess against the computer",
    tags: ["15+ min", "Solo", "Logic"],
    curated: ["classics"],
    icon: (
      <svg viewBox="0 0 48 48" className="w-full h-full" fill="none">
        <rect x="4" y="38" width="40" height="6" rx="2" fill="#f0d9b5" />
        <rect x="8" y="32" width="32" height="6" rx="1" fill="#f0d9b5" />
        <rect x="18" y="14" width="12" height="18" rx="2" fill="#f0d9b5" />
        <rect x="14" y="26" width="20" height="6" rx="1" fill="#f0d9b5" />
        <circle cx="24" cy="10" r="6" fill="#f0d9b5" />
        <rect x="20" y="4" width="8" height="4" rx="1" fill="#f0d9b5" />
        <rect x="22" y="2" width="4" height="4" rx="1" fill="#f0d9b5" />
      </svg>
    ),
  },
  {
    slug: "checkers",
    title: "Checkers",
    description: "Classic board game with kings and multi-jumps",
    tags: ["15+ min", "2P", "Logic"],
    curated: ["classics"],
    icon: (
      <svg viewBox="0 0 48 48" className="w-full h-full" fill="none">
        <rect x="4" y="4" width="10" height="10" fill="#92400e" />
        <rect x="14" y="4" width="10" height="10" fill="#fef3c7" />
        <rect x="24" y="4" width="10" height="10" fill="#92400e" />
        <rect x="34" y="4" width="10" height="10" fill="#fef3c7" />
        <rect x="4" y="14" width="10" height="10" fill="#fef3c7" />
        <rect x="14" y="14" width="10" height="10" fill="#92400e" />
        <rect x="24" y="14" width="10" height="10" fill="#fef3c7" />
        <rect x="34" y="14" width="10" height="10" fill="#92400e" />
        <circle cx="19" cy="9" r="4" fill="#ef4444" />
        <circle cx="39" cy="19" r="4" fill="#1f2937" />
      </svg>
    ),
  },
  {
    slug: "reversi",
    title: "Reversi",
    description: "Flip pieces and dominate the board",
    tags: ["15+ min", "2P", "Logic"],
    icon: (
      <svg viewBox="0 0 48 48" className="w-full h-full" fill="none">
        <rect x="4" y="4" width="40" height="40" rx="4" fill="#166534" />
        <circle cx="16" cy="16" r="8" fill="#111" />
        <circle cx="32" cy="16" r="8" fill="#fff" />
        <circle cx="16" cy="32" r="8" fill="#fff" />
        <circle cx="32" cy="32" r="8" fill="#111" />
      </svg>
    ),
  },
  {
    slug: "sudoku",
    title: "Sudoku",
    description: "9x9 number puzzle with 3 difficulty levels",
    tags: ["15+ min", "Solo", "Logic"],
    curated: ["classics"],
    icon: (
      <svg viewBox="0 0 48 48" className="w-full h-full" fill="none">
        <rect x="4" y="4" width="12" height="12" rx="1" stroke="#818cf8" strokeWidth="1.5" fill="none" />
        <rect x="18" y="4" width="12" height="12" rx="1" stroke="#818cf8" strokeWidth="1.5" fill="none" />
        <rect x="32" y="4" width="12" height="12" rx="1" stroke="#818cf8" strokeWidth="1.5" fill="none" />
        <rect x="4" y="18" width="12" height="12" rx="1" stroke="#818cf8" strokeWidth="1.5" fill="none" />
        <rect x="18" y="18" width="12" height="12" rx="1" stroke="#818cf8" strokeWidth="1.5" fill="none" />
        <rect x="32" y="18" width="12" height="12" rx="1" stroke="#818cf8" strokeWidth="1.5" fill="none" />
        <text x="10" y="14" textAnchor="middle" fill="#818cf8" fontSize="10" fontWeight="bold">5</text>
        <text x="24" y="14" textAnchor="middle" fill="#818cf8" fontSize="10" fontWeight="bold">3</text>
        <text x="38" y="28" textAnchor="middle" fill="#818cf8" fontSize="10" fontWeight="bold">9</text>
      </svg>
    ),
  },
  {
    slug: "tic-tac-toe",
    title: "Tic-Tac-Toe",
    description: "Classic X and O - play vs AI or a friend",
    tags: ["1 min", "2P", "Logic"],
    curated: ["classics"],
    icon: (
      <svg viewBox="0 0 48 48" className="w-full h-full" fill="none">
        <line x1="16" y1="8" x2="16" y2="40" stroke="#374151" strokeWidth="2" />
        <line x1="32" y1="8" x2="32" y2="40" stroke="#374151" strokeWidth="2" />
        <line x1="8" y1="16" x2="40" y2="16" stroke="#374151" strokeWidth="2" />
        <line x1="8" y1="32" x2="40" y2="32" stroke="#374151" strokeWidth="2" />
        <line x1="10" y1="10" x2="14" y2="14" stroke="#22d3ee" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="14" y1="10" x2="10" y2="14" stroke="#22d3ee" strokeWidth="2.5" strokeLinecap="round" />
        <circle cx="36" cy="12" r="3" stroke="#fb7185" strokeWidth="2" fill="none" />
        <circle cx="12" cy="36" r="3" stroke="#fb7185" strokeWidth="2" fill="none" />
      </svg>
    ),
  },
  {
    slug: "connect4",
    title: "Connect 4",
    description: "Drop discs to connect four in a row",
    tags: ["5 min", "2P", "Logic"],
    curated: ["classics"],
    icon: (
      <svg viewBox="0 0 48 48" className="w-full h-full" fill="none">
        <rect x="4" y="10" width="40" height="32" rx="3" fill="#3b82f6" />
        <circle cx="14" cy="20" r="4" fill="white" />
        <circle cx="24" cy="20" r="4" fill="white" />
        <circle cx="34" cy="20" r="4" fill="#ef4444" />
        <circle cx="14" cy="30" r="4" fill="#facc15" />
        <circle cx="24" cy="30" r="4" fill="#ef4444" />
        <circle cx="34" cy="30" r="4" fill="#facc15" />
      </svg>
    ),
  },
  {
    slug: "memory",
    title: "Memory Match",
    description: "Flip cards and find matching pairs",
    tags: ["5 min", "Solo", "Memory"],
    curated: ["classics"],
    icon: (
      <svg viewBox="0 0 48 48" className="w-full h-full" fill="none">
        <rect x="6" y="6" width="14" height="18" rx="2" fill="#a855f7" />
        <rect x="28" y="6" width="14" height="18" rx="2" fill="#ec4899" />
        <rect x="6" y="28" width="14" height="14" rx="2" fill="#ec4899" />
        <rect x="28" y="28" width="14" height="14" rx="2" fill="#a855f7" />
        <text x="13" y="19" textAnchor="middle" fill="white" fontSize="12" fontWeight="bold">?</text>
        <text x="35" y="19" textAnchor="middle" fill="white" fontSize="12" fontWeight="bold">?</text>
      </svg>
    ),
  },
  {
    slug: "simon",
    title: "Simon Says",
    description: "Repeat the color sequence pattern",
    tags: ["5 min", "Solo", "Memory"],
    icon: (
      <svg viewBox="0 0 48 48" className="w-full h-full" fill="none">
        <circle cx="24" cy="24" r="20" fill="#1f2937" />
        <path d="M24 24L24 4A20 20 0 0 1 44 24Z" fill="#ef4444" />
        <path d="M24 24L44 24A20 20 0 0 1 24 44Z" fill="#3b82f6" />
        <path d="M24 24L24 44A20 20 0 0 1 4 24Z" fill="#22c55e" />
        <path d="M24 24L4 24A20 20 0 0 1 24 4Z" fill="#facc15" />
        <circle cx="24" cy="24" r="6" fill="#111" />
      </svg>
    ),
  },
  {
    slug: "sliding-puzzle",
    title: "Sliding Puzzle",
    description: "Arrange tiles 1-15 in order",
    tags: ["5 min", "Solo", "Logic", "Memory"],
    icon: (
      <svg viewBox="0 0 48 48" className="w-full h-full" fill="none">
        <rect x="4" y="4" width="40" height="40" rx="2" fill="#1f2937" stroke="#22c55e" strokeWidth="2" />
        <rect x="8" y="8" width="8" height="8" rx="1" fill="#22c55e" />
        <rect x="18" y="8" width="8" height="8" rx="1" fill="#22c55e" />
        <rect x="28" y="8" width="8" height="8" rx="1" fill="#22c55e" />
        <rect x="8" y="18" width="8" height="8" rx="1" fill="#22c55e" />
        <rect x="18" y="18" width="8" height="8" rx="1" fill="#22c55e" />
        <rect x="28" y="18" width="8" height="8" rx="1" fill="#22c55e" />
        <text x="12" y="14" textAnchor="middle" fill="white" fontSize="7" fontWeight="bold">1</text>
        <text x="22" y="14" textAnchor="middle" fill="white" fontSize="7" fontWeight="bold">2</text>
        <text x="32" y="14" textAnchor="middle" fill="white" fontSize="7" fontWeight="bold">3</text>
      </svg>
    ),
  },
  {
    slug: "solitaire",
    title: "Solitaire",
    description: "Klondike card game - build foundations",
    tags: ["15+ min", "Solo", "Logic"],
    curated: ["classics"],
    icon: (
      <svg viewBox="0 0 48 48" className="w-full h-full" fill="none">
        <rect x="8" y="12" width="12" height="18" rx="2" fill="white" stroke="#3b82f6" strokeWidth="1.5" />
        <rect x="18" y="16" width="12" height="18" rx="2" fill="white" stroke="#3b82f6" strokeWidth="1.5" />
        <rect x="28" y="20" width="12" height="18" rx="2" fill="white" stroke="#3b82f6" strokeWidth="1.5" />
        <text x="14" y="24" textAnchor="middle" fill="#ef4444" fontSize="10" fontWeight="bold">A</text>
        <text x="24" y="28" textAnchor="middle" fill="#111" fontSize="10" fontWeight="bold">K</text>
        <text x="34" y="32" textAnchor="middle" fill="#ef4444" fontSize="10" fontWeight="bold">Q</text>
      </svg>
    ),
  },
  {
    slug: "pong",
    title: "Pong",
    description: "Classic paddle game vs AI",
    tags: ["5 min", "2P", "Reflex"],
    curated: ["classics"],
    icon: (
      <svg viewBox="0 0 48 48" className="w-full h-full" fill="none">
        <rect x="4" y="8" width="40" height="32" rx="2" fill="#0d6b4e" stroke="#14b8a6" strokeWidth="1.5" />
        <line x1="24" y1="8" x2="24" y2="40" stroke="#fff" strokeWidth="1.5" />
        <rect x="8" y="16" width="4" height="16" rx="2" fill="#3b82f6" />
        <rect x="36" y="16" width="4" height="16" rx="2" fill="#ef4444" />
        <circle cx="20" cy="24" r="3" fill="#facc15" />
      </svg>
    ),
  },
  {
    slug: "hangman",
    title: "Hangman",
    description: "Classic word guessing with 200+ words",
    tags: ["5 min", "Solo", "Word"],
    curated: ["classics"],
    icon: (
      <svg viewBox="0 0 48 48" className="w-full h-full" fill="none">
        <line x1="8" y1="42" x2="28" y2="42" stroke="#94a3b8" strokeWidth="2" />
        <line x1="18" y1="42" x2="18" y2="8" stroke="#94a3b8" strokeWidth="2" />
        <line x1="18" y1="8" x2="34" y2="8" stroke="#94a3b8" strokeWidth="2" />
        <line x1="34" y1="8" x2="34" y2="14" stroke="#94a3b8" strokeWidth="2" />
        <circle cx="34" cy="18" r="4" stroke="white" strokeWidth="2" />
        <line x1="34" y1="22" x2="34" y2="32" stroke="white" strokeWidth="2" />
        <line x1="34" y1="25" x2="28" y2="28" stroke="white" strokeWidth="2" />
        <line x1="34" y1="25" x2="40" y2="28" stroke="white" strokeWidth="2" />
      </svg>
    ),
  },
  {
    slug: "wordle",
    title: "Word Guess",
    description: "Wordle-style - guess 5-letter word in 6 tries",
    tags: ["5 min", "Solo", "Word"],
    curated: ["classics"],
    icon: (
      <svg viewBox="0 0 48 48" className="w-full h-full" fill="none">
        <rect x="4" y="14" width="8" height="8" rx="1" fill="#22c55e" />
        <rect x="14" y="14" width="8" height="8" rx="1" fill="#eab308" />
        <rect x="24" y="14" width="8" height="8" rx="1" fill="#4b5563" />
        <rect x="34" y="14" width="8" height="8" rx="1" fill="#22c55e" />
        <rect x="4" y="26" width="8" height="8" rx="1" fill="#4b5563" />
        <rect x="14" y="26" width="8" height="8" rx="1" fill="#22c55e" />
        <rect x="24" y="26" width="8" height="8" rx="1" fill="#4b5563" />
        <rect x="34" y="26" width="8" height="8" rx="1" fill="#eab308" />
      </svg>
    ),
  },
  {
    slug: "word-builder",
    title: "Word Builder",
    description: "How many words can you make from one word?",
    tags: ["5 min", "Solo", "Word"],
    icon: (
      <svg viewBox="0 0 48 48" className="w-full h-full" fill="none">
        <rect x="4" y="16" width="10" height="10" rx="2" fill="#10b981" />
        <rect x="16" y="16" width="10" height="10" rx="2" fill="#14b8a6" />
        <rect x="28" y="16" width="10" height="10" rx="2" fill="#06b6d4" />
        <rect x="40" y="16" width="4" height="10" rx="1" fill="#0891b2" />
        <text x="9" y="24" textAnchor="middle" fill="white" fontSize="8" fontWeight="bold">W</text>
        <text x="21" y="24" textAnchor="middle" fill="white" fontSize="8" fontWeight="bold">O</text>
        <text x="33" y="24" textAnchor="middle" fill="white" fontSize="8" fontWeight="bold">R</text>
        <text x="42" y="24" textAnchor="middle" fill="white" fontSize="8" fontWeight="bold">D</text>
        <path d="M10 30 Q24 34 38 30" stroke="#22c55e" strokeWidth="2" fill="none" opacity="0.6" />
      </svg>
    ),
  },
  {
    slug: "crossword",
    title: "Crossword",
    description: "Fill in the crossword puzzle with clues",
    tags: ["15+ min", "Solo", "Word"],
    icon: (
      <svg viewBox="0 0 48 48" className="w-full h-full" fill="none">
        <rect x="6" y="6" width="10" height="10" fill="white" stroke="#333" strokeWidth="1" />
        <rect x="16" y="6" width="10" height="10" fill="white" stroke="#333" strokeWidth="1" />
        <rect x="26" y="6" width="10" height="10" fill="#333" />
        <rect x="6" y="16" width="10" height="10" fill="white" stroke="#333" strokeWidth="1" />
        <rect x="16" y="16" width="10" height="10" fill="white" stroke="#333" strokeWidth="1" />
        <rect x="26" y="16" width="10" height="10" fill="white" stroke="#333" strokeWidth="1" />
        <rect x="6" y="26" width="10" height="10" fill="#333" />
        <rect x="16" y="26" width="10" height="10" fill="white" stroke="#333" strokeWidth="1" />
        <rect x="26" y="26" width="10" height="10" fill="white" stroke="#333" strokeWidth="1" />
        <text x="11" y="14" textAnchor="middle" fill="#333" fontSize="8" fontWeight="bold">A</text>
        <text x="21" y="14" textAnchor="middle" fill="#333" fontSize="8" fontWeight="bold">B</text>
      </svg>
    ),
  },
  {
    slug: "word-search",
    title: "Word Search",
    description: "Find hidden words in a letter grid",
    tags: ["5 min", "Solo", "Word"],
    icon: (
      <svg viewBox="0 0 48 48" className="w-full h-full" fill="none">
        <rect x="6" y="6" width="36" height="36" rx="2" fill="#1f2937" stroke="#22c55e" strokeWidth="2" />
        <text x="14" y="20" fill="#6b7280" fontSize="10" fontWeight="bold">A</text>
        <text x="22" y="20" fill="#22c55e" fontSize="10" fontWeight="bold">C</text>
        <text x="30" y="20" fill="#6b7280" fontSize="10" fontWeight="bold">B</text>
        <text x="14" y="28" fill="#6b7280" fontSize="10" fontWeight="bold">X</text>
        <text x="22" y="28" fill="#22c55e" fontSize="10" fontWeight="bold">A</text>
        <text x="30" y="28" fill="#6b7280" fontSize="10" fontWeight="bold">F</text>
        <text x="14" y="36" fill="#6b7280" fontSize="10" fontWeight="bold">Q</text>
        <text x="22" y="36" fill="#22c55e" fontSize="10" fontWeight="bold">T</text>
        <text x="30" y="36" fill="#6b7280" fontSize="10" fontWeight="bold">M</text>
        <line x1="22" y1="14" x2="22" y2="38" stroke="#22c55e" strokeWidth="2" opacity="0.5" />
      </svg>
    ),
  },
  {
    slug: "typing-race",
    title: "Typing Race",
    description: "Type paragraphs as fast and accurately as you can",
    tags: ["5 min", "Solo", "Word"],
    icon: (
      <svg viewBox="0 0 48 48" className="w-full h-full" fill="none">
        <rect x="4" y="14" width="40" height="24" rx="3" stroke="white" strokeWidth="2" opacity="0.5" />
        <rect x="8" y="18" width="6" height="5" rx="1" fill="white" opacity="0.8" />
        <rect x="16" y="18" width="6" height="5" rx="1" fill="#22c55e" />
        <rect x="24" y="18" width="6" height="5" rx="1" fill="white" opacity="0.4" />
        <rect x="32" y="18" width="6" height="5" rx="1" fill="white" opacity="0.4" />
        <rect x="12" y="27" width="24" height="5" rx="1" fill="white" opacity="0.3" />
        <text x="24" y="10" textAnchor="middle" fill="#22c55e" fontSize="8" fontWeight="bold">WPM</text>
      </svg>
    ),
  },
  {
    slug: "music-trivia",
    title: "Music Trivia",
    description: "Song quiz and timeline challenge",
    tags: ["15+ min", "Solo", "Word"],
    icon: (
      <svg viewBox="0 0 48 48" className="w-full h-full" fill="none">
        <circle cx="24" cy="24" r="18" fill="#7c3aed" opacity="0.3" />
        <circle cx="24" cy="24" r="12" fill="#a855f7" />
        <circle cx="24" cy="24" r="4" fill="white" />
        <circle cx="24" cy="24" r="1.5" fill="#7c3aed" />
        <rect x="22" y="6" width="4" height="8" rx="2" fill="#ec4899" />
        <text x="24" y="40" textAnchor="middle" fill="#e879f9" fontSize="7" fontWeight="bold">TRIVIA</text>
      </svg>
    ),
  },
  {
    slug: "soccer",
    title: "Penalty Kicks",
    description: "Aim and shoot past the goalkeeper",
    tags: ["1 min", "Solo", "Reflex"],
    icon: (
      <svg viewBox="0 0 48 48" className="w-full h-full" fill="none">
        <circle cx="24" cy="24" r="14" fill="white" stroke="#222" strokeWidth="1.5" />
        <path d="M24 10L28 18H20L24 10Z" fill="#333" />
        <path d="M24 38L20 30H28L24 38Z" fill="#333" />
        <path d="M10 24L18 20V28L10 24Z" fill="#333" />
        <path d="M38 24L30 28V20L38 24Z" fill="#333" />
        <circle cx="24" cy="24" r="4" fill="#333" />
        <rect x="20" y="40" width="8" height="4" rx="1" fill="#22c55e" />
      </svg>
    ),
  },
  {
    slug: "voxel",
    title: "Voxel Builder",
    description: "Build with blocks in 3D isometric view",
    tags: ["15+ min", "Solo"],
    icon: (
      <svg viewBox="0 0 48 48" className="w-full h-full" fill="none">
        <path d="M24 8L40 18V34L24 44L8 34V18L24 8Z" fill="#2dd4bf" opacity="0.3" />
        <path d="M24 8L40 18L24 28L8 18L24 8Z" fill="#14b8a6" />
        <path d="M24 28V44L8 34V18L24 28Z" fill="#0d9488" />
        <path d="M24 28V44L40 34V18L24 28Z" fill="#0f766e" />
      </svg>
    ),
  },
];

export const FILTER_TAGS: FilterTag[] = ["1 min", "5 min", "15+ min", "Solo", "2P", "Word", "Reflex", "Memory", "Logic"];

export const CURATED_ROWS: { id: CuratedGroup; label: string }[] = [
  { id: "classics", label: "Classics" },
  { id: "reflexes", label: "Quick reflexes" },
];
