import type { Metadata } from "next";
import WordBuilder from "../components/WordBuilder";
import MoreGames from "../components/MoreGames";

export const metadata: Metadata = {
  title: "Word Builder Game Online - Make Words From Letters | PlayMini",
  description:
    "Play word builder game online! Make words from letters in 2 minutes. Test your vocabulary with this free word puzzle. No download. Desktop and mobile friendly.",
  keywords: [
    "word builder game online",
    "make words from letters game",
    "word builder online",
    "word puzzle game",
    "vocabulary game online",
    "anagram game",
    "letter game online",
    "word challenge",
  ],
  alternates: {
    canonical: "/word-builder",
  },
  openGraph: {
    title: "Word Builder Game Online - Make Words From Letters | PlayMini",
    description:
      "Play word builder game online! Make words from letters in 2 minutes. Test your vocabulary with this free word puzzle.",
    type: "website",
    url: "https://playmini.fun/word-builder",
  },
};

export default function WordBuilderPage() {
  return (
    <main className="max-w-4xl mx-auto px-4 pt-12 pb-12">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-black text-white mb-3">Word Builder</h1>
        <p className="text-gray-400">How many words can you make from one word?</p>
      </div>

      <WordBuilder />

      {/* How to Play */}
      <section className="mt-12 bg-gray-900 rounded-lg p-6 border border-gray-800">
        <h2 className="text-2xl font-bold mb-4 text-emerald-400">How to Play</h2>
        <div className="space-y-4 text-gray-300">
          <div>
            <h3 className="font-semibold text-white mb-2">Objective:</h3>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Create as many valid English words as possible from the letters of a source word</li>
              <li>Each word must be at least 3 letters long</li>
              <li>You have 120 seconds (2 minutes) to find words</li>
              <li>Each letter can only be used as many times as it appears in the source word</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-white mb-2">Scoring:</h3>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>3-letter words: 1 point</li>
              <li>4-letter words: 2 points</li>
              <li>5-letter words: 3 points</li>
              <li>6-letter words: 4 points</li>
              <li>7+ letter words: 5+ points</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-white mb-2">Tips:</h3>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Start with short 3-letter words to build momentum</li>
              <li>Look for common prefixes and suffixes</li>
              <li>Try different letter combinations systematically</li>
              <li>Don't forget plurals and verb forms!</li>
            </ul>
          </div>
        </div>
      </section>

      {/* About Word Builder */}
      <section className="mt-8 bg-gray-900 rounded-lg p-6 border border-gray-800">
        <h2 className="text-2xl font-bold mb-4 text-emerald-400">About Word Builder</h2>
        <div className="text-gray-300 space-y-3">
          <p>
            Word Builder is a vocabulary challenge game that tests how many words you can create from the letters of a single source word.
            Each source word is carefully selected to have many possible sub-words, ranging from simple 3-letter combinations to complex
            7+ letter words.
          </p>
          <p>
            The game uses a dictionary of thousands of common English words and validates each submission in real-time. Words you've already
            found or invalid words will be rejected. At the end, you'll see all the words you found plus all the words you missed!
          </p>
          <p>
            Word building games are excellent for improving vocabulary, spelling, and pattern recognition. They're also great for competitive
            players who want to beat their personal best score!
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
                name: "How does Word Builder work?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "You're given a source word (like 'EDUCATION') and must create as many valid English words as possible using only those letters. Each letter can only be used as many times as it appears in the source word. You have 2 minutes to find as many words as you can!",
                },
              },
              {
                "@type": "Question",
                name: "What is the minimum word length?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "The minimum word length is 3 letters. Words shorter than 3 letters are not accepted in the game.",
                },
              },
              {
                "@type": "Question",
                name: "How is the score calculated?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Each word is worth points based on its length: 3-letter words = 1 point, 4-letter = 2 points, 5-letter = 3 points, and so on. Your total score is the sum of all your found words' points.",
                },
              },
              {
                "@type": "Question",
                name: "Can I replay with different words?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Yes! Each time you start a new game, you'll get a randomly selected source word from a curated list of words with many possible sub-words. Try to beat your personal best!",
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
            name: "Word Builder Game",
            description:
              "Free online word building game where you create words from the letters of a source word.",
            url: "https://playmini.fun/word-builder",
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
    </main>
  );
}
