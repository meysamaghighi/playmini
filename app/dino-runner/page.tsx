import type { Metadata } from "next";
import DinoRunner from "../components/DinoRunner";
import MoreGames from "../components/MoreGames";

export const metadata: Metadata = {
  title: "Play Dino Run Game Online Free - Chrome Dino | PlayMini",
  description:
    "Play Dino Run game online free! Jump and duck through cacti and pterodactyls — classic T-Rex runner in your browser. Speeds up as your score grows, works on mobile and desktop.",
  keywords: [
    "chrome dino game online",
    "dino run game online",
    "play dino game online",
    "t-rex runner game",
    "chrome dinosaur game",
    "dinosaur game no internet",
    "dino game free",
    "endless runner game",
    "chrome dino runner",
    "offline dino game",
    "dinosaur jump game",
  ],
  alternates: {
    canonical: "/dino-runner",
  },
  openGraph: {
    title: "Play Dino Run Game Online Free - Chrome Dino | PlayMini",
    description:
      "Play Dino Run game online free! Jump and duck through cacti and pterodactyls — classic T-Rex runner in your browser.",
    type: "website",
    url: "https://playmini.fun/dino-runner",
  },
};

export default function DinoRunnerPage() {
  return (
    <main className="min-h-screen bg-paper text-ink">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-green-400 to-lime-500 bg-clip-text text-transparent">
            Dino Runner
          </h1>
          <p className="text-ink-2 text-lg">
            Jump over cacti, duck under pterodactyls, and see how far you can go.
          </p>
        </div>

        <DinoRunner />

        <section className="mt-12 bg-paper-2 rounded-lg p-6 border border-line">
          <h2 className="text-2xl font-bold mb-4 text-green-400">How to Play</h2>
          <div className="space-y-4 text-ink-2">
            <div>
              <h3 className="font-semibold text-ink mb-2">Desktop:</h3>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Space or Up Arrow to jump</li>
                <li>Down Arrow to duck under pterodactyls</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-ink mb-2">Mobile:</h3>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Tap the screen (or the Jump button) to jump</li>
                <li>Hold the Duck button to duck</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-ink mb-2">Gameplay:</h3>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Dodge cacti on the ground and flying pterodactyls overhead</li>
                <li>Score rises with distance — the game speeds up the further you run</li>
                <li>One hit ends the run; your best score is saved locally</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="mt-8 bg-paper-2 rounded-lg p-6 border border-line">
          <h2 className="text-2xl font-bold mb-4 text-green-400">About Dino Runner</h2>
          <div className="text-ink-2 space-y-3">
            <p>
              Dino Runner is a minimal browser take on the classic Chrome dinosaur endless runner.
              Jump and duck past obstacles; the game speeds up as you score, and the only goal is to
              beat your personal best.
            </p>
            <p>
              Controls are responsive on both desktop (Space / arrows) and mobile (tap / duck
              button). Your best score persists in your browser so you can chase it across sessions.
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
                  name: "How do I play the dino game online?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "Press Space or Up Arrow to jump over cacti and rocks. Press Down Arrow to duck under flying pterodactyls. On mobile, tap to jump and hold the Duck button to duck.",
                  },
                },
                {
                  "@type": "Question",
                  name: "Is the chrome dino game free?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "Yes. Dino Runner is free to play, with no download or sign-up. It runs in any modern browser on desktop or mobile.",
                  },
                },
                {
                  "@type": "Question",
                  name: "Can I play the dino game on my phone?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "Yes. The game is fully touch-enabled — tap to jump and hold the duck button on screen. It scales to fit phone and tablet screens.",
                  },
                },
                {
                  "@type": "Question",
                  name: "Is my high score saved?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "Yes. Your personal best is saved in your browser's local storage and shown on every game-over screen so you can keep pushing it higher.",
                  },
                },
                {
                  "@type": "Question",
                  name: "What are the obstacles?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "Ground obstacles are cacti — jump over them. Flying pterodactyls appear once you've scored enough — duck under them. The game speeds up as your score climbs, giving less time to react.",
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
              name: "Dino Runner",
              description:
                "Play Dino Runner free online — a classic endless runner with jump, duck, and a saved high score.",
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
