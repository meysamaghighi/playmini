import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "PlayMini - Free Browser Games | 2048, Snake, Minesweeper & More",
  description:
    "Free online mini games you can play instantly. 2048, Snake, Minesweeper, Memory Match, Whack-a-Mole, Tic-Tac-Toe and more. No download, no sign-up.",
  keywords: [
    "free online games",
    "browser games",
    "2048",
    "snake game",
    "minesweeper",
    "memory match",
    "whack a mole",
    "tic tac toe",
    "mini games",
    "no download games",
    "classic games",
    "sudoku",
    "voxel builder",
    "car racer",
    "tower builder",
    "soccer game",
    "penalty kicks",
    "table tennis",
    "pong game",
  ],
};

const games = [
  {
    href: "/2048",
    title: "2048",
    description: "Slide and merge tiles to reach 2048",
    color: "from-amber-500 to-orange-600",
    icon: (
      <svg viewBox="0 0 48 48" className="w-12 h-12" fill="none">
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
    href: "/snake",
    title: "Snake",
    description: "Eat food, grow longer, don't hit the walls",
    color: "from-green-500 to-emerald-600",
    icon: (
      <svg viewBox="0 0 48 48" className="w-12 h-12" fill="none">
        <path d="M8 24h8v-8h8v8h8v8h8" stroke="#22c55e" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="40" cy="32" r="3" fill="#ef4444" />
      </svg>
    ),
  },
  {
    href: "/minesweeper",
    title: "Minesweeper",
    description: "Find all the mines without detonating any",
    color: "from-blue-500 to-cyan-600",
    icon: (
      <svg viewBox="0 0 48 48" className="w-12 h-12" fill="none">
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
    href: "/memory",
    title: "Memory Match",
    description: "Flip cards and find matching pairs",
    color: "from-purple-500 to-pink-600",
    icon: (
      <svg viewBox="0 0 48 48" className="w-12 h-12" fill="none">
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
    href: "/whack-a-mole",
    title: "Whack-a-Mole",
    description: "Whack moles as fast as you can!",
    color: "from-yellow-500 to-amber-600",
    icon: (
      <svg viewBox="0 0 48 48" className="w-12 h-12" fill="none">
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
    href: "/tic-tac-toe",
    title: "Tic-Tac-Toe",
    description: "Classic X and O - play vs AI or a friend",
    color: "from-cyan-500 to-blue-600",
    icon: (
      <svg viewBox="0 0 48 48" className="w-12 h-12" fill="none">
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
    href: "/flappy",
    title: "Flappy Bird",
    description: "Tap to flap through the pipes",
    color: "from-sky-400 to-blue-500",
    icon: (
      <svg viewBox="0 0 48 48" className="w-12 h-12" fill="none">
        <circle cx="24" cy="24" r="12" fill="#facc15" />
        <circle cx="29" cy="20" r="3" fill="white" />
        <circle cx="30" cy="20" r="1.5" fill="#111" />
        <path d="M32 24h8l-4 4z" fill="#f97316" />
        <path d="M12 22h10v4H12z" fill="#a3e635" />
      </svg>
    ),
  },
  {
    href: "/block-drop",
    title: "Block Drop",
    description: "Classic falling blocks puzzle",
    color: "from-violet-500 to-purple-600",
    icon: (
      <svg viewBox="0 0 48 48" className="w-12 h-12" fill="none">
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
    href: "/wordle",
    title: "Word Guess",
    description: "Guess the 5-letter word in 6 tries",
    color: "from-emerald-500 to-teal-600",
    icon: (
      <svg viewBox="0 0 48 48" className="w-12 h-12" fill="none">
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
    href: "/dino-runner",
    title: "Dino Runner",
    description: "Jump and duck in this endless runner",
    color: "from-lime-500 to-green-600",
    icon: (
      <svg viewBox="0 0 48 48" className="w-12 h-12" fill="none">
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
    href: "/sudoku",
    title: "Sudoku",
    description: "Classic 9x9 logic number puzzle",
    color: "from-indigo-500 to-blue-600",
    icon: (
      <svg viewBox="0 0 48 48" className="w-12 h-12" fill="none">
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
    href: "/voxel",
    title: "Voxel Builder",
    description: "Build with blocks in 3D isometric view",
    color: "from-green-500 to-teal-600",
    icon: (
      <svg viewBox="0 0 48 48" className="w-12 h-12" fill="none">
        <path d="M24 8L40 18V34L24 44L8 34V18L24 8Z" fill="#2dd4bf" opacity="0.3" />
        <path d="M24 8L40 18L24 28L8 18L24 8Z" fill="#14b8a6" />
        <path d="M24 28V44L8 34V18L24 28Z" fill="#0d9488" />
        <path d="M24 28V44L40 34V18L24 28Z" fill="#0f766e" />
      </svg>
    ),
  },
  {
    href: "/car-racer",
    title: "Car Racer",
    description: "Dodge traffic on the endless highway",
    color: "from-red-500 to-orange-600",
    icon: (
      <svg viewBox="0 0 48 48" className="w-12 h-12" fill="none">
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
    href: "/tower-builder",
    title: "Tower Builder",
    description: "Stack swinging blocks to build high",
    color: "from-pink-500 to-rose-600",
    icon: (
      <svg viewBox="0 0 48 48" className="w-12 h-12" fill="none">
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
    href: "/soccer",
    title: "Penalty Kicks",
    description: "Aim and shoot past the goalkeeper",
    color: "from-green-500 to-lime-600",
    icon: (
      <svg viewBox="0 0 48 48" className="w-12 h-12" fill="none">
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
    href: "/table-tennis",
    title: "Table Tennis",
    description: "Classic paddle game vs AI",
    color: "from-teal-500 to-cyan-600",
    icon: (
      <svg viewBox="0 0 48 48" className="w-12 h-12" fill="none">
        <rect x="4" y="8" width="40" height="32" rx="2" fill="#0d6b4e" stroke="#14b8a6" strokeWidth="1.5" />
        <line x1="24" y1="8" x2="24" y2="40" stroke="#fff" strokeWidth="1.5" />
        <rect x="8" y="16" width="4" height="16" rx="2" fill="#3b82f6" />
        <rect x="36" y="16" width="4" height="16" rx="2" fill="#ef4444" />
        <circle cx="20" cy="24" r="3" fill="#facc15" />
      </svg>
    ),
  },
];

export default function Home() {
  return (
    <main className="max-w-3xl mx-auto px-4 pt-12 pb-12">
      <div className="text-center mb-12">
        <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 mb-4">
          PlayMini
        </h1>
        <p className="text-gray-400 text-lg">
          Free browser games. No download, no sign-up. Just play.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {games.map((game) => (
          <Link
            key={game.href}
            href={game.href}
            className="group bg-gray-900 rounded-2xl p-6 border border-gray-800 hover:border-gray-700 transition-all hover:scale-[1.02]"
          >
            <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${game.color} flex items-center justify-center mb-4`}>
              {game.icon}
            </div>
            <h2 className="text-xl font-bold text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-blue-400 group-hover:to-purple-400 transition-all">
              {game.title}
            </h2>
            <p className="text-gray-400 text-sm mt-1">{game.description}</p>
          </Link>
        ))}
      </div>

      <div className="mt-12 text-center text-sm text-gray-500">
        <p>More games coming soon!</p>
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: "PlayMini",
            url: "https://playmini.fun",
            description: "Free online mini games you can play instantly in your browser.",
          }),
        }}
      />
    </main>
  );
}
