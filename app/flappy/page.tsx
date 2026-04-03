import { Metadata } from 'next';
import FlappyBird from '../components/FlappyBird';
import MoreGames from '../components/MoreGames';

export const metadata: Metadata = {
  title: 'Play Flappy Bird Online Free - Tap to Flap | PlayMini',
  description: 'Play Flappy Bird online free! Tap to flap through pipes, choose from 6 birds. Addictive arcade game in browser, no download. Beat your high score!',
  keywords: [
    'play flappy bird online free',
    'flappy bird browser game',
    'flappy bird online',
    'free flappy bird',
    'flappy bird game',
    'flappy bird unblocked',
    'arcade game online',
  ],
  alternates: {
    canonical: '/flappy',
  },
  openGraph: {
    title: 'Play Flappy Bird Online Free - Tap to Flap | PlayMini',
    description: 'Play Flappy Bird online free! Tap to flap through pipes, choose from 6 birds. Addictive arcade game in browser, no download. Beat your high score!',
    url: 'https://playmini.fun/flappy',
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

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'How do I play Flappy Bird?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Tap the screen or press the spacebar to make the bird flap its wings and fly upward. Avoid hitting the pipes or the ground. Your score increases each time you pass through a pipe gap.',
      },
    },
    {
      '@type': 'Question',
      name: 'What happens when I hit a pipe?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'The game ends when the bird collides with a pipe, the ground, or the ceiling. Your final score is displayed and compared to your personal best.',
      },
    },
    {
      '@type': 'Question',
      name: 'Is my high score saved?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes! Your personal best score is automatically saved in your browser and displayed on the game over screen.',
      },
    },
  ],
};

const webAppSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Flappy Bird',
  description: 'Play Flappy Bird online for free! Tap to flap through pipes and beat your high score.',
  url: 'https://playmini.fun/flappy',
  applicationCategory: 'Game',
  genre: 'Arcade',
  browserRequirements: 'Requires JavaScript. Requires HTML5.',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD',
  },
};

export default function FlappyPage() {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppSchema) }}
      />

      <main className="container mx-auto px-4 py-8 max-w-5xl">
        <h1 className="text-4xl md:text-5xl font-bold text-center mb-4">
          Flappy Bird
        </h1>
        <p className="text-xl text-gray-300 text-center mb-8">
          Tap to flap and avoid the pipes!
        </p>

        <FlappyBird />

        <section className="mt-12 bg-gray-800 rounded-lg p-8">
          <h2 className="text-3xl font-bold mb-6">How to Play</h2>
          <div className="space-y-4 text-gray-300">
            <div>
              <h3 className="text-xl font-semibold text-white mb-2">Objective</h3>
              <p>Guide the bird through gaps between pipes without crashing. Score points by passing through each pipe gap.</p>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-white mb-2">Controls</h3>
              <ul className="list-disc list-inside space-y-1">
                <li><strong>Desktop:</strong> Press the Spacebar to flap</li>
                <li><strong>Mobile:</strong> Tap anywhere on the screen to flap</li>
                <li><strong>Click:</strong> Click the canvas to flap</li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-white mb-2">Tips</h3>
              <ul className="list-disc list-inside space-y-1">
                <li>Time your flaps carefully - the bird falls quickly!</li>
                <li>Stay calm and focus on the rhythm</li>
                <li>Aim for the center of each gap</li>
                <li>Practice makes perfect - don't give up!</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="mt-12 bg-gray-800 rounded-lg p-8">
          <h2 className="text-3xl font-bold mb-6">Frequently Asked Questions</h2>
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-white mb-2">How do I play Flappy Bird?</h3>
              <p className="text-gray-300">Tap the screen or press the spacebar to make the bird flap its wings and fly upward. Avoid hitting the pipes or the ground. Your score increases each time you pass through a pipe gap.</p>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-white mb-2">What happens when I hit a pipe?</h3>
              <p className="text-gray-300">The game ends when the bird collides with a pipe, the ground, or the ceiling. Your final score is displayed and compared to your personal best.</p>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-white mb-2">Is my high score saved?</h3>
              <p className="text-gray-300">Yes! Your personal best score is automatically saved in your browser and displayed on the game over screen.</p>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-white mb-2">Can I play on mobile?</h3>
              <p className="text-gray-300">Absolutely! The game is fully touch-enabled and works great on phones and tablets. Just tap the screen to flap.</p>
            </div>
          </div>
        </section>

        <section className="mt-12 bg-gray-800 rounded-lg p-8">
          <h2 className="text-3xl font-bold mb-4">About Flappy Bird</h2>
          <div className="text-gray-300 space-y-4">
            <p>
              Flappy Bird is a classic arcade-style game that became a global phenomenon. The simple yet challenging gameplay has captivated millions of players worldwide. Tap to make the bird flap through pipes - sounds easy, but mastering the timing is incredibly addictive!
            </p>
            <p>
              This browser-based version captures the essence of the original game with smooth controls, responsive gameplay, and automatic score tracking. No download required - just open your browser and start flapping!
            </p>
            <p>
              Challenge yourself to beat your personal best, share your high scores with friends, and see how far you can go. Every game is a new opportunity to improve your skills and climb the leaderboard.
            </p>
          </div>
        </section>

        <MoreGames />
      </main>
    </div>
  );
}
