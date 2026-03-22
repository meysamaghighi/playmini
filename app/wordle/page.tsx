import type { Metadata } from "next";
import WordleGame from "../components/WordleGame";
import MoreGames from "../components/MoreGames";

export const metadata: Metadata = {
  title: "Word Guess - Free Wordle Game Online | PlayMini",
  description:
    "Play Word Guess, a free Wordle-style word puzzle game. Guess the 5-letter word in 6 tries. Unlimited plays, daily challenges, and track your streak. Play now on PlayMini!",
  keywords: [
    "word guess",
    "wordle clone",
    "word puzzle",
    "5 letter word game",
    "daily word game",
    "word game online",
    "free word puzzle",
    "guess the word",
    "vocabulary game",
    "brain teaser",
  ],
  openGraph: {
    title: "Word Guess - Free Wordle Game Online | PlayMini",
    description:
      "Play Word Guess, a free Wordle-style word puzzle game. Guess the 5-letter word in 6 tries. Unlimited plays and track your streak!",
    url: "https://playmini.fun/wordle",
    siteName: "PlayMini",
    type: "website",
    images: [
      {
        url: "https://playmini.fun/og-image.png",
        width: 1200,
        height: 630,
        alt: "PlayMini - Word Guess Game",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Word Guess - Free Wordle Game Online | PlayMini",
    description:
      "Guess the 5-letter word in 6 tries. Unlimited plays, daily challenges, and track your streak!",
    images: ["https://playmini.fun/og-image.png"],
  },
};

export default function WordlePage() {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "How do I play Word Guess?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "You have 6 attempts to guess a 5-letter word. After each guess, the tiles change color: green means the letter is correct and in the right position, yellow means the letter is in the word but in the wrong position, and gray means the letter is not in the word at all. Use the on-screen keyboard or your physical keyboard to type guesses.",
        },
      },
      {
        "@type": "Question",
        name: "Can I play Word Guess unlimited times?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes! Unlike daily word games, Word Guess lets you play as many times as you want. Each game picks a new random word from our curated list of common 5-letter words. Click 'New Game' after finishing to start another round.",
        },
      },
      {
        "@type": "Question",
        name: "How are my stats tracked in Word Guess?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Word Guess tracks your games played, win percentage, current streak, and max streak. All stats are saved locally in your browser using localStorage, so they persist across sessions. Your streak increases with each consecutive win and resets if you lose a game.",
        },
      },
    ],
  };

  const webAppSchema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Word Guess - Free Wordle Game",
    description:
      "A free Wordle-style word puzzle game where you guess a 5-letter word in 6 tries. Features unlimited plays, streak tracking, and shareable results.",
    url: "https://playmini.fun/wordle",
    applicationCategory: "Game",
    operatingSystem: "Web Browser",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
  };

  return (
    <div className="min-h-screen bg-slate-900">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppSchema) }}
      />

      <WordleGame />

      {/* How to Play */}
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-slate-800 rounded-lg p-6 mb-8 border border-gray-700">
          <h2 className="text-2xl font-bold text-white mb-4">How to Play</h2>
          <ul className="space-y-3 text-gray-300">
            <li className="flex items-start">
              <span className="text-[#22c55e] mr-2">✓</span>
              <span>
                <strong>Guess the word:</strong> You have 6 tries to guess a
                5-letter word. Type your guess using the on-screen keyboard or
                your physical keyboard.
              </span>
            </li>
            <li className="flex items-start">
              <span className="text-[#22c55e] mr-2">✓</span>
              <span>
                <strong>Green tile:</strong> The letter is in the word and in
                the correct position.
              </span>
            </li>
            <li className="flex items-start">
              <span className="text-[#eab308] mr-2">✓</span>
              <span>
                <strong>Yellow tile:</strong> The letter is in the word but in
                the wrong position.
              </span>
            </li>
            <li className="flex items-start">
              <span className="text-gray-500 mr-2">✓</span>
              <span>
                <strong>Gray tile:</strong> The letter is not in the word.
              </span>
            </li>
            <li className="flex items-start">
              <span className="text-[#22c55e] mr-2">✓</span>
              <span>
                <strong>Valid words only:</strong> Your guess must be a valid
                5-letter word from our word list. Invalid words will shake the
                row.
              </span>
            </li>
            <li className="flex items-start">
              <span className="text-[#22c55e] mr-2">✓</span>
              <span>
                <strong>Unlimited plays:</strong> Play as many times as you
                want! Each game picks a new random word.
              </span>
            </li>
          </ul>
        </div>

        {/* FAQ */}
        <div className="bg-slate-800 rounded-lg p-6 mb-8 border border-gray-700">
          <h2 className="text-2xl font-bold text-white mb-4">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">
                How do I play Word Guess?
              </h3>
              <p className="text-gray-300">
                You have 6 attempts to guess a 5-letter word. After each guess,
                the tiles change color: green means the letter is correct and in
                the right position, yellow means the letter is in the word but
                in the wrong position, and gray means the letter is not in the
                word at all. Use the on-screen keyboard or your physical
                keyboard to type guesses.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">
                Can I play Word Guess unlimited times?
              </h3>
              <p className="text-gray-300">
                Yes! Unlike daily word games, Word Guess lets you play as many
                times as you want. Each game picks a new random word from our
                curated list of common 5-letter words. Click "New Game" after
                finishing to start another round.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">
                How are my stats tracked in Word Guess?
              </h3>
              <p className="text-gray-300">
                Word Guess tracks your games played, win percentage, current
                streak, and max streak. All stats are saved locally in your
                browser using localStorage, so they persist across sessions.
                Your streak increases with each consecutive win and resets if
                you lose a game.
              </p>
            </div>
          </div>
        </div>

        {/* About */}
        <div className="bg-slate-800 rounded-lg p-6 mb-8 border border-gray-700">
          <h2 className="text-2xl font-bold text-white mb-4">
            About Word Guess
          </h2>
          <p className="text-gray-300 mb-4">
            Word Guess is a free Wordle-style word puzzle game where you try to
            guess a 5-letter word in 6 attempts. Each guess provides feedback
            through colored tiles, helping you narrow down the correct word.
          </p>
          <p className="text-gray-300 mb-4">
            Unlike daily word games that limit you to one puzzle per day, Word
            Guess offers unlimited gameplay. Practice your vocabulary, improve
            your deduction skills, and challenge yourself to maintain long win
            streaks.
          </p>
          <p className="text-gray-300">
            The game features a carefully curated word list of common 5-letter
            words, ensuring fair and enjoyable gameplay. Track your progress
            with built-in statistics that show your games played, win rate,
            current streak, and maximum streak. Share your results with friends
            using the colored emoji grid!
          </p>
        </div>
      </div>

      <MoreGames />
    </div>
  );
}
