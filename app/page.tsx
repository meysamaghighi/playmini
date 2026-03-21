import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "PlayMini - Free Browser Games | 2048, Snake & More",
  description:
    "Free online mini games you can play instantly in your browser. 2048, Snake, and more classic arcade & puzzle games. No download, no sign-up required.",
  keywords: [
    "free online games",
    "browser games",
    "2048",
    "snake game",
    "mini games",
    "no download games",
    "play online free",
    "classic games",
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
        <path
          d="M8 24h8v-8h8v8h8v8h8"
          stroke="#22c55e"
          strokeWidth="6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="40" cy="32" r="3" fill="#ef4444" />
      </svg>
    ),
  },
];

export default function Home() {
  return (
    <main className="max-w-2xl mx-auto px-4 pt-12 pb-12">
      <div className="text-center mb-12">
        <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 mb-4">
          PlayMini
        </h1>
        <p className="text-gray-400 text-lg">
          Free browser games. No download, no sign-up. Just play.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
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
