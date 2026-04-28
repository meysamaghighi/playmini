"use client";

import GameShell from "../components/GameShell";
import TypingRace from "../components/TypingRace";

const HOW_TO = (
  <div>
    <p className="mb-3">
      Play Typing Race free in your browser — full guide in the section below.
    </p>
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
