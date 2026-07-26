"use client";

import GameShell from "../components/GameShell";
import WordleGame from "../components/WordleGame";

const HOW_TO = (
  <div>
    <p className="mb-3">
      Guess the secret 5-letter word in 6 tries. After each guess, tile colors
      show how close you got: green means the right letter in the right spot,
      yellow means the right letter in the wrong spot, gray means the letter
      isn&apos;t in the word.
    </p>
    <p className="mb-1 font-semibold text-ink">Controls</p>
    <ul className="list-disc list-inside space-y-1">
      <li>Type a letter, or tap the on-screen keyboard</li>
      <li>Enter to submit a guess, Backspace to delete</li>
    </ul>
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
