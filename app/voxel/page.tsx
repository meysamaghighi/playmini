import type { Metadata } from 'next';
import VoxelPlay from "./VoxelPlay";
import MoreGames from '../components/MoreGames';

export const metadata: Metadata = {
  title: 'Play Voxel Builder Online Free - 3D Building Game | PlayMini',
  description: 'Play Voxel Builder online free! Build with 3D blocks, create structures in isometric view. Minecraft-like building game in browser, no download required.',
  keywords: 'voxel builder, minecraft game, block building, 3D builder, creative game, building game, free minecraft, voxel game, sandbox game',
  alternates: {
    canonical: '/voxel',
  },
  openGraph: {
    title: 'Play Voxel Builder Online Free - 3D Building Game | PlayMini',
    description: 'Play Voxel Builder online free! Build with 3D blocks, create structures in isometric view. Minecraft-like building game in browser, no download required.',
    url: 'https://playmini.fun/voxel',
    siteName: 'PlayMini',
    images: [
      {
        url: 'https://playmini.fun/og-image.png',
        width: 1200,
        height: 630,
        alt: 'PlayMini - Free Browser Games',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
};

export default function VoxelPage() {
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'How do I place and remove blocks in Voxel Builder?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'On desktop, left-click to place blocks and right-click to remove them. On mobile, tap to place blocks and long-press (hold for half a second) to remove them. Blocks automatically stack on top of each other.',
        },
      },
      {
        '@type': 'Question',
        name: 'What block types are available?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Voxel Builder includes 6 block types: Grass (green), Stone (gray), Wood (brown), Water (blue), Sand (tan), and Brick (red). Click any block in the palette at the bottom to select it for building.',
        },
      },
      {
        '@type': 'Question',
        name: 'Does Voxel Builder save my creation?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes! Your voxel world is automatically saved to your browser\'s local storage. When you return, your creation will be exactly as you left it. Use the "Clear All" button to start fresh.',
        },
      },
    ],
  };

  const webAppSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Voxel Builder',
    description: 'Build your own voxel world with colorful blocks in this free Minecraft-like browser game.',
    url: 'https://playmini.fun/voxel',
    applicationCategory: 'Game',
    genre: 'Building Game, Sandbox',
    operatingSystem: 'Any',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    browserRequirements: 'Requires JavaScript. Works on Chrome, Firefox, Safari, Edge.',
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

      <div className="min-h-screen bg-slate-900 text-ink py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <header className="text-center mb-8">
          </header>
        <VoxelPlay />

          {/* How to Play */}
          <section className="mt-12 bg-slate-800 rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-4">How to Play</h2>
            <div className="space-y-3 text-slate-300">
              <p>
                <strong className="text-ink">Select a Block:</strong> Click any block type in the palette at the bottom (Grass, Stone, Wood, Water, Sand, or Brick).
              </p>
              <p>
                <strong className="text-ink">Place Blocks:</strong> On desktop, left-click on the grid to place blocks. They automatically stack on top of each other. On mobile, tap to place.
              </p>
              <p>
                <strong className="text-ink">Remove Blocks:</strong> On desktop, right-click to remove the top block at any position. On mobile, long-press (hold) to remove.
              </p>
              <p>
                <strong className="text-ink">Zoom:</strong> Use the Zoom In/Out buttons to get closer or see more of your creation.
              </p>
              <p>
                <strong className="text-ink">Clear All:</strong> Start fresh by clicking the "Clear All" button.
              </p>
              <p>
                <strong className="text-ink">Auto-Save:</strong> Your creation is automatically saved and will be restored when you return!
              </p>
            </div>
          </section>

          {/* About */}
          <section className="mt-8 bg-slate-800 rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-4">About Voxel Builder</h2>
            <div className="space-y-3 text-slate-300">
              <p>
                Voxel Builder is a free Minecraft-like building game that runs entirely in your browser. Create structures, landscapes, and anything you can imagine using colorful 3D blocks rendered in an isometric view.
              </p>
              <p>
                With 6 different block types and a 16×16 grid that stacks up to 8 blocks high, you have over 2,000 possible block positions to fill. Build houses, castles, pixel art, or abstract sculptures — the only limit is your creativity!
              </p>
              <p>
                Your world is automatically saved locally, so you can return anytime to continue building. No account needed, no downloads required — just start building!
              </p>
            </div>
          </section>

          <MoreGames />
        </div>
      </div>
    </>
  );
}
