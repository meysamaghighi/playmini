"use client";

import GameShell from "../components/GameShell";
import SimonSays from "../components/SimonSays";

const HOW_TO = (
  <div>
    <p className="mb-3">
      Watch the color sequence light up, then repeat it back. Each round adds
      one more step — how long a pattern can you remember?
    </p>
    <p className="mb-1 font-semibold text-ink">Controls</p>
    <ul className="list-disc list-inside space-y-1">
      <li>Tap/click the colored pads in the order shown</li>
    </ul>
  </div>
);

export default function SimonPlay() {
  return (
    <GameShell id="simon" title="Simon Says" howTo={HOW_TO} status="idle">
      <div className="py-4">
        <SimonSays />
      </div>
    </GameShell>
  );
}
