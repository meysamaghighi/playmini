"use client";

import GameShell from "../components/GameShell";
import TowerBuilder from "../components/TowerBuilder";

const HOW_TO = (
  <div>
    <p className="mb-3">
      Play Tower Builder free in your browser — full guide in the section below.
    </p>
  </div>
);

export default function TowerBuilderPlay() {
  return (
    <GameShell id="tower-builder" title="Tower Builder" howTo={HOW_TO} status="idle">
      <div className="py-4">
        <TowerBuilder />
      </div>
    </GameShell>
  );
}
