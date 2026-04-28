"use client";

import GameShell from "../components/GameShell";
import WordleGame from "../components/WordleGame";

const HOW_TO = (
  <div>
    <p className="mb-3">
      Play Wordle free in your browser — full guide in the section below.
    </p>
  </div>
);

export default function WordlePlay() {
  return (
    <GameShell id="wordle" title="Wordle" howTo={HOW_TO} status="idle">
      <div className="py-4">
        <WordleGame />
      </div>
    </GameShell>
  );
}
