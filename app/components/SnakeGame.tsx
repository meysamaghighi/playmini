"use client";

import { useEffect, useRef, useState, useCallback, useImperativeHandle, forwardRef } from "react";
import { useGameLoop } from "./useGameLoop";

const GRID = 20;
const CELL = 20;
const CANVAS = GRID * CELL;

type Cell = { x: number; y: number };
type Dir = "up" | "down" | "left" | "right";
type GameState = "ready" | "playing" | "gameover";

const DIRS: Record<Dir, Cell> = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
};

const OPPOSITE: Record<Dir, Dir> = {
  up: "down",
  down: "up",
  left: "right",
  right: "left",
};

function randomFood(snake: Cell[]): Cell {
  while (true) {
    const c = { x: Math.floor(Math.random() * GRID), y: Math.floor(Math.random() * GRID) };
    if (!snake.some((s) => s.x === c.x && s.y === c.y)) return c;
  }
}

export type SnakeGameHandle = { start: () => void };

export type SnakeGameProps = {
  /** Called when the game ends. Score is the final value. When provided,
   * SnakeGame suppresses its own game-over modal so a parent shell can
   * own the end-state UI. */
  onGameOver?: (score: number) => void;
};

const SnakeGame = forwardRef<SnakeGameHandle, SnakeGameProps>(function SnakeGame(
  { onGameOver },
  ref
) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameState, setGameState] = useState<GameState>("ready");
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);

  const snakeRef = useRef<Cell[]>([{ x: 10, y: 10 }]);
  const dirRef = useRef<Dir>("right");
  const nextDirRef = useRef<Dir>("right");
  const foodRef = useRef<Cell>({ x: 5, y: 5 });
  const scoreRef = useRef(0);
  const stateRef = useRef<GameState>("ready");
  const lastTickRef = useRef(0);

  const speedMs = useCallback(() => {
    return Math.max(70, 160 - Math.floor(scoreRef.current / 5) * 10);
  }, []);

  const reset = useCallback(() => {
    snakeRef.current = [
      { x: 10, y: 10 },
      { x: 9, y: 10 },
      { x: 8, y: 10 },
    ];
    dirRef.current = "right";
    nextDirRef.current = "right";
    foodRef.current = randomFood(snakeRef.current);
    scoreRef.current = 0;
    setScore(0);
  }, []);

  const gameOver = useCallback(() => {
    stateRef.current = "gameover";
    setGameState("gameover");
    setBest((prev) => {
      const next = Math.max(prev, scoreRef.current);
      try {
        localStorage.setItem("pb-snake-best", String(next));
      } catch {}
      return next;
    });
    onGameOver?.(scoreRef.current);
  }, [onGameOver]);

  const start = useCallback(() => {
    reset();
    stateRef.current = "playing";
    setGameState("playing");
  }, [reset]);

  useImperativeHandle(ref, () => ({ start }), [start]);

  const step = useCallback(() => {
    dirRef.current = nextDirRef.current;
    const d = DIRS[dirRef.current];
    const head = snakeRef.current[0];
    const newHead = { x: head.x + d.x, y: head.y + d.y };

    if (
      newHead.x < 0 ||
      newHead.x >= GRID ||
      newHead.y < 0 ||
      newHead.y >= GRID ||
      snakeRef.current.some((s) => s.x === newHead.x && s.y === newHead.y)
    ) {
      gameOver();
      return;
    }

    const ate = newHead.x === foodRef.current.x && newHead.y === foodRef.current.y;
    const nextSnake = [newHead, ...snakeRef.current];
    if (!ate) nextSnake.pop();
    snakeRef.current = nextSnake;

    if (ate) {
      scoreRef.current += 10;
      setScore(scoreRef.current);
      foodRef.current = randomFood(snakeRef.current);
    }
  }, [gameOver]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = "#0f172a";
    ctx.fillRect(0, 0, CANVAS, CANVAS);
    ctx.strokeStyle = "#1e293b";
    ctx.lineWidth = 1;
    for (let i = 0; i <= GRID; i++) {
      ctx.beginPath();
      ctx.moveTo(i * CELL, 0);
      ctx.lineTo(i * CELL, CANVAS);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, i * CELL);
      ctx.lineTo(CANVAS, i * CELL);
      ctx.stroke();
    }

    const f = foodRef.current;
    ctx.fillStyle = "#ef4444";
    ctx.beginPath();
    ctx.arc(f.x * CELL + CELL / 2, f.y * CELL + CELL / 2, CELL / 2 - 2, 0, Math.PI * 2);
    ctx.fill();

    snakeRef.current.forEach((s, i) => {
      ctx.fillStyle = i === 0 ? "#22c55e" : "#16a34a";
      ctx.fillRect(s.x * CELL + 1, s.y * CELL + 1, CELL - 2, CELL - 2);
    });
  }, []);

  const tick = useCallback(
    (dt: number) => {
      if (stateRef.current === "playing") {
        lastTickRef.current += dt;
        if (lastTickRef.current >= speedMs()) {
          lastTickRef.current = 0;
          step();
        }
      }
      draw();
    },
    [draw, speedMs, step]
  );

  useGameLoop(tick);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("pb-snake-best");
      if (saved) setBest(parseInt(saved, 10) || 0);
    } catch {}
    reset();
  }, [reset]);

  useEffect(() => {
    const map: Record<string, Dir> = {
      ArrowUp: "up",
      ArrowDown: "down",
      ArrowLeft: "left",
      ArrowRight: "right",
      w: "up",
      s: "down",
      a: "left",
      d: "right",
    };
    const onKey = (e: KeyboardEvent) => {
      const dir = map[e.key] || map[e.key.toLowerCase()];
      if (!dir) return;
      e.preventDefault();
      if (stateRef.current !== "playing") return;
      if (dir === OPPOSITE[dirRef.current]) return;
      nextDirRef.current = dir;
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const turn = (dir: Dir) => {
    if (stateRef.current !== "playing") return;
    if (dir === OPPOSITE[dirRef.current]) return;
    nextDirRef.current = dir;
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex items-center justify-between w-full max-w-md text-white">
        <div className="text-lg">
          Score: <span className="font-bold">{score}</span>
        </div>
        <div className="text-lg">
          Best: <span className="font-bold text-yellow-400">{best}</span>
        </div>
      </div>

      <div className="relative">
        <canvas
          ref={canvasRef}
          width={CANVAS}
          height={CANVAS}
          className="border-4 border-line rounded-lg max-w-full h-auto"
        />

        {gameState !== "playing" && !(onGameOver && gameState === "gameover") && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-lg">
            <div className="bg-white text-gray-900 px-8 py-6 rounded-lg text-center">
              {gameState === "ready" ? (
                <>
                  <div className="text-2xl font-bold mb-2">Snake</div>
                  <div className="text-sm text-ink-3 mb-4">Arrows / WASD / Swipe</div>
                </>
              ) : (
                <>
                  <div className="text-2xl font-bold mb-2">Game Over</div>
                  <div className="mb-1">Score: {score}</div>
                  <div className="mb-3">
                    Best: <span className="text-yellow-600 font-bold">{best}</span>
                  </div>
                </>
              )}
              <button
                onClick={start}
                className="px-6 py-2 bg-green-500 text-ink font-bold rounded-lg hover:bg-green-600"
              >
                {gameState === "ready" ? "Start" : "Play Again"}
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-3 gap-2 w-48 md:hidden">
        <div />
        <button
          onPointerDown={() => turn("up")}
          className="p-3 bg-gray-700 text-white rounded font-bold"
        >
          ↑
        </button>
        <div />
        <button
          onPointerDown={() => turn("left")}
          className="p-3 bg-gray-700 text-white rounded font-bold"
        >
          ←
        </button>
        <button
          onPointerDown={() => turn("down")}
          className="p-3 bg-gray-700 text-white rounded font-bold"
        >
          ↓
        </button>
        <button
          onPointerDown={() => turn("right")}
          className="p-3 bg-gray-700 text-white rounded font-bold"
        >
          →
        </button>
      </div>
    </div>
  );
});

export default SnakeGame;
