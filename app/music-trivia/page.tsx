import type { Metadata } from "next";
import MusicTrivia from "../components/MusicTrivia";
import MoreGames from "../components/MoreGames";

export const metadata: Metadata = {
  title: "Music Party Trivia - Free Song Quiz Game | PlayMini",
  description:
    "Free music trivia game with 170+ songs. Test your knowledge about artists and songs, or challenge friends to place songs on a timeline. Perfect for parties!",
  keywords:
    "music trivia, song quiz, music quiz game, party game, timeline game, music knowledge, free trivia",
  openGraph: {
    title: "Music Party Trivia - Free Song Quiz Game | PlayMini",
    description:
      "Free music trivia with 170+ songs spanning 7 decades. Trivia questions + timeline challenge. Perfect for parties!",
    type: "website",
    url: "https://playmini.fun/music-trivia",
  },
};

export default function MusicTriviaPage() {
  return (
    <main className="min-h-screen bg-gray-950 text-white">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <MusicTrivia />

        <section className="mt-12 bg-gray-900 rounded-lg p-6 border border-gray-800">
          <h2 className="text-2xl font-bold mb-4 text-purple-400">How to Play</h2>
          <div className="space-y-4 text-gray-300">
            <div>
              <h3 className="font-semibold text-white mb-2">Music Trivia</h3>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>You get 10 random songs, each with 3 trivia questions</li>
                <li>Click "Show Answer" to reveal, then mark if you got it right</li>
                <li>Some questions are discussion prompts for group play</li>
                <li>Score up to 30 points per round</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-2">Timeline Challenge</h3>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Songs appear one by one -- you don't see the year</li>
                <li>Place each song in the correct position on the timeline</li>
                <li>You have 3 lives -- wrong placements cost a life</li>
                <li>How many songs can you correctly place?</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="mt-8 bg-gray-900 rounded-lg p-6 border border-gray-800">
          <h2 className="text-2xl font-bold mb-4 text-purple-400">About Music Party Trivia</h2>
          <div className="text-gray-300 space-y-3">
            <p>
              Music Party Trivia features over 170 songs spanning from the 1950s to the 2020s. From rock legends like Queen and Led Zeppelin to modern hits by Taylor Swift and Harry Styles, there is something for every music fan.
            </p>
            <p>
              Play solo to test your own knowledge, or gather friends for a party trivia night. The trivia mode works great as a companion to music-themed board games -- just pull up a song and quiz everyone at the table!
            </p>
          </div>
        </section>

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FAQPage",
              mainEntity: [
                {
                  "@type": "Question",
                  name: "How many songs are in Music Party Trivia?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "There are over 170 songs spanning 7 decades, from the 1950s to the 2020s, covering rock, pop, hip-hop, electronic, and more.",
                  },
                },
                {
                  "@type": "Question",
                  name: "Can I play Music Party Trivia at a party?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "Yes! The trivia mode is perfect for groups. Show the song, read questions aloud, and see who knows the most. The timeline mode also works as a group challenge.",
                  },
                },
              ],
            }),
          }}
        />

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              name: "Music Party Trivia",
              description:
                "Free music trivia game with 170+ songs. Trivia questions and timeline challenge.",
              url: "https://playmini.fun/music-trivia",
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
