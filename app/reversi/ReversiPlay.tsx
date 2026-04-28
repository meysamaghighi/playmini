"use client";

import GameShell from "../components/GameShell";
import ReversiGame from "../components/ReversiGame";

const HOW_TO = (
  <div>
    <p className="mb-3">
      Play Reversi free in your browser — full guide in the section below.
    </p>
  </div>
);

export default function ReversiPlay() {
  return (
    <GameShell id="reversi" title="Reversi" howTo={HOW_TO} status="idle">
      <div className="py-4">
        <ReversiGame />
      </div>
    </GameShell>
  );
}
