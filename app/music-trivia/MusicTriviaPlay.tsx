"use client";

import GameShell from "../components/GameShell";
import MusicTrivia from "../components/MusicTrivia";

const HOW_TO = (
  <div>
    <p className="mb-3">
      Two modes: Trivia quizzes you on the song playing — reveal the answer
      and mark yourself right or wrong. Timeline has you place songs in the
      order they were released.
    </p>
    <p className="mb-1 font-semibold text-ink">Controls</p>
    <ul className="list-disc list-inside space-y-1">
      <li>Tap/click to reveal an answer, mark it, or place a song on the timeline</li>
    </ul>
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
