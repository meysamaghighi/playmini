"use client";

import GameShell from "../components/GameShell";
import Solitaire from "../components/Solitaire";

const HOW_TO = (
  <div>
    <p className="mb-3">
      Play Solitaire free in your browser — full guide in the section below.
    </p>
  </div>
);

export default function SolitairePlay() {
  return (
    <GameShell id="solitaire" title="Solitaire" howTo={HOW_TO} status="idle">
      <div className="py-4">
        <Solitaire />
      </div>
    </GameShell>
  );
}
