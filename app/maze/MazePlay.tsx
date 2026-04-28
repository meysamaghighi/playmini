"use client";

import GameShell from "../components/GameShell";
import MazeRunner from "../components/MazeRunner";

const HOW_TO = (
  <div>
    <p className="mb-3">
      Play Maze Runner free in your browser — full guide in the section below.
    </p>
  </div>
);

export default function MazePlay() {
  return (
    <GameShell id="maze" title="Maze Runner" howTo={HOW_TO} status="idle">
      <div className="py-4">
        <MazeRunner />
      </div>
    </GameShell>
  );
}
