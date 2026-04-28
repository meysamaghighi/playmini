"use client";

import GameShell from "../components/GameShell";
import VoxelBuilder from "../components/VoxelBuilder";

const HOW_TO = (
  <div>
    <p className="mb-3">
      Play Voxel Builder free in your browser — full guide in the section below.
    </p>
  </div>
);

export default function VoxelPlay() {
  return (
    <GameShell id="voxel" title="Voxel Builder" howTo={HOW_TO} status="idle">
      <div className="py-4">
        <VoxelBuilder />
      </div>
    </GameShell>
  );
}
