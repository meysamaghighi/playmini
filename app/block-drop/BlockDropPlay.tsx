"use client";

import GameShell from "../components/GameShell";
import BlockDrop from "../components/BlockDrop";

const HOW_TO = (
  <div>
    <p className="mb-3">
      Play Block Drop free in your browser — full guide in the section below.
    </p>
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
