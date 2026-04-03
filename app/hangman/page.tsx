import type { Metadata } from "next";
import HangmanGame from "../components/HangmanGame";
import MoreGames from "../components/MoreGames";

export const metadata: Metadata = {
  title: "Play Hangman Online Free - Word Guess Game | PlayMini",
  description:
    "Play Hangman online free! Guess the word letter by letter, 200+ words across 10 categories. Classic word guessing game in browser. No download, mobile-friendly.",
  keywords: [
    "hangman game online free",
    "play hangman online",
    "hangman online",
    "free hangman game",
    "word guessing game",
    "hangman word game",
    "online hangman unblocked",
  ],
  alternates: {
    canonical: "/hangman",
  },
  openGraph: {
    title: "Play Hangman Online Free - Word Guess Game | PlayMini",
    description:
      "Play Hangman online free! Guess the word letter by letter, 200+ words across 10 categories. Classic word guessing game in browser. No download, mobile-friendly.",
    type: "website",
    url: "https://playmini.fun/hangman",
  },
};

export default function HangmanPage() {
  return (
    <main className="min-h-screen bg-gray-950 text-white">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-orange-400 to-red-600 bg-clip-text text-transparent">
            Hangman
          </h1>
          <p className="text-gray-300 text-lg">
            Guess the word one letter at a time. Six wrong guesses and it's game over!
          </p>
        </div>

        {/* Game */}
        <HangmanGame />

        {/* How to Play */}
        <section className="mt-12 bg-gray-900 rounded-lg p-6 border border-gray-800">
          <h2 className="text-2xl font-bold mb-4 text-orange-400">How to Play</h2>
          <div className="space-y-4 text-gray-300">
            <div>
              <h3 className="font-semibold text-white mb-2">Game Rules:</h3>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>A random word is chosen from 200+ words across 10 categories</li>
                <li>You see the category as a hint (Animals, Countries, Foods, etc.)</li>
                <li>Guess one letter at a time by clicking or typing</li>
                <li>Correct letters appear in the word</li>
                <li>Wrong letters draw one part of the hangman figure</li>
                <li>You have 6 wrong guesses before game over</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-2">Controls:</h3>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Click letter buttons on screen (mobile-friendly)</li>
                <li>Or type letters on your keyboard (A-Z)</li>
                <li>Letters turn green (correct) or red (wrong)</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-2">Scoring:</h3>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Win Streak: consecutive games won</li>
                <li>Best Streak: your longest winning streak (saved)</li>
                <li>Try to build the longest streak possible!</li>
              </ul>
            </div>
          </div>
        </section>

        {/* About Hangman */}
        <section className="mt-8 bg-gray-900 rounded-lg p-6 border border-gray-800">
          <h2 className="text-2xl font-bold mb-4 text-orange-400">About Hangman</h2>
          <div className="text-gray-300 space-y-3">
            <p>
              Hangman is a classic word guessing game that has been enjoyed for generations.
              The game challenges your vocabulary, spelling knowledge, and deductive reasoning
              as you work to uncover hidden words letter by letter.
            </p>
            <p>
              Originally played with paper and pencil, Hangman has become a popular educational
              tool for learning new words and improving spelling skills. The tension builds with
              each wrong guess as the stick figure drawing gets closer to completion.
            </p>
            <p>
              This online version features 200+ carefully selected words across 10 diverse
              categories including Animals, Countries, Foods, Sports, Movies, Music, Nature,
              Technology, Professions, and Clothing. The category hint helps narrow down your
              guesses while still maintaining the challenge.
            </p>
            <p>
              Challenge yourself to build the longest winning streak! Each correct word guess
              adds to your streak, but one loss resets it to zero. How high can you go?
            </p>
          </div>
        </section>

        {/* FAQ Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FAQPage",
              mainEntity: [
                {
                  "@type": "Question",
                  name: "How do I play Hangman?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "Guess letters one at a time by clicking the on-screen keyboard or typing on your physical keyboard. Correct letters appear in the word, wrong letters add to the hangman figure. You have 6 wrong guesses before game over. The category hint helps narrow down possibilities.",
                  },
                },
                {
                  "@type": "Question",
                  name: "How many words are in the game?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "The game includes 200+ words across 10 different categories: Animals, Countries, Foods, Sports, Movies, Music, Nature, Technology, Professions, and Clothing. Each game randomly selects a word and shows you the category.",
                  },
                },
                {
                  "@type": "Question",
                  name: "What is a win streak in Hangman?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "Your win streak is the number of consecutive games you've won without losing. It increases by 1 for each word you guess correctly. If you lose a game (6 wrong guesses), your streak resets to 0. Your best streak is saved so you can try to beat it.",
                  },
                },
                {
                  "@type": "Question",
                  name: "Can I play Hangman on mobile?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "Yes! The game features an on-screen keyboard that works perfectly on touchscreens. Simply tap the letters to make your guesses. The game is fully responsive and optimized for both mobile and desktop play.",
                  },
                },
              ],
            }),
          }}
        />

        {/* WebApplication Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              name: "Hangman",
              description:
                "Play Hangman free online with 200+ words across 10 categories. Guess the word before running out of chances.",
              url: "https://playmini.fun/hangman",
              applicationCategory: "Game",
              operatingSystem: "Any",
              offers: {
                "@type": "Offer",
                price: "0",
                priceCurrency: "USD",
              },
              browserRequirements: "Requires JavaScript. Works on all modern browsers.",
            }),
          }}
        />

        <MoreGames />
      </div>
    </main>
  );
}
