import type { Metadata } from 'next';
import WhackAMolePlay from "./WhackAMolePlay";

export const metadata: Metadata = {
  title: 'Play Whack-a-Mole Online Free - Arcade Game | PlayMini',
  description: 'Play Whack-a-Mole online free! Tap moles as they pop up — 30 seconds on the clock, beat your best score. Classic arcade reflex game in your browser.',
  keywords: 'whack a mole, whack-a-mole game, arcade game, reaction game, tap game, free online game, browser game, mobile game',
  alternates: {
    canonical: '/whack-a-mole',
  },
  openGraph: {
    title: 'Play Whack-a-Mole Online Free - Arcade Game | PlayMini',
    description: 'Play Whack-a-Mole online free! Tap moles as they pop up — 30 seconds on the clock, beat your best score. Classic arcade reflex game in your browser.',
    url: 'https://playmini.fun/whack-a-mole',
    siteName: 'PlayMini',
    type: 'website',
    images: [
      {
        url: 'https://playmini.fun/og-image.png',
        width: 1200,
        height: 630,
        alt: 'PlayMini - Free Browser Games',
      },
    ],
  },
};

export default function WhackMolePage() {
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'How do you play Whack-a-Mole?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Tap or click on moles as they pop up from the holes. You have 30 seconds to whack as many moles as possible — one point per hit. Missing a mole costs you nothing, but moles only stay visible briefly.',
        },
      },
      {
        '@type': 'Question',
        name: 'How long does a game last?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Each round of Whack-a-Mole lasts 30 seconds. Your final score is the number of moles you hit in that time.',
        },
      },
      {
        '@type': 'Question',
        name: 'Is my best score saved?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes. Your highest score is saved in your browser and shown on the scoreboard so you can chase it across sessions.',
        },
      },
    ],
  };

  const webAppSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Whack-a-Mole',
    description: 'Free online Whack-a-Mole game. Tap moles as they pop up and beat your high score!',
    url: 'https://playmini.fun/whack-a-mole',
    applicationCategory: 'Game',
    operatingSystem: 'Any',
    browserRequirements: 'Requires JavaScript',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppSchema) }}
      />

      <main className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 py-8 px-4">
        <div className="max-w-6xl mx-auto">
        <WhackAMolePlay />

          {/* How to Play */}
          <section className="mt-16 max-w-3xl mx-auto bg-paper-2/50 rounded-xl p-8 backdrop-blur-sm">
            <h2 className="text-3xl font-bold text-ink mb-6">How to Play</h2>
            <div className="space-y-4 text-ink-2">
              <div>
                <h3 className="text-xl font-semibold text-ink mb-2">Objective</h3>
                <p>
                  Whack as many moles as possible within 30 seconds! Tap or click on moles as they
                  pop up from their holes to score points.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-ink mb-2">Controls</h3>
                <ul className="list-disc list-inside space-y-2">
                  <li>
                    <strong>Desktop:</strong> Click on moles with your mouse
                  </li>
                  <li>
                    <strong>Mobile:</strong> Tap moles with your finger
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-ink mb-2">Scoring</h3>
                <ul className="list-disc list-inside space-y-2">
                  <li>One point per mole you hit before it hides</li>
                  <li>Best score is saved in your browser</li>
                </ul>
              </div>
            </div>
          </section>

          {/* FAQ */}
          <section className="mt-12 max-w-3xl mx-auto bg-paper-2/50 rounded-xl p-8 backdrop-blur-sm">
            <h2 className="text-3xl font-bold text-ink mb-6">Frequently Asked Questions</h2>
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-ink mb-2">
                  How do you play Whack-a-Mole?
                </h3>
                <p className="text-ink-2">
                  Tap or click on moles as they pop up from the holes. You have 30 seconds to whack
                  as many as you can — one point per hit. Moles only stay visible briefly, so
                  reflexes matter.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-ink mb-2">
                  How long does a round last?
                </h3>
                <p className="text-ink-2">
                  Each round of Whack-a-Mole is 30 seconds. When the timer runs out, your final
                  score is displayed and compared to your personal best.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-ink mb-2">
                  Is my best score saved?
                </h3>
                <p className="text-ink-2">
                  Yes. Your highest score is saved in your browser&apos;s local storage and shown on
                  the scoreboard between rounds.
                </p>
              </div>
            </div>
          </section>

          {/* About */}
          <section className="mt-12 max-w-3xl mx-auto bg-paper-2/50 rounded-xl p-8 backdrop-blur-sm">
            <h2 className="text-3xl font-bold text-ink mb-6">About Whack-a-Mole</h2>
            <div className="space-y-4 text-ink-2">
              <p>
                Whack-a-Mole is a classic arcade game that tests your reflexes and reaction time.
                The concept is simple but addictive: moles pop up randomly from holes, and your job
                is to whack them before they disappear back underground.
              </p>
              <p>
                Originally popularized in arcades, Whack-a-Mole has become a beloved game worldwide.
                Our online version brings this classic experience to your browser, playable on any
                device with no downloads required.
              </p>
              <p>
                The game features a 30-second round and personal best tracking so you can compete
                against yourself. Perfect for quick gaming sessions or trying to beat your high
                score!
              </p>
              <p>
                Whether you're looking to improve your reaction time, blow off some steam, or just
                have fun, Whack-a-Mole offers simple, satisfying gameplay that never gets old.
              </p>
            </div>
          </section>
        </div>
      </main>
    </>
  );
}
