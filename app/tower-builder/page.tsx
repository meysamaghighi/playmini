import type { Metadata } from "next";
import TowerBuilderPlay from "./TowerBuilderPlay";

export const metadata: Metadata = {
  title: "Play Tower Builder Online Free - Stacking Game | PlayMini",
  description:
    "Play Tower Builder online free! Stack swinging blocks to build the tallest tower. Test your precision and timing. Browser-based arcade game, no download needed.",
  keywords:
    "tower builder, stacking game, block stacking, tower game, precision game, free online game, casual game, mobile game, browser game",
  alternates: {
    canonical: "/tower-builder",
  },
  openGraph: {
    title: "Play Tower Builder Online Free - Stacking Game | PlayMini",
    description:
      "Play Tower Builder online free! Stack swinging blocks to build the tallest tower. Test your precision and timing. Browser-based arcade game, no download needed.",
    url: "https://playmini.fun/tower-builder",
    siteName: "PlayMini",
    type: "website",
    images: [
      {
        url: "https://playmini.fun/og-image.png",
        width: 1200,
        height: 630,
        alt: "Tower Builder Game",
      },
    ],
  },
};

const webAppSchema = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Tower Builder",
  url: "https://playmini.fun/tower-builder",
  description:
    "Build the tallest tower by stacking blocks perfectly. Free online stacking game.",
  applicationCategory: "Game",
  genre: "Casual Game",
  operatingSystem: "Any",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
  browserRequirements: "Requires JavaScript. Works on all modern browsers.",
};

export default function TowerBuilderPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppSchema) }}
      />

      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 text-ink">
        <div className="container mx-auto px-4 py-8">
          <header className="text-center mb-8">
          </header>
        <TowerBuilderPlay />
        </div>
      </div>
    </>
  );
}
