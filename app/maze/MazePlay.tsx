"use client";

import GameShell from "../components/GameShell";
import MazeRunner from "../components/MazeRunner";

const HOW_TO = (
  <div>
    <p className="mb-3">
      Navigate from the start to the target through a freshly generated maze
      each time.
    </p>
    <p className="mb-1 font-semibold text-ink">Controls</p>
    <ul className="list-disc list-inside space-y-1">
      <li>Arrow keys or WASD to move</li>
      <li>On mobile, swipe in the direction you want to go</li>
    </ul>
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
