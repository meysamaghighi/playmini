"use client";

import GameShell from "../components/GameShell";
import Game2048 from "../components/Game2048";

const HOW_TO = (
  <div>
    <p className="mb-3">
      Play 2048 Game free in your browser — full guide in the section below.
    </p>
  </div>
);

export default function Game2048Play() {
  return (
    <GameShell id="2048" title="2048 Game" howTo={HOW_TO} status="idle">
      <div className="py-4">
        <Game2048 />
      </div>
    </GameShell>
  );
}
