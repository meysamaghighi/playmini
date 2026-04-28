"use client";

import GameShell from "../components/GameShell";
import Pong from "../components/Pong";

const HOW_TO = (
  <div>
    <p className="mb-3">
      Play Pong free in your browser — full guide in the section below.
    </p>
  </div>
);

export default function PongPlay() {
  return (
    <GameShell id="pong" title="Pong" howTo={HOW_TO} status="idle">
      <div className="py-4">
        <Pong />
      </div>
    </GameShell>
  );
}
