"use client";

import GameShell from "../components/GameShell";
import FlappyBird from "../components/FlappyBird";

const HOW_TO = (
  <div>
    <p className="mb-3">
      Play Flappy Bird free in your browser — full guide in the section below.
    </p>
  </div>
);

export default function FlappyPlay() {
  return (
    <GameShell id="flappy" title="Flappy Bird" howTo={HOW_TO} status="idle">
      <div className="py-4">
        <FlappyBird />
      </div>
    </GameShell>
  );
}
