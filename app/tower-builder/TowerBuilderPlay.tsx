"use client";

import GameShell from "../components/GameShell";
import TowerBuilder from "../components/TowerBuilder";

const HOW_TO = (
  <div>
    <p className="mb-3">
      Blocks swing back and forth above your tower — drop each one to land as
      close to centered as possible. Build as tall as you can without one
      falling off.
    </p>
    <p className="mb-1 font-semibold text-ink">Controls</p>
    <ul className="list-disc list-inside space-y-1">
      <li>Tap/click anywhere, or press Space, to drop the block</li>
    </ul>
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
