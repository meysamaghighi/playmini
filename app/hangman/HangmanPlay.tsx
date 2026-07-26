"use client";

import GameShell from "../components/GameShell";
import HangmanGame from "../components/HangmanGame";

const HOW_TO = (
  <div>
    <p className="mb-3">
      Guess the hidden word one letter at a time before you run out of tries.
    </p>
    <p className="mb-1 font-semibold text-ink">Controls</p>
    <ul className="list-disc list-inside space-y-1">
      <li>Type a letter, or tap the on-screen keyboard</li>
    </ul>
  </div>
);

export default function HangmanPlay() {
  return (
    <GameShell id="hangman" title="Hangman" howTo={HOW_TO} status="idle">
      <div className="py-4">
        <HangmanGame />
      </div>
    </GameShell>
  );
}
