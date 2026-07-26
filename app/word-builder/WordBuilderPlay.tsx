"use client";

import GameShell from "../components/GameShell";
import WordBuilder from "../components/WordBuilder";

const HOW_TO = (
  <div>
    <p className="mb-3">
      Spell as many valid words as you can using only the letters in the
      source word, before the 2-minute timer runs out.
    </p>
    <p className="mb-1 font-semibold text-ink">Controls</p>
    <ul className="list-disc list-inside space-y-1">
      <li>Type a word, then press Enter or tap Submit</li>
    </ul>
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
