import type { Metadata } from "next";
import TypingRacePlay from "./TypingRacePlay";

export const metadata: Metadata = {
  title: "Play Typing Race Online Free - WPM Speed Test | PlayMini",
  description:
    "Play Typing Race online free! Test your typing speed and accuracy, track WPM and personal best. Multiple difficulty levels. Browser-based typing game, no download.",
  keywords: [
    "typing race",
    "typing speed test",
    "WPM test",
    "typing game",
    "typing practice",
    "words per minute",
    "typing accuracy",
    "speed typing",
    "typing challenge",
    "typing trainer",
  ],
  alternates: {
    canonical: "/typing-race",
  },
  openGraph: {
    title: "Play Typing Race Online Free - WPM Speed Test | PlayMini",
    description:
      "Play Typing Race online free! Test your typing speed and accuracy, track WPM and personal best. Multiple difficulty levels. Browser-based typing game, no download.",
    url: "https://playmini.fun/typing-race",
    siteName: "PlayMini",
    type: "website",
    images: [
      {
        url: "https://playmini.fun/og-image.png",
        width: 1200,
        height: 630,
        alt: "PlayMini - Typing Race Game",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Typing Race - Test Your Typing Speed Online | PlayMini",
    description:
      "Test your typing speed with varied difficulty levels. Track your WPM and beat your personal best!",
    images: ["https://playmini.fun/og-image.png"],
  },
};

export default function TypingRacePage() {
  const webAppSchema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Typing Race - Typing Speed Test",
    description:
      "Test your typing speed and accuracy with Typing Race. Choose from multiple difficulty levels, track your WPM in real-time, and beat your personal best.",
    url: "https://playmini.fun/typing-race",
    applicationCategory: "Game",
    operatingSystem: "Web Browser",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
  };

  return (
    <div className="min-h-screen bg-slate-900">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppSchema) }}
      />
        <TypingRacePlay />
    </div>
  );
}
