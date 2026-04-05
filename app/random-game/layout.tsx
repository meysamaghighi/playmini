import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "GameShuffle - Discover Random Games | PlayMini",
  description: "Play a random game, vote thumbs up or down, and discover your favorites. Powered by PlayMini's collection of 31 free browser games.",
  alternates: { canonical: "https://random.playmini.fun" },
};

export default function RandomGameLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
