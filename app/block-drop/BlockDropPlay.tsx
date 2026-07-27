"use client";

import GameShell from "../components/GameShell";
import BlockDrop from "../components/BlockDrop";

const HOW_TO = (
  <div>
    <p className="mb-3">
      Stack the falling pieces and clear complete lines to score. The classic
      7-piece puzzle — how high can you build before it tops out?
    </p>
    <p className="mb-1 font-semibold text-ink">Controls</p>
    <ul className="list-disc list-inside space-y-1">
      <li>Arrow keys to move, Up to rotate, P or Escape to pause</li>
      <li>On mobile, drag to move, tap to rotate, swipe down to hard-drop</li>
    </ul>
  </div>
);

export default function BlockDropPlay() {
  return (
    <GameShell id="block-drop" title="Block Drop" howTo={HOW_TO} status="idle">
      <div className="py-4">
        <BlockDrop />
      </div>
    </GameShell>
  );
}
