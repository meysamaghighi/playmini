import { Metadata } from 'next';
import TicTacToe from '../components/TicTacToe';
import MoreGames from '../components/MoreGames';

export const metadata: Metadata = {
  title: 'Play Tic-Tac-Toe Online Free - vs AI or Friend | PlayMini',
  description: 'Play Tic-Tac-Toe online free! Classic XO game with AI opponent or 2-player mode. 3 difficulty levels, score tracking. Browser game, no download needed.',
  keywords: 'tic tac toe, tic-tac-toe online, noughts and crosses, xs and os, tic tac toe game, play tic tac toe, tic tac toe AI, free online game',
  alternates: {
    canonical: '/tic-tac-toe',
  },
  openGraph: {
    title: 'Play Tic-Tac-Toe Online Free - vs AI or Friend | PlayMini',
    description: 'Play Tic-Tac-Toe online free! Classic XO game with AI opponent or 2-player mode. 3 difficulty levels, score tracking. Browser game, no download needed.',
    url: 'https://playmini.fun/tic-tac-toe',
    siteName: 'PlayMini',
    type: 'website',
    images: [
      {
        url: 'https://playmini.fun/og-image.png',
        width: 1200,
        height: 630,
        alt: 'PlayMini - Tic-Tac-Toe'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Play Tic-Tac-Toe Online Free - vs AI or Friend | PlayMini',
    description: 'Play Tic-Tac-Toe online free! Classic XO game with AI opponent or 2-player mode. 3 difficulty levels, score tracking. Browser game, no download needed.',
  }
};

export default function TicTacToePage() {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "How do I play Tic-Tac-Toe?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Click on any empty cell to place your mark (X or O). Get three in a row horizontally, vertically, or diagonally to win. In vs AI mode, you play as X and go first. In vs Friend mode, players alternate turns."
        }
      },
      {
        "@type": "Question",
        "name": "What are the AI difficulty levels?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Easy: AI makes random moves 50% of the time. Medium: AI makes random moves 20% of the time. Hard: AI uses the minimax algorithm and is unbeatable - the best you can do is draw."
        }
      },
      {
        "@type": "Question",
        "name": "Can I play with a friend?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes! Switch to 'vs Friend' mode at the top. Two players can take turns on the same device. X always goes first, then O, alternating until someone wins or the game draws."
        }
      }
    ]
  };

  const webAppSchema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Tic-Tac-Toe",
    "url": "https://playmini.fun/tic-tac-toe",
    "description": "Play classic Tic-Tac-Toe online for free. Challenge an unbeatable AI or play with a friend.",
    "applicationCategory": "Game",
    "genre": "Puzzle Game",
    "operatingSystem": "Any",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "featureList": [
      "Play vs AI with 3 difficulty levels",
      "Play vs Friend locally",
      "Score tracking",
      "Unbeatable hard AI using minimax",
      "Smooth animations",
      "Mobile-friendly"
    ]
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppSchema) }}
      />

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-cyan-400 to-rose-400 bg-clip-text text-transparent">
            Tic-Tac-Toe
          </h1>
          <p className="text-lg text-slate-300 max-w-2xl mx-auto">
            The classic game of strategy! Challenge an unbeatable AI or play with a friend. Can you win?
          </p>
        </div>

        {/* Game */}
        <TicTacToe />

        {/* How to Play */}
        <div className="mt-16 bg-slate-800 p-8 rounded-xl">
          <h2 className="text-2xl font-bold mb-4 text-cyan-400">How to Play</h2>
          <div className="space-y-4 text-slate-300">
            <div>
              <h3 className="font-semibold text-white mb-2">Game Modes</h3>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li><strong>vs AI:</strong> Play against the computer. You are X and go first.</li>
                <li><strong>vs Friend:</strong> Two players take turns on the same device. X goes first.</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-2">AI Difficulty</h3>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li><strong>Easy:</strong> The AI makes random moves 50% of the time.</li>
                <li><strong>Medium:</strong> The AI makes random moves 20% of the time.</li>
                <li><strong>Hard:</strong> Unbeatable! The AI uses the minimax algorithm - best you can do is draw.</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-2">Rules</h3>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Click any empty cell to place your mark (X or O)</li>
                <li>Get three in a row horizontally, vertically, or diagonally to win</li>
                <li>If all 9 cells are filled with no winner, the game is a draw</li>
                <li>X is cyan/blue, O is rose/pink</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-2">Features</h3>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Score tracking persists during your session</li>
                <li>Stats saved to your browser (X wins, O wins, draws)</li>
                <li>Share your stats with friends</li>
                <li>Smooth animations for X, O, and win lines</li>
              </ul>
            </div>
          </div>
        </div>

        {/* About */}
        <div className="mt-8 bg-slate-800 p-8 rounded-xl">
          <h2 className="text-2xl font-bold mb-4 text-rose-400">About Tic-Tac-Toe</h2>
          <div className="text-slate-300 space-y-3">
            <p>
              Tic-Tac-Toe (also known as Noughts and Crosses or Xs and Os) is a classic paper-and-pencil game
              for two players. Despite its simple rules, the game offers interesting strategic depth, especially
              when playing against an opponent who knows optimal strategy.
            </p>
            <p>
              Our implementation features an AI opponent that uses the minimax algorithm on Hard difficulty,
              making it impossible to beat when it plays perfectly. The best you can achieve is a draw. On Easy
              and Medium difficulties, the AI occasionally makes random moves, giving you a chance to win.
            </p>
            <p>
              The game tracks your wins, losses, and draws across your session, and stats are saved to your browser.
              Whether you're practicing strategy against the AI or challenging a friend, Tic-Tac-Toe remains a
              timeless game of wits.
            </p>
          </div>
        </div>

        {/* More Games */}
        <div className="mt-12">
          <MoreGames />
        </div>
      </div>
    </div>
  );
}
