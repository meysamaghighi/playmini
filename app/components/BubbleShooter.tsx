"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useGameLoop } from "./useGameLoop";

const CANVAS_W = 420;
const CANVAS_H = 600;
const BUBBLE_R = 18;
const GRID_COLS = 11;
const ROW_H = BUBBLE_R * Math.sqrt(3);
const DANGER_ROW = 14;
const SHOOTER_Y = CANVAS_H - 40;

const COLORS = ["#ef4444", "#3b82f6", "#22c55e", "#f59e0b", "#a855f7"];

type Bubble = { row: number; col: number; color: string };
type FlyingBubble = { x: number; y: number; vx: number; vy: number; color: string };
type GameState = "playing" | "gameover" | "won";

function bubblePos(row: number, col: number): { x: number; y: number } {
  const xOffset = row % 2 === 0 ? BUBBLE_R : BUBBLE_R * 2;
  return { x: xOffset + col * BUBBLE_R * 2, y: BUBBLE_R + row * ROW_H };
}

function neighborsOf(row: number, col: number): { row: number; col: number }[] {
  const even = row % 2 === 0;
  const dx = even
    ? [-1, 1, -1, 0, 0, 1]
    : [0, 1, -1, 0, 0, 1];
  const dy = even
    ? [-1, -1, 0, -1, 1, 0]
    : [-1, -1, 0, 1, -1, 0];
  // Simpler: use flat offsets
  const offsets = even
    ? [
        [-1, -1], [-1, 0],
        [0, -1], [0, 1],
        [1, -1], [1, 0],
      ]
    : [
        [-1, 0], [-1, 1],
        [0, -1], [0, 1],
        [1, 0], [1, 1],
      ];
  void dx;
  void dy;
  return offsets.map(([dr, dc]) => ({ row: row + dr, col: col + dc }));
}

function initialGrid(): Bubble[] {
  const out: Bubble[] = [];
  for (let r = 0; r < 6; r++) {
    const cols = r % 2 === 0 ? GRID_COLS : GRID_COLS - 1;
    for (let c = 0; c < cols; c++) {
      out.push({ row: r, col: c, color: COLORS[Math.floor(Math.random() * 3)] });
    }
  }
  return out;
}

