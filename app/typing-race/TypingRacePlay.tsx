"use client";

import GameShell from "../components/GameShell";
import TypingRace from "../components/TypingRace";

const HOW_TO = (
  <div>
    <p className="mb-3">
      Type the given passage as fast and accurately as you can — your
      words-per-minute and accuracy are tracked live.
    </p>
    <p className="mb-1 font-semibold text-ink">Controls</p>
    <ul className="list-disc list-inside space-y-1">
      <li>Just start typing in the text box</li>
    </ul>
  </div>
);

export default function TypingRacePlay() {
  return (
    <GameShell id="typing-race" title="Typing Race" howTo={HOW_TO} status="idle">
      <div className="py-4">
        <TypingRace />
      </div>
    </GameShell>
  );
}
