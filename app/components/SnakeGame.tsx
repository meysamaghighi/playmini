"use client";

import { useEffect, useRef, useState, useCallback } from "react";

type Direction = "UP" | "DOWN" | "LEFT" | "RIGHT";
type Position = { x: number; y: number };

const GRID_SIZE = 20;
const INITIAL_SPEED = 140;
const SPEED_INCREASE = 2;
const MIN_SPEED = 45;

export default function SnakeGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [displayState, setDisplayState] = useState<"START" | "PLAYING" | "PAUSED" | "GAME_OVER">("START");
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const [scoreFlash, setScoreFlash] = useState(false);

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
  const foodAnimRef = useRef(0);

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

  const draw = useCallback((timestamp?: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const cell = canvas.width / GRID_SIZE;
    const t = timestamp || 0;

    // Background
    ctx.fillStyle = "#0f172a";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Subtle grid dots
    ctx.fillStyle = "#1e293b";
    for (let x = 0; x < GRID_SIZE; x++) {
      for (let y = 0; y < GRID_SIZE; y++) {
        ctx.beginPath();
        ctx.arc(x * cell + cell / 2, y * cell + cell / 2, 1, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Food with pulsing glow
    const f = foodRef.current;
    const fx = f.x * cell + cell / 2;
    const fy = f.y * cell + cell / 2;
    const pulse = 1 + 0.15 * Math.sin(t * 0.005);
    const glowR = cell * 0.8 * pulse;

    // Glow
    const glow = ctx.createRadialGradient(fx, fy, 0, fx, fy, glowR);
    glow.addColorStop(0, "rgba(239, 68, 68, 0.4)");
    glow.addColorStop(1, "rgba(239, 68, 68, 0)");
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(fx, fy, glowR, 0, Math.PI * 2);
    ctx.fill();

    // Food circle
    ctx.fillStyle = "#ef4444";
    ctx.beginPath();
    ctx.arc(fx, fy, cell / 2 - 3, 0, Math.PI * 2);
    ctx.fill();
    // Food highlight
    ctx.fillStyle = "rgba(255,255,255,0.3)";
    ctx.beginPath();
    ctx.arc(fx - 2, fy - 2, cell / 6, 0, Math.PI * 2);
    ctx.fill();

    // Snake body - connected rounded segments
    const snake = snakeRef.current;
    const len = snake.length;

    // Draw body connections first (behind circles)
    for (let i = 0; i < len - 1; i++) {
      const curr = snake[i];
      const next = snake[i + 1];
      const progress = i / Math.max(len - 1, 1);
      const r = Math.round(34 - progress * 12);
      const g = Math.round(197 - progress * 60);
      const b = Math.round(94 - progress * 30);
      ctx.fillStyle = `rgb(${r},${g},${b})`;

      const cx = curr.x * cell + cell / 2;
      const cy = curr.y * cell + cell / 2;
      const nx = next.x * cell + cell / 2;
      const ny = next.y * cell + cell / 2;
      const bodyW = cell - 6;

      // Draw connecting rectangle
      if (curr.x !== next.x) {
        const minX = Math.min(cx, nx);
        ctx.fillRect(minX, cy - bodyW / 2, Math.abs(cx - nx), bodyW);
      } else {
        const minY = Math.min(cy, ny);
        ctx.fillRect(cx - bodyW / 2, minY, bodyW, Math.abs(cy - ny));
      }
    }

    // Draw circles for each segment
    for (let i = len - 1; i >= 0; i--) {
      const seg = snake[i];
      const progress = i / Math.max(len - 1, 1);
      const r = Math.round(34 - progress * 12);
      const g = Math.round(197 - progress * 60);
      const b = Math.round(94 - progress * 30);
      const segR = (cell - 6) / 2;
      const sx = seg.x * cell + cell / 2;
      const sy = seg.y * cell + cell / 2;

      ctx.fillStyle = `rgb(${r},${g},${b})`;
      ctx.beginPath();
      ctx.arc(sx, sy, segR, 0, Math.PI * 2);
      ctx.fill();
    }

    // Head with eyes
    if (len > 0) {
      const head = snake[0];
      const hx = head.x * cell + cell / 2;
      const hy = head.y * cell + cell / 2;
      const dir = directionRef.current;

      // Eye positions based on direction
      let e1x = 0, e1y = 0, e2x = 0, e2y = 0;
      const eyeOff = cell * 0.18;
      const eyeFwd = cell * 0.12;

      switch (dir) {
        case "RIGHT": e1x = eyeFwd; e1y = -eyeOff; e2x = eyeFwd; e2y = eyeOff; break;
        case "LEFT":  e1x = -eyeFwd; e1y = -eyeOff; e2x = -eyeFwd; e2y = eyeOff; break;
        case "UP":    e1x = -eyeOff; e1y = -eyeFwd; e2x = eyeOff; e2y = -eyeFwd; break;
        case "DOWN":  e1x = -eyeOff; e1y = eyeFwd; e2x = eyeOff; e2y = eyeFwd; break;
      }

      // Eye whites
      ctx.fillStyle = "white";
      ctx.beginPath();
      ctx.arc(hx + e1x, hy + e1y, cell * 0.12, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(hx + e2x, hy + e2y, cell * 0.12, 0, Math.PI * 2);
      ctx.fill();

      // Pupils
      ctx.fillStyle = "#111";
      ctx.beginPath();
      ctx.arc(hx + e1x, hy + e1y, cell * 0.06, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(hx + e2x, hy + e2y, cell * 0.06, 0, Math.PI * 2);
      ctx.fill();
    }
  }, []);

  const gameLoop = useCallback((timestamp: number) => {
    if (gameStateRef.current !== "PLAYING") {
      gameLoopRef.current = null;
      return;
    }

    foodAnimRef.current = timestamp;

    if (timestamp - lastMoveTimeRef.current < speedRef.current) {
      draw(timestamp);
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
      draw(timestamp);
      return;
    }

    if (snake.some((s) => s.x === newHead.x && s.y === newHead.y)) {
      gameStateRef.current = "GAME_OVER";
      setDisplayState("GAME_OVER");
      gameLoopRef.current = null;
      draw(timestamp);
      return;
    }

    const newSnake = [newHead, ...snake];

    if (newHead.x === foodRef.current.x && newHead.y === foodRef.current.y) {
      snakeRef.current = newSnake;
      foodRef.current = generateFood(newSnake);
      scoreRef.current += 1;
      setScore(scoreRef.current);
      setScoreFlash(true);
      setTimeout(() => setScoreFlash(false), 300);
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

    draw(timestamp);
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
    draw(0);
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

  // Keyboard
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

  // Touch - on the whole container, not just canvas
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const handleTouchStart = (e: TouchEvent) => {
      if (gameStateRef.current !== "PLAYING") return;
      e.preventDefault();
      touchStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (gameStateRef.current === "PLAYING") e.preventDefault();
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (!touchStartRef.current || gameStateRef.current !== "PLAYING") return;
      const dx = e.changedTouches[0].clientX - touchStartRef.current.x;
      const dy = e.changedTouches[0].clientY - touchStartRef.current.y;
      if (Math.abs(dx) < 20 && Math.abs(dy) < 20) return;
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

    el.addEventListener("touchstart", handleTouchStart, { passive: false });
    el.addEventListener("touchmove", handleTouchMove, { passive: false });
    el.addEventListener("touchend", handleTouchEnd);
    return () => {
      el.removeEventListener("touchstart", handleTouchStart);
      el.removeEventListener("touchmove", handleTouchMove);
      el.removeEventListener("touchend", handleTouchEnd);
    };
  }, []);

  useEffect(() => { draw(0); }, [draw]);

  const handleShare = async () => {
    const text = `I scored ${scoreRef.current} in Snake! Can you beat me? https://playmini.fun/snake`;
    if (navigator.share) {
      try { await navigator.share({ text }); } catch {}
    } else {
      try { await navigator.clipboard.writeText(text); alert("Copied!"); } catch {}
    }
  };

  return (
    <div ref={containerRef} className="flex flex-col items-center gap-4" style={{ touchAction: "none" }}>
      {/* Score */}
      <div className="flex gap-8 text-center">
        <div>
          <div className="text-xs text-gray-500 uppercase tracking-wider">Score</div>
          <div className={`text-3xl font-black tabular-nums transition-all duration-150 ${
            scoreFlash ? "text-yellow-400 scale-125" : "text-green-400"
          }`}>{score}</div>
        </div>
        <div>
          <div className="text-xs text-gray-500 uppercase tracking-wider">Best</div>
          <div className="text-3xl font-black text-amber-400 tabular-nums">{bestScore}</div>
        </div>
      </div>

      {/* Canvas */}
      <div className="relative">
        <canvas
          ref={canvasRef}
          width={400}
          height={400}
          className="rounded-2xl max-w-full h-auto"
          style={{ touchAction: "none" }}
        />

        {displayState === "START" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/85 rounded-2xl backdrop-blur-sm">
            <div className="text-6xl mb-3">🐍</div>
            <h2 className="text-3xl font-black text-green-400 mb-2">Snake</h2>
            <p className="text-gray-400 mb-6 text-sm">Arrow keys or swipe to move</p>
            <button
              onClick={startGame}
              className="px-10 py-3 bg-green-600 hover:bg-green-500 text-white font-bold rounded-2xl transition-all hover:scale-105 active:scale-95"
            >
              Play
            </button>
          </div>
        )}

        {displayState === "PAUSED" && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-950/85 rounded-2xl backdrop-blur-sm">
            <div className="text-center">
              <h2 className="text-3xl font-black text-yellow-400 mb-2">Paused</h2>
              <p className="text-gray-400 text-sm">Press Space to resume</p>
            </div>
          </div>
        )}

        {displayState === "GAME_OVER" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/85 rounded-2xl backdrop-blur-sm">
            <h2 className="text-3xl font-black text-red-400 mb-4">Game Over</h2>
            <div className="bg-slate-900/80 rounded-xl px-6 py-3 mb-6">
              <p className="text-white text-lg font-bold">Score: {score}</p>
              {score >= bestScore && score > 0 && (
                <p className="text-yellow-400 text-sm font-bold mt-1">New Best!</p>
              )}
            </div>
            <div className="flex gap-3">
              <button
                onClick={startGame}
                className="px-6 py-3 bg-green-600 hover:bg-green-500 text-white font-bold rounded-xl transition-all hover:scale-105 active:scale-95"
              >
                Play Again
              </button>
              <button
                onClick={handleShare}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all hover:scale-105 active:scale-95"
              >
                Share
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="text-center text-xs text-gray-600">
        {displayState === "PLAYING" && <p>Space to pause</p>}
      </div>
    </div>
  );
}
