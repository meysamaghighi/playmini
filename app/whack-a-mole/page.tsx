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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppSchema) }}
      />

      <main className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 py-8 px-4">
        <div className="max-w-6xl mx-auto">
        <WhackAMolePlay />
        </div>
      </main>
    </>
  );
}
