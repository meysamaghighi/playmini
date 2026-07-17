"use client";

import { useRef, useState } from "react";
import GameShell from "../components/GameShell";
import SnakeGame, { type SnakeGameHandle } from "../components/SnakeGame";
import { useProgress } from "../hooks/useProgress";

const HOW_TO = (
  <div>
    <p className="mb-3">
      Guide the snake to eat red food and grow longer. Don&apos;t hit the walls
      or your own tail.
    </p>
    <p className="mb-1 font-semibold text-ink">Controls</p>
    <ul className="list-disc list-inside space-y-1">
      <li>Arrow keys (or W / A / S / D) to turn</li>
      <li>On mobile, swipe in any direction</li>
    </ul>
  </div>
);

export default function SnakePlay() {
  const gameRef = useRef<SnakeGameHandle>(null);
  const { recordPlay } = useProgress();
  const [status, setStatus] = useState<"idle" | "playing" | "ended">("idle");
  const [finalScore, setFinalScore] = useState<number | null>(null);
  const [isNewBest, setIsNewBest] = useState(false);

  const handleGameOver = (score: number) => {
    setFinalScore(score);
    setStatus("ended");
    const { isNewBest: nb } = recordPlay("snake", score, "higher");
    setIsNewBest(nb);
  };

  const handleRestart = () => {
    setStatus("playing");
    setFinalScore(null);
    setIsNewBest(false);
    gameRef.current?.start();
  };

  return (
    <GameShell
      id="snake"
      title="Snake"
      howTo={HOW_TO}
      status={status}
      result={
        finalScore !== null
          ? {
              score: finalScore,
              mode: "higher",
              extra: isNewBest ? (
                <span className="font-mono text-xs uppercase tracking-wider" style={{ color: "var(--accent)" }}>
                  ★ new best
                </span>
              ) : null,
            }
          : undefined
      }
      onRestart={handleRestart}
    >
      <div className="flex-1 flex items-center justify-center min-h-[440px] bg-gray-950 text-white">
        <SnakeGame ref={gameRef} onGameOver={handleGameOver} />
      </div>
    </GameShell>
  );
}
