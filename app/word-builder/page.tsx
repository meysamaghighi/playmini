import type { Metadata } from "next";
import WordBuilderPlay from "./WordBuilderPlay";

export const metadata: Metadata = {
  title: "Play Word Builder Online Free - Make Words Game | PlayMini",
  description:
    "Play Word Builder online free! Make as many words as you can from letters in 2 minutes. Test your vocabulary in this browser word puzzle. No download needed.",
  keywords: [
    "word builder game online",
    "make words from letters game",
    "word builder online",
    "word puzzle game",
    "vocabulary game online",
    "anagram game",
    "letter game online",
    "word challenge",
  ],
  alternates: {
    canonical: "/word-builder",
  },
  openGraph: {
    title: "Play Word Builder Online Free - Make Words Game | PlayMini",
    description:
      "Play Word Builder online free! Make as many words as you can from letters in 2 minutes. Test your vocabulary in this browser word puzzle. No download needed.",
    type: "website",
    url: "https://playmini.fun/word-builder",
  },
};

export default function WordBuilderPage() {
  return (
    <main className="max-w-4xl mx-auto px-4 pt-12 pb-12">
      <div className="text-center mb-8">
        <p className="text-ink-2">How many words can you make from one word?</p>
      </div>
        <WordBuilderPlay />

      {/* WebApplication Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "Word Builder Game",
            description:
              "Free online word building game where you create words from the letters of a source word.",
            url: "https://playmini.fun/word-builder",
            applicationCategory: "Game",
            operatingSystem: "Any",
            offers: {
              "@type": "Offer",
              price: "0",
              priceCurrency: "USD",
            },
            browserRequirements: "Requires JavaScript. Works on all modern browsers.",
          }),
        }}
      />
    </main>
  );
}