export default function BubbleShooter() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameState, setGameState] = useState<GameState>("playing");
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);

  const bubblesRef = useRef<Bubble[]>(initialGrid());
  const currentColorRef = useRef<string>(COLORS[Math.floor(Math.random() * COLORS.length)]);
  const nextColorRef = useRef<string>(COLORS[Math.floor(Math.random() * COLORS.length)]);
  const flyingRef = useRef<FlyingBubble | null>(null);
  const aimAngleRef = useRef<number>(-Math.PI / 2);
  const scoreRef = useRef(0);
  const stateRef = useRef<GameState>("playing");

  useEffect(() => {
    try {
      const saved = localStorage.getItem("pb-bubble-best");
      if (saved) setBest(parseInt(saved, 10) || 0);
    } catch {}
  }, []);

  const availableColors = useCallback(() => {
    const set = new Set<string>();
    for (const b of bubblesRef.current) set.add(b.color);
    if (!set.size) return COLORS;
    return [...set];
  }, []);

  const newGame = useCallback(() => {
    bubblesRef.current = initialGrid();
    const avail = availableColors();
    currentColorRef.current = avail[Math.floor(Math.random() * avail.length)];
    nextColorRef.current = avail[Math.floor(Math.random() * avail.length)];
    flyingRef.current = null;
    scoreRef.current = 0;
    setScore(0);
    stateRef.current = "playing";
    setGameState("playing");
  }, [availableColors]);

  const nearestCell = (x: number, y: number): { row: number; col: number } => {
    const row = Math.round((y - BUBBLE_R) / ROW_H);
    const xOffset = row % 2 === 0 ? BUBBLE_R : BUBBLE_R * 2;
    const col = Math.round((x - xOffset) / (BUBBLE_R * 2));
    const cols = row % 2 === 0 ? GRID_COLS : GRID_COLS - 1;
    return {
      row: Math.max(0, row),
      col: Math.max(0, Math.min(cols - 1, col)),
    };
  };

  const floodMatches = (start: Bubble): Bubble[] => {
    const match: Bubble[] = [];
    const visited = new Set<string>();
    const stack = [start];
    while (stack.length) {
      const b = stack.pop()!;
      const key = `${b.row},${b.col}`;
      if (visited.has(key)) continue;
      visited.add(key);
      match.push(b);
      for (const n of neighborsOf(b.row, b.col)) {
        const found = bubblesRef.current.find(
          (x) => x.row === n.row && x.col === n.col && x.color === start.color
        );
        if (found) stack.push(found);
      }
    }
    return match;
  };

  const dropOrphans = () => {
    const anchored = new Set<string>();
    const stack: Bubble[] = bubblesRef.current.filter((b) => b.row === 0);
    while (stack.length) {
      const b = stack.pop()!;
      const key = `${b.row},${b.col}`;
      if (anchored.has(key)) continue;
      anchored.add(key);
      for (const n of neighborsOf(b.row, b.col)) {
        const found = bubblesRef.current.find((x) => x.row === n.row && x.col === n.col);
        if (found) stack.push(found);
      }
    }
    const before = bubblesRef.current.length;
    bubblesRef.current = bubblesRef.current.filter((b) => anchored.has(`${b.row},${b.col}`));
    return before - bubblesRef.current.length;
  };

  const attachBubble = useCallback(
    (fb: FlyingBubble) => {
      const { row, col } = nearestCell(fb.x, fb.y);
      // Avoid collision with existing bubble at same cell
      let finalRow = row;
      let finalCol = col;
      if (bubblesRef.current.some((b) => b.row === finalRow && b.col === finalCol)) {
        finalRow = Math.max(0, finalRow - 1);
      }
      const attached: Bubble = { row: finalRow, col: finalCol, color: fb.color };
      bubblesRef.current.push(attached);

      const match = floodMatches(attached);
      if (match.length >= 3) {
        bubblesRef.current = bubblesRef.current.filter(
          (b) => !match.some((m) => m.row === b.row && m.col === b.col)
        );
        scoreRef.current += match.length * 10;
        const dropped = dropOrphans();
        scoreRef.current += dropped * 20;
        setScore(scoreRef.current);
      }

      if (bubblesRef.current.length === 0) {
        stateRef.current = "won";
        setGameState("won");
        setBest((prev) => {
          const next = Math.max(prev, scoreRef.current);
          try {
            localStorage.setItem("pb-bubble-best", String(next));
          } catch {}
          return next;
        });
        return;
      }

      // Loss if any bubble too far down
      if (bubblesRef.current.some((b) => b.row >= DANGER_ROW)) {
        stateRef.current = "gameover";
        setGameState("gameover");
        setBest((prev) => {
          const next = Math.max(prev, scoreRef.current);
          try {
            localStorage.setItem("pb-bubble-best", String(next));
          } catch {}
          return next;
        });
      }

      const avail = availableColors();
      currentColorRef.current = nextColorRef.current;
      nextColorRef.current = avail[Math.floor(Math.random() * avail.length)];
    },
    [availableColors]
  );

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = "#0f172a";
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

    // Danger line
    ctx.strokeStyle = "rgba(239,68,68,0.4)";
    ctx.setLineDash([4, 4]);
    const dangerY = BUBBLE_R + DANGER_ROW * ROW_H;
    ctx.beginPath();
    ctx.moveTo(0, dangerY);
    ctx.lineTo(CANVAS_W, dangerY);
    ctx.stroke();
    ctx.setLineDash([]);

    // Grid bubbles
    for (const b of bubblesRef.current) {
      const { x, y } = bubblePos(b.row, b.col);
      ctx.fillStyle = b.color;
      ctx.beginPath();
      ctx.arc(x, y, BUBBLE_R - 1, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "rgba(0,0,0,0.3)";
      ctx.stroke();
    }

    // Flying bubble
    if (flyingRef.current) {
      const f = flyingRef.current;
      ctx.fillStyle = f.color;
      ctx.beginPath();
      ctx.arc(f.x, f.y, BUBBLE_R - 1, 0, Math.PI * 2);
      ctx.fill();
    }

    // Shooter
    const sx = CANVAS_W / 2;
    ctx.fillStyle = currentColorRef.current;
    ctx.beginPath();
    ctx.arc(sx, SHOOTER_Y, BUBBLE_R - 1, 0, Math.PI * 2);
    ctx.fill();

    // Aim line
    if (!flyingRef.current && stateRef.current === "playing") {
      ctx.strokeStyle = "rgba(255,255,255,0.3)";
      ctx.beginPath();
      ctx.moveTo(sx, SHOOTER_Y);
      ctx.lineTo(
        sx + Math.cos(aimAngleRef.current) * 100,
        SHOOTER_Y + Math.sin(aimAngleRef.current) * 100
      );
      ctx.stroke();
    }

    // Next bubble preview
    ctx.fillStyle = nextColorRef.current;
    ctx.beginPath();
    ctx.arc(40, SHOOTER_Y, BUBBLE_R - 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#fff";
    ctx.font = "12px sans-serif";
    ctx.fillText("Next", 20, SHOOTER_Y - BUBBLE_R - 4);
  }, []);

  const tick = useCallback(() => {
    const f = flyingRef.current;
    if (f) {
      f.x += f.vx;
      f.y += f.vy;
      if (f.x - BUBBLE_R < 0) {
        f.x = BUBBLE_R;
        f.vx = -f.vx;
      } else if (f.x + BUBBLE_R > CANVAS_W) {
        f.x = CANVAS_W - BUBBLE_R;
        f.vx = -f.vx;
      }
      let landed = false;
      if (f.y - BUBBLE_R < 0) {
        f.y = BUBBLE_R;
        landed = true;
      }
      if (!landed) {
        for (const b of bubblesRef.current) {
          const { x, y } = bubblePos(b.row, b.col);
          const dx = f.x - x;
          const dy = f.y - y;
          if (dx * dx + dy * dy < (BUBBLE_R * 2 - 2) ** 2) {
            landed = true;
            break;
          }
        }
      }
      if (landed) {
        attachBubble(f);
        flyingRef.current = null;
      }
    }
    draw();
  }, [attachBubble, draw]);

  useGameLoop(tick);

  const onMouseMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * CANVAS_W;
    const y = ((e.clientY - rect.top) / rect.height) * CANVAS_H;
    const dx = x - CANVAS_W / 2;
    const dy = y - SHOOTER_Y;
    let angle = Math.atan2(dy, dx);
    angle = Math.max(Math.PI + 0.1, Math.min(-0.1, angle)); // clamp to upper half
    // atan2 returns -PI..PI. Upper half is -PI..0; clamp away from horizontal.
    if (dy >= 0) {
      angle = dx < 0 ? Math.PI - 0.1 : -0.1;
    } else {
      angle = Math.max(-Math.PI + 0.1, Math.min(-0.1, angle));
    }
    aimAngleRef.current = angle;
  };

  const onClick = () => {
    if (stateRef.current !== "playing" || flyingRef.current) return;
    const angle = aimAngleRef.current;
    const speed = 10;
    flyingRef.current = {
      x: CANVAS_W / 2,
      y: SHOOTER_Y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      color: currentColorRef.current,
    };
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex items-center gap-6 text-ink text-lg">
        <div>
          Score: <span className="font-bold">{score}</span>
        </div>
        <div>
          Best: <span className="font-bold text-yellow-400">{best}</span>
        </div>
        <button
          onClick={newGame}
          className="px-3 py-1 bg-indigo-600 text-ink rounded text-sm font-bold hover:bg-indigo-700"
        >
          New
        </button>
      </div>

      <div className="relative">
        <canvas
          ref={canvasRef}
          width={CANVAS_W}
          height={CANVAS_H}
          onPointerMove={onMouseMove}
          onClick={onClick}
          className="border-4 border-line rounded-lg max-w-full h-auto touch-none cursor-crosshair"
        />

        {gameState !== "playing" && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-lg">
            <div className="bg-white text-gray-900 px-8 py-6 rounded-lg text-center">
              <div className="text-2xl font-bold mb-2">
                {gameState === "won" ? "Cleared!" : "Game Over"}
              </div>
              <div className="mb-1">Score: {score}</div>
              <div className="mb-3">
                Best: <span className="text-yellow-600 font-bold">{best}</span>
              </div>
              <button
                onClick={newGame}
                className="px-6 py-2 bg-indigo-600 text-ink font-bold rounded-lg hover:bg-indigo-700"
              >
                Play Again
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
