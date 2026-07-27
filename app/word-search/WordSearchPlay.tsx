"use client";

import GameShell from "../components/GameShell";
import WordSearchGame from "../components/WordSearchGame";

const HOW_TO = (
  <div>
    <p className="mb-3">
      Find every word from the list hidden in the letter grid. Words can run
      horizontally, vertically, or diagonally, in either direction.
    </p>
    <p className="mb-1 font-semibold text-ink">Controls</p>
    <ul className="list-disc list-inside space-y-1">
      <li>Click or tap the first letter and drag to the last letter to select a word</li>
    </ul>
  </div>
);

export default function WordSearchPlay() {
  return (
    <GameShell id="word-search" title="Word Search" howTo={HOW_TO} status="idle">
      <div className="py-4">
        <WordSearchGame />
      </div>
    </GameShell>
  );
}
