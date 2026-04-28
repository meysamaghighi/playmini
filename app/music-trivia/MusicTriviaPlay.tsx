"use client";

import GameShell from "../components/GameShell";
import MusicTrivia from "../components/MusicTrivia";

const HOW_TO = (
  <div>
    <p className="mb-3">
      Play Music Trivia free in your browser — full guide in the section below.
    </p>
  </div>
);

export default function MusicTriviaPlay() {
  return (
    <GameShell id="music-trivia" title="Music Trivia" howTo={HOW_TO} status="idle">
      <div className="py-4">
        <MusicTrivia />
      </div>
    </GameShell>
  );
}
