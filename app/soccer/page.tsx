import type { Metadata } from "next";
import SoccerGame from "../components/SoccerGame";
import MoreGames from "../components/MoreGames";

export const metadata: Metadata = {
  title: "Play Penalty Kicks Online Free - Soccer Game | PlayMini",
  description:
    "Play Penalty Kicks online free! Aim your shot, beat the goalkeeper, score goals. 10 rounds of soccer action. Browser game, works on mobile and desktop.",
  keywords:
    "penalty kicks, soccer game, football game, free soccer game, online soccer, penalty shootout, browser game",
  alternates: {
    canonical: "/soccer",
  },
  openGraph: {
    title: "Play Penalty Kicks Online Free - Soccer Game | PlayMini",
    description:
      "Play Penalty Kicks online free! Aim your shot, beat the goalkeeper, score goals. 10 rounds of soccer action. Browser game, works on mobile and desktop.",
    type: "website",
    url: "https://playmini.fun/soccer",
  },
};

export default function SoccerPage() {
  return (
    <main className="min-h-screen bg-gray-950 text-white">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-green-400 to-emerald-600 bg-clip-text text-transparent">
            Penalty Kicks
          </h1>
          <p className="text-gray-300 text-lg">
            Aim carefully and blast it past the keeper! Score as many goals as you can in 10 rounds.
          </p>
        </div>

        <SoccerGame />

        <section className="mt-12 bg-gray-900 rounded-lg p-6 border border-gray-800">
          <h2 className="text-2xl font-bold mb-4 text-green-400">How to Play</h2>
          <div className="space-y-4 text-gray-300">
            <div>
              <h3 className="font-semibold text-white mb-2">Controls:</h3>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>A crosshair moves automatically across the goal</li>
                <li>Click or tap to shoot when the crosshair is where you want</li>
                <li>Time your shot carefully to beat the goalkeeper</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-2">Rules:</h3>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>You have 10 penalty kicks per round</li>
                <li>The goalkeeper gets smarter as rounds progress</li>
                <li>Try to score as many goals as possible out of 10</li>
                <li>Share your results with friends!</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="mt-8 bg-gray-900 rounded-lg p-6 border border-gray-800">
          <h2 className="text-2xl font-bold mb-4 text-green-400">About Penalty Kicks</h2>
          <div className="text-gray-300 space-y-3">
            <p>
              Penalty kicks are one of the most exciting moments in football. The pressure of a one-on-one battle between striker and goalkeeper has decided countless matches and tournaments.
            </p>
            <p>
              In this game, you face an increasingly skilled goalkeeper over 10 rounds. Early shots are easier to place, but as you progress, the keeper reads your aim faster and dives more accurately. Can you score a perfect 10/10?
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
                  name: "How do I aim my penalty kick?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "A crosshair moves automatically across the goal. Click or tap at the right moment to shoot in that direction. Timing is key!",
                  },
                },
                {
                  "@type": "Question",
                  name: "Does the goalkeeper get harder?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "Yes! The goalkeeper's reaction speed and accuracy improve with each round, making later penalties more challenging to score.",
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
              name: "Penalty Kicks",
              description:
                "Free online penalty kick game. Aim, shoot, and beat the goalkeeper.",
              url: "https://playmini.fun/soccer",
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
