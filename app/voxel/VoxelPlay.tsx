"use client";

import GameShell from "../components/GameShell";
import VoxelBuilder from "../components/VoxelBuilder";

const HOW_TO = (
  <div>
    <p className="mb-3">
      Build 3D structures block by block in an isometric view, like a mini
      voxel sandbox.
    </p>
    <p className="mb-1 font-semibold text-ink">Controls</p>
    <ul className="list-disc list-inside space-y-1">
      <li>Tap/click to place a block, tap an existing block to remove it</li>
      <li>Drag to pan the view, use the rotate buttons to turn it</li>
    </ul>
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
