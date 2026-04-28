"use client";

import GameShell from "../components/GameShell";
import WhackMole from "../components/WhackMole";

const HOW_TO = (
  <div>
    <p className="mb-3">
      Play Whack-a-Mole free in your browser — full guide in the section below.
    </p>
  </div>
);

export default function WhackAMolePlay() {
  return (
    <GameShell id="whack-a-mole" title="Whack-a-Mole" howTo={HOW_TO} status="idle">
      <div className="py-4">
        <WhackMole />
      </div>
    </GameShell>
  );
}
