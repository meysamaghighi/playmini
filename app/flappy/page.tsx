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
        text: 'Tap the screen on mobile or press the spacebar on desktop to flap. Navigate through gaps between pipes without crashing. Score 1 point per pipe passed. Your high score is saved automatically.',
      },
    },
    {
      '@type': 'Question',
      name: 'Can I play Flappy Bird on my phone?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. Tap anywhere on the screen to flap. Works on phones and tablets.',
      },
    },
    {
      '@type': 'Question',
      name: 'What happens when I hit a pipe?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'The game ends immediately. Your final score is shown and compared to your personal best. Restart instantly to try again.',
      },
    },
    {
      '@type': 'Question',
      name: 'Is Flappy Bird free to play?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. No download or sign-up needed. Runs in any modern browser.',
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

        <MoreGames />
      </main>
    </div>
  );
}
