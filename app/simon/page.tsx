import type { Metadata } from "next";
import SimonSays from "../components/SimonSays";
import MoreGames from "../components/MoreGames";

export const metadata: Metadata = {
  title: "Play Simon Says Online Free - Memory Game | PlayMini",
  description:
    "Play Simon Says online free! Watch color sequences and repeat them. Test your memory with longer patterns. Classic brain game in browser, no download needed.",
  keywords:
    "simon says, simon game, memory game, pattern game, sequence game, brain game, free online game",
  alternates: {
    canonical: "/simon",
  },
  openGraph: {
    title: "Play Simon Says Online Free - Memory Game | PlayMini",
    description:
      "Play Simon Says online free! Watch color sequences and repeat them. Test your memory with longer patterns. Classic brain game in browser, no download needed.",
    type: "website",
    url: "https://playmini.fun/simon",
  },
};

export default function SimonPage() {
  return (
    <main className="max-w-4xl mx-auto px-4 pt-12 pb-12">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-black text-white mb-3">Simon Says</h1>
        <p className="text-gray-400">Watch the sequence, then repeat it</p>
      </div>

      <SimonSays />

      {/* How to Play section */}
      <section className="mt-12 bg-gray-900 rounded-lg p-6 border border-gray-800">
        <h2 className="text-2xl font-bold mb-4 text-blue-400">How to Play</h2>
        <div className="space-y-4 text-gray-300">
          <div>
            <h3 className="font-semibold text-white mb-2">Gameplay:</h3>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Watch as the colored quadrants light up in sequence</li>
              <li>Memorize the pattern</li>
              <li>Click the colors in the same order</li>
              <li>Each round adds one more color to the sequence</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-white mb-2">Goal:</h3>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Repeat the pattern correctly to advance</li>
              <li>The sequence gets longer each round</li>
              <li>One wrong color ends the game</li>
              <li>Try to beat your personal best!</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-white mb-2">Tips:</h3>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Focus on the pattern, not the individual colors</li>
              <li>Try saying the colors out loud to help remember</li>
              <li>Take your time - there's no rush to click</li>
            </ul>
          </div>
        </div>
      </section>

      {/* About Simon Says */}
      <section className="mt-8 bg-gray-900 rounded-lg p-6 border border-gray-800">
        <h2 className="text-2xl font-bold mb-4 text-blue-400">About Simon Says</h2>
        <div className="text-gray-300 space-y-3">
          <p>
            Simon Says is a classic electronic memory game that was first released in 1978. It became one of the most popular handheld games of all time.
          </p>
          <p>
            The game tests your short-term memory and pattern recognition skills. As you progress, the sequences become increasingly difficult to remember, challenging even the best players.
          </p>
          <p>
            This simple yet addictive game has entertained millions and remains a fun way to exercise your brain and improve your memory.
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
                name: "How do I play Simon Says?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Watch the colored quadrants light up in sequence, then click them in the same order. Each round adds one more color to the sequence. The game ends if you click the wrong color.",
                },
              },
              {
                "@type": "Question",
                name: "How long do the sequences get?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "The sequence starts with just one color and grows by one color each round. There's no limit - the game continues as long as you can remember and repeat the pattern correctly.",
                },
              },
              {
                "@type": "Question",
                name: "Is there a time limit?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "No, there's no time limit. You can take as long as you need to remember and repeat the sequence. Focus on accuracy, not speed.",
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
            name: "Simon Says Game",
            description:
              "Free online Simon Says memory game. Test your pattern recognition and memory skills.",
            url: "https://playmini.fun/simon",
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
