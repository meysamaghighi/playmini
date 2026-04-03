import type { Metadata } from "next";
import DinoRunner from "../components/DinoRunner";
import MoreGames from "../components/MoreGames";

export const metadata: Metadata = {
  title: "Dino Run Game Online - Chrome Dinosaur Game | PlayMini",
  description:
    "Play dino run game online! Chrome dinosaur game style endless runner. Jump over cacti, duck under pterodactyls. Free, no download. Desktop and mobile.",
  keywords: [
    "dino run game online",
    "chrome dinosaur game online",
    "dino game online",
    "t-rex runner",
    "chrome dino game",
    "dinosaur game online free",
    "endless runner game",
    "dino runner",
  ],
  alternates: {
    canonical: "/dino-runner",
  },
  openGraph: {
    title: "Dino Run Game Online - Chrome Dinosaur Game | PlayMini",
    description:
      "Play dino run game online! Chrome dinosaur game style endless runner. Jump over cacti, duck under pterodactyls.",
    type: "website",
    url: "https://playmini.fun/dino-runner",
  },
};

export default function DinoRunnerPage() {
  return (
    <main className="min-h-screen bg-gray-950 text-white">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-green-400 to-lime-500 bg-clip-text text-transparent">
            Dino Runner
          </h1>
          <p className="text-gray-300 text-lg">
            Jump over cacti, duck under pterodactyls, and survive as long as you can in this endless runner!
          </p>
        </div>

        {/* Game */}
        <DinoRunner />

        {/* How to Play */}
        <section className="mt-12 bg-gray-900 rounded-lg p-6 border border-gray-800">
          <h2 className="text-2xl font-bold mb-4 text-green-400">How to Play</h2>
          <div className="space-y-4 text-gray-300">
            <div>
              <h3 className="font-semibold text-white mb-2">Desktop Controls:</h3>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Press Space or Up Arrow to jump over cacti</li>
                <li>Press Down Arrow to duck under flying pterodactyls</li>
                <li>Tap Space or click the game to start</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-2">Mobile Controls:</h3>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Tap anywhere on the game to jump</li>
                <li>Swipe down to duck under flying obstacles</li>
                <li>Release to stand back up after ducking</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-2">Gameplay:</h3>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Avoid cacti by jumping over them</li>
                <li>Duck under pterodactyls flying at head height</li>
                <li>Score increases continuously as you survive</li>
                <li>Game speed gradually increases over time</li>
                <li>Get milestone celebrations every 100 points</li>
                <li>Try to beat your personal best score!</li>
              </ul>
            </div>
          </div>
        </section>

        {/* About Dino Runner */}
        <section className="mt-8 bg-gray-900 rounded-lg p-6 border border-gray-800">
          <h2 className="text-2xl font-bold mb-4 text-green-400">About Dino Runner</h2>
          <div className="text-gray-300 space-y-3">
            <p>
              Dino Runner is inspired by the classic Chrome dinosaur game that appears when your internet connection is down.
              Guide a T-Rex through an endless desert filled with obstacles, testing your reflexes and timing.
            </p>
            <p>
              The game features two types of obstacles: ground-level cacti that require jumping, and flying pterodactyls
              that force you to duck. As your score increases, the game speed gradually ramps up, making survival increasingly
              challenging.
            </p>
            <p>
              With smooth gameplay, responsive controls for both desktop and mobile, and automatic score tracking,
              Dino Runner offers endless entertainment. Challenge yourself to reach new milestones and compete
              against your own best score!
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
                  name: "How do I play Dino Runner?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "On desktop, press Space or Up Arrow to jump over cacti, and press Down Arrow to duck under pterodactyls. On mobile, tap to jump and swipe down to duck. The game starts when you press Space or tap the screen.",
                  },
                },
                {
                  "@type": "Question",
                  name: "What are the obstacles in Dino Runner?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "There are two types of obstacles: cacti on the ground that you must jump over, and flying pterodactyls at head height that you must duck under. The obstacles appear randomly and require quick reflexes to avoid.",
                  },
                },
                {
                  "@type": "Question",
                  name: "Does Dino Runner get faster as I play?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "Yes! The game speed gradually increases as your score goes up, making the game progressively more challenging. You'll receive milestone celebrations every 100 points. Your personal best score is saved automatically in your browser.",
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
              name: "Dino Runner",
              description:
                "Play the addictive Dino Runner endless runner game free online with increasing difficulty and score tracking.",
              url: "https://playmini.fun/dino-runner",
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
