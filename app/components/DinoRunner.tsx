"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useGameLoop } from "./useGameLoop";

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 260;
const GROUND_Y = 220;
const DINO_X = 60;
const DINO_WIDTH = 40;
const DINO_HEIGHT = 44;
const DINO_DUCK_HEIGHT = 26;
const GRAVITY = 0.7;
const JUMP_VELOCITY = -13;

type GameState = "ready" | "playing" | "gameover";
type Obstacle = { x: number; y: number; w: number; h: number; kind: "cactus" | "bird" };

function randomCactus(baseX: number): Obstacle {
  const tall = Math.random() < 0.4;
  const w = 16 + Math.random() * 18;
  const h = tall ? 46 : 30;
  return { x: baseX, y: GROUND_Y - h, w, h, kind: "cactus" };
}

function randomBird(baseX: number): Obstacle {
  const heights = [GROUND_Y - 60, GROUND_Y - 90];
  const y = heights[Math.floor(Math.random() * heights.length)];
  return { x: baseX, y, w: 34, h: 22, kind: "bird" };
}

export default function DinoRunner() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameState, setGameState] = useState<GameState>("ready");
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);

  const dinoYRef = useRef(GROUND_Y - DINO_HEIGHT);
  const dinoVRef = useRef(0);
  const duckingRef = useRef(false);
  const jumpingRef = useRef(false);
  const obstaclesRef = useRef<Obstacle[]>([]);
  const speedRef = useRef(6);
  const spawnCdRef = useRef(90);
  const scoreRef = useRef(0);
  const stateRef = useRef<GameState>("ready");
  const groundOffsetRef = useRef(0);

  const reset = useCallback(() => {
    dinoYRef.current = GROUND_Y - DINO_HEIGHT;
    dinoVRef.current = 0;
    duckingRef.current = false;
    jumpingRef.current = false;
    obstaclesRef.current = [];
    speedRef.current = 6;
    spawnCdRef.current = 90;
    scoreRef.current = 0;
    setScore(0);
  }, []);

  const gameOver = useCallback(() => {
    stateRef.current = "gameover";
    setGameState("gameover");
    setBest((prev) => {
      const next = Math.max(prev, Math.floor(scoreRef.current));
      try {
        localStorage.setItem("pb-dino-best", String(next));
      } catch {}
      return next;
    });
  }, []);

  const jump = useCallback(() => {
    if (stateRef.current === "ready") {
      reset();
      stateRef.current = "playing";
      setGameState("playing");
      jumpingRef.current = true;
      dinoVRef.current = JUMP_VELOCITY;
      return;
    }
    if (stateRef.current === "gameover") {
      reset();
      stateRef.current = "ready";
      setGameState("ready");
      return;
    }
    const dinoH = duckingRef.current ? DINO_DUCK_HEIGHT : DINO_HEIGHT;
    const onGround = dinoYRef.current >= GROUND_Y - dinoH - 0.5;
    if (onGround) {
      jumpingRef.current = true;
      dinoVRef.current = JUMP_VELOCITY;
    }
  }, [reset]);

  const setDuck = useCallback((v: boolean) => {
    duckingRef.current = v;
  }, []);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = "#f7f7f7";
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    ctx.strokeStyle = "#535353";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, GROUND_Y);
    ctx.lineTo(CANVAS_WIDTH, GROUND_Y);
    ctx.stroke();

    ctx.fillStyle = "#535353";
    for (let x = -groundOffsetRef.current; x < CANVAS_WIDTH; x += 40) {
      ctx.fillRect(x, GROUND_Y + 4, 20, 2);
    }

    const dinoH = duckingRef.current ? DINO_DUCK_HEIGHT : DINO_HEIGHT;
    const dinoW = duckingRef.current ? DINO_WIDTH + 14 : DINO_WIDTH;
    ctx.fillStyle = "#535353";
    ctx.fillRect(DINO_X, dinoYRef.current, dinoW, dinoH);
    ctx.fillStyle = "#fff";
    ctx.fillRect(DINO_X + dinoW - 10, dinoYRef.current + 6, 3, 3);

    for (const o of obstaclesRef.current) {
      if (o.kind === "cactus") {
        ctx.fillStyle = "#2d7d32";
        ctx.fillRect(o.x, o.y, o.w, o.h);
      } else {
        ctx.fillStyle = "#666";
        ctx.fillRect(o.x, o.y, o.w, o.h);
        ctx.fillRect(o.x - 6, o.y + 8, 8, 3);
        ctx.fillRect(o.x + o.w - 2, o.y + 8, 8, 3);
      }
    }

    ctx.fillStyle = "#535353";
    ctx.font = "bold 16px monospace";
    ctx.textAlign = "right";
    ctx.fillText(
      `HI ${String(best).padStart(5, "0")}  ${String(Math.floor(scoreRef.current)).padStart(5, "0")}`,
      CANVAS_WIDTH - 10,
      24
    );
  }, [best]);

  const tick = useCallback(() => {
    if (stateRef.current === "playing") {
      const dinoH = duckingRef.current ? DINO_DUCK_HEIGHT : DINO_HEIGHT;
      dinoVRef.current += GRAVITY;
      dinoYRef.current += dinoVRef.current;
      if (dinoYRef.current >= GROUND_Y - dinoH) {
        dinoYRef.current = GROUND_Y - dinoH;
        dinoVRef.current = 0;
        jumpingRef.current = false;
      }

      const sp = speedRef.current;
      groundOffsetRef.current = (groundOffsetRef.current + sp) % 40;

      for (const o of obstaclesRef.current) o.x -= sp;
      obstaclesRef.current = obstaclesRef.current.filter((o) => o.x + o.w > 0);

      spawnCdRef.current -= 1;
      if (spawnCdRef.current <= 0) {
        const newOb =
          scoreRef.current > 400 && Math.random() < 0.25
            ? randomBird(CANVAS_WIDTH + 20)
            : randomCactus(CANVAS_WIDTH + 20);
        obstaclesRef.current.push(newOb);
        spawnCdRef.current = 60 + Math.floor(Math.random() * 70);
      }

      scoreRef.current += 0.1 * (sp / 6);
      if (Math.floor(scoreRef.current) % 100 === 0 && Math.floor(scoreRef.current) > 0) {
        speedRef.current = Math.min(14, 6 + Math.floor(scoreRef.current) / 200);
      }
      setScore(Math.floor(scoreRef.current));

      const dinoW = duckingRef.current ? DINO_WIDTH + 14 : DINO_WIDTH;
      for (const o of obstaclesRef.current) {
        if (
          DINO_X + 4 < o.x + o.w - 4 &&
          DINO_X + dinoW - 4 > o.x + 4 &&
          dinoYRef.current + 4 < o.y + o.h - 2 &&
          dinoYRef.current + dinoH - 2 > o.y + 2
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
      const saved = localStorage.getItem("pb-dino-best");
      if (saved) setBest(parseInt(saved, 10) || 0);
    } catch {}
    reset();
  }, [reset]);

  useEffect(() => {
    const onDown = (e: KeyboardEvent) => {
      if (e.code === "Space" || e.key === "ArrowUp" || e.key === "w") {
        e.preventDefault();
        jump();
      }
      if (e.key === "ArrowDown" || e.key === "s") {
        e.preventDefault();
        setDuck(true);
      }
    };
    const onUp = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown" || e.key === "s") setDuck(false);
    };
    window.addEventListener("keydown", onDown);
    window.addEventListener("keyup", onUp);
    return () => {
      window.removeEventListener("keydown", onDown);
      window.removeEventListener("keyup", onUp);
    };
  }, [jump, setDuck]);

  return (
    <div className="flex flex-col items-center gap-4">
      <div
        className="relative cursor-pointer touch-none select-none w-full max-w-4xl"
        onPointerDown={(e) => {
          e.preventDefault();
          jump();
        }}
      >
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          className="border-2 border-gray-400 rounded bg-gray-50 max-w-full h-auto w-full"
        />

        {gameState === "ready" && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/10 rounded pointer-events-none">
            <div className="bg-white text-gray-900 px-6 py-4 rounded shadow text-center">
              <div className="font-bold text-xl mb-1">Press Space or Tap to Start</div>
              <div className="text-sm text-ink-3">Jump over obstacles, duck for birds</div>
            </div>
          </div>
        )}

        {gameState === "gameover" && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded pointer-events-none">
            <div className="bg-white text-gray-900 px-8 py-6 rounded shadow text-center">
              <div className="text-2xl font-bold mb-2">Game Over</div>
              <div className="mb-1">Score: {score}</div>
              <div className="mb-3">
                Best: <span className="text-yellow-600 font-bold">{best}</span>
              </div>
              <div className="text-sm text-ink-3">Tap to play again</div>
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-4 md:hidden">
        <button
          onPointerDown={(e) => {
            e.preventDefault();
            jump();
          }}
          className="px-6 py-3 bg-paper-2 text-ink rounded font-bold"
        >
          Jump
        </button>
        <button
          onPointerDown={(e) => {
            e.preventDefault();
            setDuck(true);
          }}
          onPointerUp={() => setDuck(false)}
          onPointerLeave={() => setDuck(false)}
          className="px-6 py-3 bg-paper-2 text-ink rounded font-bold"
        >
          Duck
        </button>
      </div>
    </div>
  );
}
