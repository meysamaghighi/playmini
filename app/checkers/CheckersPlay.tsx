"use client";

import GameShell from "../components/GameShell";
import CheckersGame from "../components/CheckersGame";

const HOW_TO = (
  <div>
    <p className="mb-3">
      Play Checkers free in your browser — full guide in the section below.
    </p>
  </div>
);

export default function CheckersPlay() {
  return (
    <GameShell id="checkers" title="Checkers" howTo={HOW_TO} status="idle">
      <div className="py-4">
        <CheckersGame />
      </div>
    </GameShell>
  );
}
