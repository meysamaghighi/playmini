import type { Metadata } from 'next';
import VoxelPlay from "./VoxelPlay";

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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppSchema) }}
      />

      <div className="min-h-screen bg-slate-900 text-ink py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <header className="text-center mb-8">
          </header>
        <VoxelPlay />
        </div>
      </div>
    </>
  );
}
