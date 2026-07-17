import { Metadata } from 'next';
import TicTacToePlay from "./TicTacToePlay";

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
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-ink">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppSchema) }}
      />

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8">
          <p className="text-lg text-slate-300 max-w-2xl mx-auto">
            The classic game of strategy! Challenge an unbeatable AI or play with a friend. Can you win?
          </p>
        </div>

        {/* Game */}
        <TicTacToePlay />
      </div>
    </div>
  );
}
