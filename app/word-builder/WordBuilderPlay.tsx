"use client";

import GameShell from "../components/GameShell";
import WordBuilder from "../components/WordBuilder";

const HOW_TO = (
  <div>
    <p className="mb-3">
      Play Word Builder free in your browser — full guide in the section below.
    </p>
  </div>
);

export default function WordBuilderPlay() {
  return (
    <GameShell id="word-builder" title="Word Builder" howTo={HOW_TO} status="idle">
      <div className="py-4">
        <WordBuilder />
      </div>
    </GameShell>
  );
}
