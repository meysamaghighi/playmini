import { Metadata } from 'next';
import FlappyPlay from "./FlappyPlay";
import MoreGames from '../components/MoreGames';

export const metadata: Metadata = {
  title: 'Play Flappy Bird Online Free - Tap to Flap | PlayMini',
  description: 'Play Flappy Bird online free! Tap to flap through pipes, beat your high score. Classic arcade game in your browser, no download needed.',
  keywords: [
    'play flappy bird online free',
    'flappy bird online',
    'flappy bird free',
    'flappy bird game browser',
    'flappy bird no download',
    'flappy bird unblocked',
    'arcade game online',
    'tap to flap game',
    'flappy bird mobile',
    'flappy game online',
    'bird flying game',
    'endless flappy bird',
  ],
  alternates: {
    canonical: '/flappy',
  },
  openGraph: {
    title: 'Play Flappy Bird Online Free - Tap to Flap | PlayMini',
    description: 'Play Flappy Bird online free! Tap to flap through pipes, beat your high score. Classic arcade game in your browser, no download needed.',
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
      name: 'How do I play Flappy Bird online?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Tap the screen on mobile or press the spacebar on desktop to make the bird flap its wings and fly upward. Navigate through gaps between pipes without crashing. Your score increases each time you successfully pass through a pipe gap. Timing and rhythm are key to getting high scores.',
      },
    },
    {
      '@type': 'Question',
      name: 'Is Flappy Bird free to play?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes! Flappy Bird is completely free to play online with no download or registration required. Just open your browser and start playing instantly. Your high score is automatically saved in your browser so you can keep trying to beat it.',
      },
    },
    {
      '@type': 'Question',
      name: 'Can I play Flappy Bird on my phone?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Absolutely! Flappy Bird is fully optimized for mobile devices. Simply tap anywhere on the screen to make the bird flap and fly upward. The game works smoothly on both phones and tablets with intuitive touch controls.',
      },
    },
    {
      '@type': 'Question',
      name: 'What happens when I hit a pipe?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'The game ends immediately when the bird collides with a pipe, the ground, or the ceiling. Your final score is displayed and compared to your personal best. You can restart instantly to try again and beat your high score.',
      },
    },
    {
      '@type': 'Question',
      name: 'Is my high score saved in Flappy Bird?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes! Your personal best score is automatically saved in your browser using local storage. Every time you play, your current score is compared to your high score, which is displayed on the game over screen.',
      },
    },
    {
      '@type': 'Question',
      name: 'Can you play Flappy Bird without downloading?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes! Flappy Bird runs entirely in your web browser with zero downloads or installations needed. It works on any device with a modern browser - desktop, laptop, smartphone, or tablet. Just visit the page and start playing instantly.',
      },
    },
    {
      '@type': 'Question',
      name: 'What is the best strategy for Flappy Bird?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Focus on finding a consistent rhythm rather than panicking. Tap gently and regularly to maintain steady altitude. Aim to fly through the center of each pipe gap. Stay calm, be patient, and with practice you will develop the muscle memory needed for higher scores.',
      },
    },
    {
      '@type': 'Question',
      name: 'How do you get a high score in Flappy Bird?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Practice is essential! Master the timing between taps to maintain smooth flight. Avoid overreacting - small, consistent taps work better than frantic mashing. Focus on the next pipe gap ahead rather than watching the bird itself. With repetition, you will improve your reflexes and achieve higher scores.',
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
    <div className="min-h-screen bg-paper-2 text-ink">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppSchema) }}
      />

      <main className="container mx-auto px-4 py-8 max-w-5xl">
        <FlappyPlay />

        <section className="mt-12 bg-paper-2 rounded-lg p-8">
          <h2 className="text-3xl font-bold mb-6">How to Play</h2>
          <div className="space-y-4 text-ink-2">
            <div>
              <h3 className="text-xl font-semibold text-ink mb-2">Objective</h3>
              <p>Guide the bird through gaps between pipes without crashing. Score points by passing through each pipe gap.</p>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-ink mb-2">Controls</h3>
              <ul className="list-disc list-inside space-y-1">
                <li><strong>Desktop:</strong> Press the Spacebar to flap</li>
                <li><strong>Mobile:</strong> Tap anywhere on the screen to flap</li>
                <li><strong>Click:</strong> Click the canvas to flap</li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-ink mb-2">Tips</h3>
              <ul className="list-disc list-inside space-y-1">
                <li>Time your flaps carefully - the bird falls quickly!</li>
                <li>Stay calm and focus on the rhythm</li>
                <li>Aim for the center of each gap</li>
                <li>Practice makes perfect - don't give up!</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="mt-12 bg-paper-2 rounded-lg p-8">
          <h2 className="text-3xl font-bold mb-6">Frequently Asked Questions</h2>
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-ink mb-2">How do I play Flappy Bird?</h3>
              <p className="text-ink-2">Tap the screen or press the spacebar to make the bird flap its wings and fly upward. Avoid hitting the pipes or the ground. Your score increases each time you pass through a pipe gap.</p>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-ink mb-2">What happens when I hit a pipe?</h3>
              <p className="text-ink-2">The game ends when the bird collides with a pipe, the ground, or the ceiling. Your final score is displayed and compared to your personal best.</p>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-ink mb-2">Is my high score saved?</h3>
              <p className="text-ink-2">Yes! Your personal best score is automatically saved in your browser and displayed on the game over screen.</p>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-ink mb-2">Can I play on mobile?</h3>
              <p className="text-ink-2">Absolutely! The game is fully touch-enabled and works great on phones and tablets. Just tap the screen to flap.</p>
            </div>
          </div>
        </section>

        <section className="mt-12 bg-paper-2 rounded-lg p-8">
          <h2 className="text-3xl font-bold mb-4">About Flappy Bird</h2>
          <div className="text-ink-2 space-y-4">
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
