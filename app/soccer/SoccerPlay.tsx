"use client";

import GameShell from "../components/GameShell";
import SoccerGame from "../components/SoccerGame";

const HOW_TO = (
  <div>
    <p className="mb-3">
      Play Penalty Kicks free in your browser — full guide in the section below.
    </p>
  </div>
);

export default function SoccerPlay() {
  return (
    <GameShell id="soccer" title="Penalty Kicks" howTo={HOW_TO} status="idle">
      <div className="py-4">
        <SoccerGame />
      </div>
    </GameShell>
  );
}
