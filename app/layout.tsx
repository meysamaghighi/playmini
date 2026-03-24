import type { Metadata } from "next";
import Link from "next/link";
import MobileNav from "./components/MobileNav";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://playmini.fun"),
  title: "PlayMini - Free Browser Games | 2048, Snake & More",
  description:
    "Free online mini games: 2048, Snake, and more classic arcade & puzzle games. No download, no sign-up. Play instantly in your browser.",
  openGraph: {
    title: "PlayMini - Free Browser Games",
    description:
      "Free online mini games you can play instantly. 2048, Snake, and more classics. No download required.",
    type: "website",
    siteName: "PlayMini",
  },
};

const navLinks = [
  { href: "/2048", label: "2048" },
  { href: "/snake", label: "Snake" },
  { href: "/minesweeper", label: "Minesweeper" },
  { href: "/memory", label: "Memory" },
  { href: "/whack-a-mole", label: "Whack-a-Mole" },
  { href: "/tic-tac-toe", label: "Tic-Tac-Toe" },
  { href: "/flappy", label: "Flappy" },
  { href: "/block-drop", label: "Block Drop" },
  { href: "/wordle", label: "Word Guess" },
  { href: "/dino-runner", label: "Dino Runner" },
  { href: "/sudoku", label: "Sudoku" },
  { href: "/voxel", label: "Voxel Builder" },
  { href: "/car-racer", label: "Car Racer" },
  { href: "/tower-builder", label: "Tower Builder" },
  { href: "/soccer", label: "Penalty Kicks" },
  { href: "/table-tennis", label: "Table Tennis" },
  { href: "/music-trivia", label: "Music Trivia" },
  { href: "/connect4", label: "Connect 4" },
  { href: "/hangman", label: "Hangman" },
  { href: "/crossword", label: "Crossword" },
  { href: "/checkers", label: "Checkers" },
  { href: "/breakout", label: "Breakout" },
  { href: "/typing-race", label: "Typing Race" },
  { href: "/word-search", label: "Word Search" },
  { href: "/maze", label: "Maze" },
  { href: "/space-invaders", label: "Space Invaders" },
  { href: "/bubble-shooter", label: "Bubble Shooter" },
  { href: "/simon", label: "Simon Says" },
  { href: "/sliding-puzzle", label: "Sliding Puzzle" },
  { href: "/solitaire", label: "Solitaire" },
  { href: "/word-builder", label: "Word Builder" },
];

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-65D21P7J5P"></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','G-65D21P7J5P');`,
          }}
        />
        <meta
          name="google-site-verification"
          content="ORYrIGzzyK2TBQTM6OgzsFisZceq4rBIRl4HZXMzQ48"
        />
        <meta
          name="google-adsense-account"
          content="ca-pub-2621005924235240"
        />
      </head>
      <body className="bg-gray-950 text-white min-h-screen font-sans antialiased">
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white text-center py-2 px-4">
          <p className="text-xs sm:text-sm font-medium">
            BMW is Best! <span className="text-gray-200">P.S. My classmate said this not me!</span>
          </p>
        </div>
        <nav className="border-b border-gray-800 sticky top-0 z-50 bg-gray-950/90 backdrop-blur">
          <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
            <Link href="/" className="font-black text-lg text-white">
              PlayMini
            </Link>
            <div className="hidden sm:flex items-center gap-4">
              {navLinks.slice(0, 6).map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm text-gray-400 hover:text-white transition-colors"
                >
                  {link.label}
                </Link>
              ))}
              <Link
                href="/"
                className="text-sm text-blue-400 hover:text-blue-300 transition-colors font-medium"
              >
                All Games
              </Link>
            </div>
            <MobileNav links={navLinks} />
          </div>
        </nav>

        {children}

        <footer className="border-t border-gray-800 mt-16">
          <div className="max-w-4xl mx-auto px-4 py-8 text-center">
            <p className="text-xs text-gray-500">Free browser games. No download, no sign-up required.</p>
            <div className="mt-4">
              <p className="text-sm text-gray-400 mb-2">Check out our other sites:</p>
              <div className="flex flex-wrap justify-center gap-3">
                <Link href="https://cashcalcs.com" className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 rounded-full text-sm text-gray-200 transition-colors">CashCalcs</Link>
                <Link href="https://benchmybrain.com" className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 rounded-full text-sm text-gray-200 transition-colors">BenchMyBrain</Link>
                <Link href="https://doodlelab.fun" className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 rounded-full text-sm text-gray-200 transition-colors">DoodleLab</Link>
                <Link href="/" className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 rounded-full text-sm text-gray-200 transition-colors">PlayMini</Link>
              </div>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
