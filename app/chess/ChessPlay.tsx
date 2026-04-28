"use client";

import GameShell from "../components/GameShell";
import ChessGame from "../components/ChessGame";

const HOW_TO = (
  <div>
    <p className="mb-3">
      Play Chess free in your browser — full guide in the section below.
    </p>
  </div>
);

export default function ChessPlay() {
  return (
    <GameShell id="chess" title="Chess" howTo={HOW_TO} status="idle">
      <div className="py-4">
        <ChessGame />
      </div>
    </GameShell>
  );
}
