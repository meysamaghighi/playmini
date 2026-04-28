"use client";

import GameShell from "../components/GameShell";
import Connect4Game from "../components/Connect4Game";

const HOW_TO = (
  <div>
    <p className="mb-3">
      Play Connect 4 free in your browser — full guide in the section below.
    </p>
  </div>
);

export default function Connect4Play() {
  return (
    <GameShell id="connect4" title="Connect 4" howTo={HOW_TO} status="idle">
      <div className="py-4">
        <Connect4Game />
      </div>
    </GameShell>
  );
}
