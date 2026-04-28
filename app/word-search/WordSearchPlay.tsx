"use client";

import GameShell from "../components/GameShell";
import WordSearchGame from "../components/WordSearchGame";

const HOW_TO = (
  <div>
    <p className="mb-3">
      Play Word Search free in your browser — full guide in the section below.
    </p>
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
