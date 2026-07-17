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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppSchema) }}
      />

      <main className="container mx-auto px-4 py-8 max-w-5xl">
        <FlappyPlay />

        <MoreGames />
      </main>
    </div>
  );
}
