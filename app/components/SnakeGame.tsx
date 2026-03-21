"use client";

import { useEffect, useRef, useState, useCallback } from "react";

type Direction = "UP" | "DOWN" | "LEFT" | "RIGHT";
type Position = { x: number; y: number };

const GRID_SIZE = 20;
const INITIAL_SPEED = 150;
const SPEED_INCREASE = 3;
const MIN_SPEED = 50;

export default function SnakeGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [displayState, setDisplayState] = useState<"START" | "PLAYING" | "PAUSED" | "GAME_OVER">("START");
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(0);

  const snakeRef = useRef<Position[]>([{ x: 10, y: 10 }]);
  const directionRef = useRef<Direction>("RIGHT");
  const nextDirectionRef = useRef<Direction>("RIGHT");
  const foodRef = useRef<Position>({ x: 15, y: 10 });
  const speedRef = useRef(INITIAL_SPEED);
  const lastMoveTimeRef = useRef(0);
  const gameLoopRef = useRef<number | null>(null);
  const scoreRef = useRef(0);
  const bestScoreRef = useRef(0);
  const gameStateRef = useRef<"START" | "PLAYING" | "PAUSED" | "GAME_OVER">("START");
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("pb-snake");
    if (saved) {
      const val = parseInt(saved, 10);
      setBestScore(val);
      bestScoreRef.current = val;
    }
  }, []);

  const generateFood = (snake: Position[]): Position => {
    let newFood: Position;
    do {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      };
    } while (snake.some((s) => s.x === newFood.x && s.y === newFood.y));
    return newFood;
  };

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const cellSize = canvas.width / GRID_SIZE;

    ctx.fillStyle = "#111827";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = "#1f2937";
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= GRID_SIZE; i++) {
      ctx.beginPath();
      ctx.moveTo(i * cellSize, 0);
      ctx.lineTo(i * cellSize, canvas.height);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, i * cellSize);
      ctx.lineTo(canvas.width, i * cellSize);
      ctx.stroke();
    }

    // Food
    const f = foodRef.current;
    ctx.fillStyle = "#ef4444";
    ctx.beginPath();
    ctx.arc(f.x * cellSize + cellSize / 2, f.y * cellSize + cellSize / 2, cellSize / 2 - 2, 0, Math.PI * 2);
    ctx.fill();

    // Snake
    snakeRef.current.forEach((seg, i) => {
      const r = cellSize / 2 - 1;
      ctx.fillStyle = i === 0 ? "#22c55e" : "#16a34a";
      ctx.beginPath();
      ctx.arc(seg.x * cellSize + cellSize / 2, seg.y * cellSize + cellSize / 2, r, 0, Math.PI * 2);
      ctx.fill();
    });
  }, []);

  const gameLoop = useCallback((timestamp: number) => {
    if (gameStateRef.current !== "PLAYING") {
      gameLoopRef.current = null;
      return;
    }

    if (timestamp - lastMoveTimeRef.current < speedRef.current) {
      gameLoopRef.current = requestAnimationFrame(gameLoop);
      return;
    }
    lastMoveTimeRef.current = timestamp;

    directionRef.current = nextDirectionRef.current;
    const snake = snakeRef.current;
    const head = snake[0];

    let newHead: Position;
    switch (directionRef.current) {
      case "UP": newHead = { x: head.x, y: head.y - 1 }; break;
      case "DOWN": newHead = { x: head.x, y: head.y + 1 }; break;
      case "LEFT": newHead = { x: head.x - 1, y: head.y }; break;
      case "RIGHT": newHead = { x: head.x + 1, y: head.y }; break;
    }

    if (newHead.x < 0 || newHead.x >= GRID_SIZE || newHead.y < 0 || newHead.y >= GRID_SIZE) {
      gameStateRef.current = "GAME_OVER";
      setDisplayState("GAME_OVER");
      gameLoopRef.current = null;
      return;
    }

    if (snake.some((s) => s.x === newHead.x && s.y === newHead.y)) {
      gameStateRef.current = "GAME_OVER";
      setDisplayState("GAME_OVER");
      gameLoopRef.current = null;
      return;
    }

    const newSnake = [newHead, ...snake];

    if (newHead.x === foodRef.current.x && newHead.y === foodRef.current.y) {
      snakeRef.current = newSnake;
      foodRef.current = generateFood(newSnake);
      scoreRef.current += 1;
      setScore(scoreRef.current);
      if (scoreRef.current > bestScoreRef.current) {
        bestScoreRef.current = scoreRef.current;
        setBestScore(scoreRef.current);
        localStorage.setItem("pb-snake", scoreRef.current.toString());
      }
      speedRef.current = Math.max(MIN_SPEED, speedRef.current - SPEED_INCREASE);
    } else {
      newSnake.pop();
      snakeRef.current = newSnake;
    }

    draw();
    gameLoopRef.current = requestAnimationFrame(gameLoop);
  }, [draw]);

  const startGame = useCallback(() => {
    snakeRef.current = [{ x: 10, y: 10 }];
    directionRef.current = "RIGHT";
    nextDirectionRef.current = "RIGHT";
    foodRef.current = generateFood([{ x: 10, y: 10 }]);
    speedRef.current = INITIAL_SPEED;
    lastMoveTimeRef.current = 0;
    scoreRef.current = 0;
    setScore(0);
    gameStateRef.current = "PLAYING";
    setDisplayState("PLAYING");
    draw();
    gameLoopRef.current = requestAnimationFrame(gameLoop);
  }, [draw, gameLoop]);

  const togglePause = useCallback(() => {
    if (gameStateRef.current === "PLAYING") {
      gameStateRef.current = "PAUSED";
      setDisplayState("PAUSED");
    } else if (gameStateRef.current === "PAUSED") {
      gameStateRef.current = "PLAYING";
      setDisplayState("PLAYING");
      lastMoveTimeRef.current = performance.now();
      gameLoopRef.current = requestAnimationFrame(gameLoop);
    }
  }, [gameLoop]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === " " || e.key === "Spacebar") {
        e.preventDefault();
        if (gameStateRef.current === "PLAYING" || gameStateRef.current === "PAUSED") {
          togglePause();
        }
        return;
      }

      if (gameStateRef.current !== "PLAYING") return;
      const cur = directionRef.current;

      if ((e.key === "ArrowUp" || e.key === "w" || e.key === "W") && cur !== "DOWN") {
        e.preventDefault(); nextDirectionRef.current = "UP";
      } else if ((e.key === "ArrowDown" || e.key === "s" || e.key === "S") && cur !== "UP") {
        e.preventDefault(); nextDirectionRef.current = "DOWN";
      } else if ((e.key === "ArrowLeft" || e.key === "a" || e.key === "A") && cur !== "RIGHT") {
        e.preventDefault(); nextDirectionRef.current = "LEFT";
      } else if ((e.key === "ArrowRight" || e.key === "d" || e.key === "D") && cur !== "LEFT") {
        e.preventDefault(); nextDirectionRef.current = "RIGHT";
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [togglePause]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleTouchStart = (e: TouchEvent) => {
      e.preventDefault();
      touchStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (!touchStartRef.current || gameStateRef.current !== "PLAYING") return;
      const dx = e.changedTouches[0].clientX - touchStartRef.current.x;
      const dy = e.changedTouches[0].clientY - touchStartRef.current.y;
      if (Math.abs(dx) < 30 && Math.abs(dy) < 30) return;
      const cur = directionRef.current;
      if (Math.abs(dx) > Math.abs(dy)) {
        if (dx > 0 && cur !== "LEFT") nextDirectionRef.current = "RIGHT";
        else if (dx < 0 && cur !== "RIGHT") nextDirectionRef.current = "LEFT";
      } else {
        if (dy > 0 && cur !== "UP") nextDirectionRef.current = "DOWN";
        else if (dy < 0 && cur !== "DOWN") nextDirectionRef.current = "UP";
      }
      touchStartRef.current = null;
    };

    canvas.addEventListener("touchstart", handleTouchStart, { passive: false });
    canvas.addEventListener("touchend", handleTouchEnd);
    return () => {
      canvas.removeEventListener("touchstart", handleTouchStart);
      canvas.removeEventListener("touchend", handleTouchEnd);
    };
  }, []);

  useEffect(() => { draw(); }, [draw]);

  const handleShare = async () => {
    const text = `I scored ${scoreRef.current} in Snake! Can you beat me? https://playmini.fun/snake`;
    if (navigator.share) {
      try { await navigator.share({ text }); } catch {}
    } else {
      try { await navigator.clipboard.writeText(text); alert("Copied!"); } catch {}
    }
  };

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="flex gap-8 text-center">
        <div>
          <div className="text-sm text-gray-400">Score</div>
          <div className="text-3xl font-bold text-green-500">{score}</div>
        </div>
        <div>
          <div className="text-sm text-gray-400">Best</div>
          <div className="text-3xl font-bold text-yellow-500">{bestScore}</div>
        </div>
      </div>

      <div className="relative">
        <canvas
          ref={canvasRef}
          width={400}
          height={400}
          className="rounded-xl border-2 border-gray-700 max-w-full h-auto"
          style={{ touchAction: "none" }}
        />

        {displayState === "START" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900/90 rounded-xl">
            <h2 className="text-3xl font-bold text-green-500 mb-4">Snake</h2>
            <p className="text-gray-300 mb-6 text-center px-4">Arrow keys or swipe to move</p>
            <button
              onClick={startGame}
              className="px-8 py-3 bg-green-600 hover:bg-green-500 text-white font-bold rounded-xl transition-colors"
            >
              Start Game
            </button>
          </div>
        )}

        {displayState === "PAUSED" && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900/90 rounded-xl">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-yellow-500 mb-2">Paused</h2>
              <p className="text-gray-300">Press Space to resume</p>
            </div>
          </div>
        )}

        {displayState === "GAME_OVER" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900/90 rounded-xl">
            <h2 className="text-3xl font-bold text-red-500 mb-4">Game Over</h2>
            <p className="text-gray-300 mb-1">Score: {score}</p>
            <p className="text-gray-400 mb-6">Best: {bestScore}</p>
            <div className="flex gap-3">
              <button
                onClick={startGame}
                className="px-6 py-3 bg-green-600 hover:bg-green-500 text-white font-bold rounded-xl transition-colors"
              >
                Play Again
              </button>
              <button
                onClick={handleShare}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-colors"
              >
                Share
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="text-center text-sm text-gray-500">
        {displayState === "PLAYING" && <p>Space to pause</p>}
      </div>
    </div>
  );
}
