"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import DownloadButton from "./DownloadButton";
import { useGameLoop } from "./useGameLoop";

const CANVAS_W = 360;
const CANVAS_H = 600;
const LANE_COUNT = 3;
const LANE_WIDTH = CANVAS_W / LANE_COUNT;
const CAR_W = 42;
const CAR_H = 72;
const CAR_Y = CANVAS_H - CAR_H - 24;
const ENEMY_W = 42;
const ENEMY_H = 72;

type GameState = "ready" | "playing" | "gameover";
type Enemy = { lane: number; y: number; color: string };

const ENEMY_COLORS = ["#ef4444", "#3b82f6", "#10b981", "#f59e0b", "#a855f7"];

function laneCenter(lane: number) {
  return lane * LANE_WIDTH + LANE_WIDTH / 2;
}

export default function CarRacer() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameState, setGameState] = useState<GameState>("ready");
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);

  const laneRef = useRef(1);
  const enemiesRef = useRef<Enemy[]>([]);
  const stateRef = useRef<GameState>("ready");
  const speedRef = useRef(4);
  const spawnCdRef = useRef(0);
  const scoreRef = useRef(0);
  const dashOffsetRef = useRef(0);

  const reset = useCallback(() => {
    laneRef.current = 1;
    enemiesRef.current = [];
    speedRef.current = 4;
    spawnCdRef.current = 0;
    scoreRef.current = 0;
    dashOffsetRef.current = 0;
    setScore(0);
  }, []);

  const start = useCallback(() => {
    reset();
    stateRef.current = "playing";
    setGameState("playing");
  }, [reset]);

  const gameOver = useCallback(() => {
    stateRef.current = "gameover";
    setGameState("gameover");
    setBest((prev) => {
      const next = Math.max(prev, Math.floor(scoreRef.current));
      try {
        localStorage.setItem("pb-carracer-best", String(next));
      } catch {}
      return next;
    });
  }, []);

  const move = useCallback((dir: -1 | 1) => {
    if (stateRef.current !== "playing") return;
    laneRef.current = Math.max(0, Math.min(LANE_COUNT - 1, laneRef.current + dir));
  }, []);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Road
    ctx.fillStyle = "#1f2937";
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

    // Lane dividers
    ctx.strokeStyle = "#fbbf24";
    ctx.lineWidth = 3;
    ctx.setLineDash([20, 20]);
    ctx.lineDashOffset = -dashOffsetRef.current;
    for (let i = 1; i < LANE_COUNT; i++) {
      ctx.beginPath();
      ctx.moveTo(i * LANE_WIDTH, 0);
      ctx.lineTo(i * LANE_WIDTH, CANVAS_H);
      ctx.stroke();
    }
    ctx.setLineDash([]);

    // Shoulders
    ctx.fillStyle = "#334155";
    ctx.fillRect(0, 0, 6, CANVAS_H);
    ctx.fillRect(CANVAS_W - 6, 0, 6, CANVAS_H);

    // Enemies
    for (const e of enemiesRef.current) {
      ctx.fillStyle = e.color;
      const x = laneCenter(e.lane) - ENEMY_W / 2;
      ctx.fillRect(x, e.y, ENEMY_W, ENEMY_H);
      ctx.fillStyle = "rgba(255,255,255,0.4)";
      ctx.fillRect(x + 6, e.y + 8, ENEMY_W - 12, 16);
      ctx.fillRect(x + 6, e.y + ENEMY_H - 24, ENEMY_W - 12, 16);
    }

    // Player
    const px = laneCenter(laneRef.current) - CAR_W / 2;
    ctx.fillStyle = "#22d3ee";
    ctx.fillRect(px, CAR_Y, CAR_W, CAR_H);
    ctx.fillStyle = "rgba(255,255,255,0.5)";
    ctx.fillRect(px + 6, CAR_Y + 8, CAR_W - 12, 18);
    ctx.fillRect(px + 6, CAR_Y + CAR_H - 26, CAR_W - 12, 18);
  }, []);

  const tick = useCallback(() => {
    if (stateRef.current === "playing") {
      const sp = speedRef.current;
      dashOffsetRef.current = (dashOffsetRef.current + sp) % 40;
      for (const e of enemiesRef.current) e.y += sp;
      enemiesRef.current = enemiesRef.current.filter((e) => e.y < CANVAS_H + 50);

      spawnCdRef.current -= 1;
      if (spawnCdRef.current <= 0) {
        const lane = Math.floor(Math.random() * LANE_COUNT);
        enemiesRef.current.push({
          lane,
          y: -ENEMY_H - 20,
          color: ENEMY_COLORS[Math.floor(Math.random() * ENEMY_COLORS.length)],
        });
        spawnCdRef.current = Math.max(18, 50 - Math.floor(scoreRef.current / 200));
      }

      scoreRef.current += 0.15 * (sp / 4);
      const newScore = Math.floor(scoreRef.current);
      setScore(newScore);
      speedRef.current = Math.min(12, 4 + newScore / 300);

      // Collision
      for (const e of enemiesRef.current) {
        if (
          e.lane === laneRef.current &&
          e.y + ENEMY_H > CAR_Y + 8 &&
          e.y < CAR_Y + CAR_H - 8
        ) {
          gameOver();
          break;
        }
      }
    }
    draw();
  }, [draw, gameOver]);

  useGameLoop(tick);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("pb-carracer-best");
      if (saved) setBest(parseInt(saved, 10) || 0);
    } catch {}
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft" || e.key === "a") {
        e.preventDefault();
        move(-1);
      } else if (e.key === "ArrowRight" || e.key === "d") {
        e.preventDefault();
        move(1);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [move]);

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex items-center gap-6 text-white text-lg">
        <div>
          Score: <span className="font-bold">{score}</span>
        </div>
        <div>
          Best: <span className="font-bold text-yellow-400">{best}</span>
        </div>
      </div>

      <div className="relative">
        <canvas
          ref={canvasRef}
          width={CANVAS_W}
          height={CANVAS_H}
          className="border-4 border-gray-700 rounded-lg max-w-full h-auto"
        />

        {gameState !== "playing" && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-lg">
            <div className="bg-white text-gray-900 px-8 py-6 rounded-lg text-center">
              {gameState === "ready" ? (
                <>
                  <div className="text-2xl font-bold mb-2">Car Racer</div>
                  <div className="text-sm text-gray-600 mb-4">Arrows / A / D to switch lanes</div>
                </>
              ) : (
                <>
                  <div className="text-2xl font-bold mb-2">Crash!</div>
                  <div className="mb-1">Score: {score}</div>
                  <div className="mb-3">
                    Best: <span className="text-yellow-600 font-bold">{best}</span>
                  </div>
                </>
              )}
              <button
                onClick={start}
                className="px-6 py-2 bg-cyan-600 text-white font-bold rounded-lg hover:bg-cyan-700"
              >
                {gameState === "ready" ? "Start" : "Play Again"}
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-3 md:hidden">
        <button
          onPointerDown={() => move(-1)}
          className="px-8 py-4 bg-gray-700 text-white text-2xl font-bold rounded"
        >
          ←
        </button>
        <button
          onPointerDown={() => move(1)}
          className="px-8 py-4 bg-gray-700 text-white text-2xl font-bold rounded"
        >
          →
        </button>
      </div>

      <DownloadButton canvasRef={canvasRef} filename="car-racer" />
    </div>
  );
}
