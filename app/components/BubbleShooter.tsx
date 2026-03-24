"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import DownloadButton from "./DownloadButton";

type Bubble = {
  x: number;
  y: number;
  color: string;
  row: number;
  col: number;
};

const CANVAS_WIDTH = 500;
const CANVAS_HEIGHT = 600;
const BUBBLE_RADIUS = 20;
const COLORS = ["#ef4444", "#f59e0b", "#22c55e", "#3b82f6", "#a855f7", "#ec4899"];

export default function BubbleShooter() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameState, setGameState] = useState<"start" | "playing" | "gameover">("start");
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);

  const bubblesRef = useRef<Bubble[]>([]);
  const shooterRef = useRef({ x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT - 60, angle: -Math.PI / 2 });
  const currentBubbleRef = useRef({ color: COLORS[0], x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT - 60 });
  const nextBubbleRef = useRef({ color: COLORS[1] });
  const projectileRef = useRef<{ x: number; y: number; vx: number; vy: number; color: string } | null>(null);
  const gameLoopRef = useRef<number | null>(null);
  const scoreRef = useRef(0);
  const levelRef = useRef(1);
  const mouseXRef = useRef(CANVAS_WIDTH / 2);
  const mouseYRef = useRef(CANVAS_HEIGHT / 2);

  const initBubbles = useCallback(() => {
    const bubbles: Bubble[] = [];
    const rows = 5 + Math.floor((levelRef.current - 1) / 2);
    for (let row = 0; row < rows; row++) {
      const cols = row % 2 === 0 ? 10 : 9;
      const offsetX = row % 2 === 0 ? BUBBLE_RADIUS : BUBBLE_RADIUS * 2;
      for (let col = 0; col < cols; col++) {
        bubbles.push({
          x: offsetX + col * BUBBLE_RADIUS * 2,
          y: 40 + row * BUBBLE_RADIUS * 1.8,
          color: COLORS[Math.floor(Math.random() * COLORS.length)],
          row,
          col,
        });
      }
    }
    return bubbles;
  }, []);

  const getNextColor = useCallback(() => {
    return COLORS[Math.floor(Math.random() * COLORS.length)];
  }, []);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Background
    ctx.fillStyle = "#1a1a2e";
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Grid bubbles
    bubblesRef.current.forEach((bubble) => {
      ctx.beginPath();
      ctx.arc(bubble.x, bubble.y, BUBBLE_RADIUS, 0, Math.PI * 2);
      ctx.fillStyle = bubble.color;
      ctx.fill();
      ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
      ctx.lineWidth = 2;
      ctx.stroke();
    });

    // Projectile
    if (projectileRef.current) {
      const p = projectileRef.current;
      ctx.beginPath();
      ctx.arc(p.x, p.y, BUBBLE_RADIUS, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.fill();
      ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    // Shooter
    const s = shooterRef.current;
    ctx.save();
    ctx.translate(s.x, s.y);
    ctx.rotate(s.angle);
    ctx.fillStyle = "#6b7280";
    ctx.fillRect(-10, -30, 20, 40);
    ctx.restore();

    // Current bubble at shooter
    if (!projectileRef.current) {
      const c = currentBubbleRef.current;
      ctx.beginPath();
      ctx.arc(c.x, c.y, BUBBLE_RADIUS, 0, Math.PI * 2);
      ctx.fillStyle = c.color;
      ctx.fill();
      ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    // Next bubble indicator
    ctx.fillStyle = "rgba(255, 255, 255, 0.1)";
    ctx.fillRect(10, CANVAS_HEIGHT - 100, 60, 80);
    ctx.fillStyle = "#9ca3af";
    ctx.font = "10px sans-serif";
    ctx.fillText("NEXT", 20, CANVAS_HEIGHT - 85);
    ctx.beginPath();
    ctx.arc(40, CANVAS_HEIGHT - 60, 15, 0, Math.PI * 2);
    ctx.fillStyle = nextBubbleRef.current.color;
    ctx.fill();
    ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Aim line
    if (!projectileRef.current) {
      ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
      ctx.lineWidth = 1;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(s.x, s.y);
      ctx.lineTo(s.x + Math.cos(s.angle) * 300, s.y + Math.sin(s.angle) * 300);
      ctx.stroke();
      ctx.setLineDash([]);
    }
  }, []);

  const findMatches = useCallback((bubbles: Bubble[], newBubble: Bubble): Bubble[] => {
    const matches: Bubble[] = [newBubble];
    const queue = [newBubble];
    const visited = new Set<Bubble>();
    visited.add(newBubble);

    while (queue.length > 0) {
      const current = queue.shift()!;
      for (const bubble of bubbles) {
        if (visited.has(bubble)) continue;
        if (bubble.color !== newBubble.color) continue;
        const dx = bubble.x - current.x;
        const dy = bubble.y - current.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < BUBBLE_RADIUS * 2.2) {
          visited.add(bubble);
          matches.push(bubble);
          queue.push(bubble);
        }
      }
    }
    return matches;
  }, []);

  const removeFloating = useCallback((bubbles: Bubble[]): Bubble[] => {
    const connected = new Set<Bubble>();
    const queue: Bubble[] = [];

    // Start with top row
    bubbles.forEach((b) => {
      if (b.row === 0) {
        connected.add(b);
        queue.push(b);
      }
    });

    while (queue.length > 0) {
      const current = queue.shift()!;
      for (const bubble of bubbles) {
        if (connected.has(bubble)) continue;
        const dx = bubble.x - current.x;
        const dy = bubble.y - current.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < BUBBLE_RADIUS * 2.2) {
          connected.add(bubble);
          queue.push(bubble);
        }
      }
    }

    return Array.from(connected);
  }, []);

  const gameLoop = useCallback(() => {
    if (gameState !== "playing") {
      gameLoopRef.current = null;
      return;
    }

    // Update aim angle
    const s = shooterRef.current;
    const dx = mouseXRef.current - s.x;
    const dy = mouseYRef.current - s.y;
    s.angle = Math.atan2(dy, dx);

    // Move projectile
    if (projectileRef.current) {
      const p = projectileRef.current;
      p.x += p.vx;
      p.y += p.vy;

      // Wall bounce
      if (p.x - BUBBLE_RADIUS <= 0 || p.x + BUBBLE_RADIUS >= CANVAS_WIDTH) {
        p.vx *= -1;
      }

      // Check collision with bubbles
      let collided = false;
      for (const bubble of bubblesRef.current) {
        const dx = p.x - bubble.x;
        const dy = p.y - bubble.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < BUBBLE_RADIUS * 2) {
          collided = true;
          break;
        }
      }

      // Check top
      if (p.y - BUBBLE_RADIUS <= 20) {
        collided = true;
      }

      if (collided) {
        // Snap to grid
        const row = Math.round((p.y - 40) / (BUBBLE_RADIUS * 1.8));
        const isEvenRow = row % 2 === 0;
        const offsetX = isEvenRow ? BUBBLE_RADIUS : BUBBLE_RADIUS * 2;
        const col = Math.round((p.x - offsetX) / (BUBBLE_RADIUS * 2));
        const snappedX = offsetX + col * BUBBLE_RADIUS * 2;
        const snappedY = 40 + row * BUBBLE_RADIUS * 1.8;

        const newBubble: Bubble = {
          x: Math.max(BUBBLE_RADIUS, Math.min(CANVAS_WIDTH - BUBBLE_RADIUS, snappedX)),
          y: Math.max(40, snappedY),
          color: p.color,
          row,
          col,
        };
        bubblesRef.current.push(newBubble);

        // Check matches
        const matches = findMatches(bubblesRef.current, newBubble);
        if (matches.length >= 3) {
          bubblesRef.current = bubblesRef.current.filter((b) => !matches.includes(b));
          scoreRef.current += matches.length * 10;
          setScore(scoreRef.current);

          // Remove floating
          bubblesRef.current = removeFloating(bubblesRef.current);
        }

        projectileRef.current = null;
        currentBubbleRef.current.color = nextBubbleRef.current.color;
        nextBubbleRef.current.color = getNextColor();

        // Check win
        if (bubblesRef.current.length === 0) {
          levelRef.current++;
          setLevel(levelRef.current);
          bubblesRef.current = initBubbles();
          scoreRef.current += 100;
          setScore(scoreRef.current);
        }

        // Check loss
        for (const bubble of bubblesRef.current) {
          if (bubble.y + BUBBLE_RADIUS >= CANVAS_HEIGHT - 100) {
            setGameState("gameover");
            gameLoopRef.current = null;
            draw();
            return;
          }
        }
      }

      // Remove if out of bounds
      if (p.y < -BUBBLE_RADIUS) {
        projectileRef.current = null;
        currentBubbleRef.current.color = nextBubbleRef.current.color;
        nextBubbleRef.current.color = getNextColor();
      }
    }

    draw();
    gameLoopRef.current = requestAnimationFrame(gameLoop);
  }, [gameState, draw, findMatches, removeFloating, getNextColor, initBubbles]);

  const shoot = useCallback(() => {
    if (projectileRef.current || gameState !== "playing") return;
    const s = shooterRef.current;
    const speed = 10;
    projectileRef.current = {
      x: s.x,
      y: s.y - 30,
      vx: Math.cos(s.angle) * speed,
      vy: Math.sin(s.angle) * speed,
      color: currentBubbleRef.current.color,
    };
  }, [gameState]);

  const startGame = useCallback(() => {
    bubblesRef.current = initBubbles();
    shooterRef.current = { x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT - 60, angle: -Math.PI / 2 };
    currentBubbleRef.current = { color: getNextColor(), x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT - 60 };
    nextBubbleRef.current = { color: getNextColor() };
    projectileRef.current = null;
    scoreRef.current = 0;
    levelRef.current = 1;
    setScore(0);
    setLevel(1);
    setGameState("playing");
    gameLoopRef.current = requestAnimationFrame(gameLoop);
  }, [initBubbles, getNextColor, gameLoop]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseXRef.current = (e.clientX - rect.left) * (CANVAS_WIDTH / rect.width);
      mouseYRef.current = (e.clientY - rect.top) * (CANVAS_HEIGHT / rect.height);
    };

    const handleClick = () => shoot();

    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      const rect = canvas.getBoundingClientRect();
      const touch = e.touches[0];
      mouseXRef.current = (touch.clientX - rect.left) * (CANVAS_WIDTH / rect.width);
      mouseYRef.current = (touch.clientY - rect.top) * (CANVAS_HEIGHT / rect.height);
    };

    const handleTouchEnd = (e: TouchEvent) => {
      e.preventDefault();
      shoot();
    };

    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("click", handleClick);
    canvas.addEventListener("touchmove", handleTouchMove, { passive: false });
    canvas.addEventListener("touchend", handleTouchEnd, { passive: false });

    return () => {
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("click", handleClick);
      canvas.removeEventListener("touchmove", handleTouchMove);
      canvas.removeEventListener("touchend", handleTouchEnd);
    };
  }, [shoot]);

  useEffect(() => {
    draw();
  }, [draw]);

  const handleShare = async () => {
    const text = `I reached level ${levelRef.current} with ${scoreRef.current} points in Bubble Shooter! Can you beat me? https://playmini.fun/bubble-shooter`;
    if (navigator.share) {
      try {
        await navigator.share({ text });
      } catch {}
    } else {
      try {
        await navigator.clipboard.writeText(text);
        alert("Copied!");
      } catch {}
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex gap-8 text-center">
        <div>
          <div className="text-xs text-gray-500 uppercase tracking-wider">Score</div>
          <div className="text-3xl font-black text-purple-400 tabular-nums">{score}</div>
        </div>
        <div>
          <div className="text-xs text-gray-500 uppercase tracking-wider">Level</div>
          <div className="text-3xl font-black text-blue-400 tabular-nums">{level}</div>
        </div>
      </div>

      <div className="relative">
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          className="rounded-2xl max-w-full h-auto border border-gray-800 cursor-crosshair"
        />

        {gameState === "start" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/85 rounded-2xl backdrop-blur-sm">
            <div className="text-6xl mb-3">🔵</div>
            <h2 className="text-3xl font-black text-purple-400 mb-2">Bubble Shooter</h2>
            <p className="text-gray-400 mb-6 text-sm">Aim and shoot to match 3+ bubbles</p>
            <button
              onClick={startGame}
              className="px-10 py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-2xl transition-all hover:scale-105 active:scale-95"
            >
              Play
            </button>
          </div>
        )}

        {gameState === "gameover" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/85 rounded-2xl backdrop-blur-sm">
            <h2 className="text-3xl font-black text-red-400 mb-4">Game Over</h2>
            <div className="bg-slate-900/80 rounded-xl px-6 py-3 mb-6">
              <p className="text-white text-lg font-bold">Score: {score}</p>
              <p className="text-gray-400 text-sm">Level: {level}</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={startGame}
                className="px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl transition-all hover:scale-105 active:scale-95"
              >
                Play Again
              </button>
              <button
                onClick={handleShare}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all hover:scale-105 active:scale-95"
              >
                Share
              </button>
              <DownloadButton canvasRef={canvasRef} filename="bubble-shooter-score" label="Save" />
            </div>
          </div>
        )}
      </div>

      <div className="text-center text-xs text-gray-600">
        <p>Click or tap to shoot • Match 3+ bubbles of same color</p>
      </div>
    </div>
  );
}
