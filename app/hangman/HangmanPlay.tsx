"use client";

import GameShell from "../components/GameShell";
import HangmanGame from "../components/HangmanGame";

const HOW_TO = (
  <div>
    <p className="mb-3">
      Play Hangman free in your browser — full guide in the section below.
    </p>
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
