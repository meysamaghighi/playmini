import type { Metadata } from 'next';
import WhackMole from '../components/WhackMole';
import MoreGames from '../components/MoreGames';

export const metadata: Metadata = {
  title: 'Play Whack-a-Mole Online Free - Arcade Game | PlayMini',
  description: 'Play Whack-a-Mole online free! Tap moles as fast as you can, catch golden moles for bonus points. Classic arcade game in browser, no download required.',
  keywords: 'whack a mole, whack-a-mole game, arcade game, reaction game, tap game, free online game, browser game, mobile game',
  alternates: {
    canonical: '/whack-a-mole',
  },
  openGraph: {
    title: 'Play Whack-a-Mole Online Free - Arcade Game | PlayMini',
    description: 'Play Whack-a-Mole online free! Tap moles as fast as you can, catch golden moles for bonus points. Classic arcade game in browser, no download required.',
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
          text: 'Tap or click on moles as they pop up from the holes. You have 30 seconds to whack as many moles as possible. Regular moles are worth 1 point, and golden moles are worth 3 points. The game gets faster as time goes on!',
        },
      },
      {
        '@type': 'Question',
        name: 'What are golden moles?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Golden moles are rare moles that appear randomly (about 10% of the time). They are worth 3 points instead of 1, so prioritize whacking them when they appear!',
        },
      },
      {
        '@type': 'Question',
        name: 'How long does a game last?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Each game of Whack-a-Mole lasts 30 seconds. Moles appear faster and stay visible for shorter times as the game progresses, making it more challenging.',
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
          <h1 className="text-4xl md:text-5xl font-bold text-center mb-8 text-white">
            Whack-a-Mole
          </h1>

          <WhackMole />

          {/* How to Play */}
          <section className="mt-16 max-w-3xl mx-auto bg-gray-800/50 rounded-xl p-8 backdrop-blur-sm">
            <h2 className="text-3xl font-bold text-white mb-6">How to Play</h2>
            <div className="space-y-4 text-gray-300">
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">Objective</h3>
                <p>
                  Whack as many moles as possible within 30 seconds! Tap or click on moles as they
                  pop up from their holes to score points.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">Controls</h3>
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
                <h3 className="text-xl font-semibold text-white mb-2">Scoring</h3>
                <ul className="list-disc list-inside space-y-2">
                  <li>
                    <strong>Regular Mole (brown):</strong> 1 point
                  </li>
                  <li>
                    <strong>Golden Mole (yellow):</strong> 3 points
                  </li>
                  <li>Golden moles appear randomly with about 10% probability</li>
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">Difficulty</h3>
                <p>
                  The game gets progressively harder! Moles appear faster and stay visible for
                  shorter periods as time passes. Stay alert and keep your reflexes sharp!
                </p>
              </div>
            </div>
          </section>

          {/* FAQ */}
          <section className="mt-12 max-w-3xl mx-auto bg-gray-800/50 rounded-xl p-8 backdrop-blur-sm">
            <h2 className="text-3xl font-bold text-white mb-6">Frequently Asked Questions</h2>
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  How do you play Whack-a-Mole?
                </h3>
                <p className="text-gray-300">
                  Tap or click on moles as they pop up from the holes. You have 30 seconds to whack
                  as many moles as possible. Regular moles are worth 1 point, and golden moles are
                  worth 3 points. The game gets faster as time goes on!
                </p>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">What are golden moles?</h3>
                <p className="text-gray-300">
                  Golden moles are rare moles that appear randomly (about 10% of the time). They are
                  worth 3 points instead of 1, so prioritize whacking them when they appear!
                </p>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  How long does a game last?
                </h3>
                <p className="text-gray-300">
                  Each game of Whack-a-Mole lasts 30 seconds. Moles appear faster and stay visible
                  for shorter times as the game progresses, making it more challenging.
                </p>
              </div>
            </div>
          </section>

          {/* About */}
          <section className="mt-12 max-w-3xl mx-auto bg-gray-800/50 rounded-xl p-8 backdrop-blur-sm">
            <h2 className="text-3xl font-bold text-white mb-6">About Whack-a-Mole</h2>
            <div className="space-y-4 text-gray-300">
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
                The game features progressive difficulty to keep you challenged, rare golden moles
                for bonus points, and personal best tracking so you can compete against yourself.
                Perfect for quick gaming sessions or trying to beat your high score!
              </p>
              <p>
                Whether you're looking to improve your reaction time, blow off some steam, or just
                have fun, Whack-a-Mole offers simple, satisfying gameplay that never gets old.
              </p>
            </div>
          </section>

          <MoreGames />
        </div>
      </main>
    </>
  );
}
