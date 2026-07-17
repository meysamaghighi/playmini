"use client";

import { useRef, useEffect, useState } from "react";

type GameState = "start" | "playing" | "gameover";

interface Block {
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
}

const COLORS = [
  "#FF6B6B", "#4ECDC4", "#FFE66D", "#95E1D3",
  "#F38181", "#AA96DA", "#FCBAD3", "#A8E6CF",
];

const CW = 400;
const CH = 600;
const BH = 30; // block height
const INIT_W = 120;
const PERFECT_THRESH = 5;

export default function TowerBuilder() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef<GameState>("start");
  const scoreRef = useRef(0);
  const bestRef = useRef(0);
  const blocksRef = useRef<Block[]>([]);
  const curBlockRef = useRef<Block | null>(null);
  const swingDirRef = useRef(1);
  const swingSpeedRef = useRef(2.5);
  const animIdRef = useRef(0);
  const perfectRef = useRef<{ show: boolean; time: number }>({ show: false, time: 0 });

  const [, forceUpdate] = useState(0);
  const rerender = () => forceUpdate(n => n + 1);

  useEffect(() => {
    const s = localStorage.getItem("pb-tower");
    if (s) bestRef.current = parseInt(s, 10);
  }, []);

  // Camera: scroll so the top of the tower stays at a target screen position
  const getCameraY = () => {
    if (blocksRef.current.length === 0) return 0;
    const topBlock = blocksRef.current[blocksRef.current.length - 1];
    // We want the top block to appear at screen y ≈ 400 (lower half)
    // topBlock.y decreases as tower grows; camera offset shifts everything down
    const targetScreenY = 400;
    const offset = topBlock.y - targetScreenY;
    return Math.min(0, offset); // negative offset = shift view down to follow tower up
  };

  const getSwingY = () => {
    // Swinging block appears above the tower top
    const cam = getCameraY();
    const topBlock = blocksRef.current[blocksRef.current.length - 1];
    if (!topBlock) return 100;
    const topScreenY = topBlock.y - cam;
    return topScreenY - BH - 40; // 40px gap above tower
  };

  const startGame = () => {
    stateRef.current = "playing";
    scoreRef.current = 0;
    swingDirRef.current = 1;
    swingSpeedRef.current = 2.5;
    perfectRef.current = { show: false, time: 0 };
    blocksRef.current = [];

    // Ground (base) block - placed near bottom of canvas
    blocksRef.current.push({
      x: CW / 2 - INIT_W / 2,
      y: CH - BH - 20,
      width: INIT_W,
      height: BH,
      color: COLORS[0],
    });

    // First swinging block
    curBlockRef.current = {
      x: 0,
      y: getSwingY(),
      width: INIT_W,
      height: BH,
      color: COLORS[1],
    };

    rerender();
    animIdRef.current = requestAnimationFrame(gameLoop);
  };

  const dropBlock = () => {
    if (stateRef.current !== "playing" || !curBlockRef.current) return;

    const cur = curBlockRef.current;
    const last = blocksRef.current[blocksRef.current.length - 1];

    const leftOverlap = Math.max(cur.x, last.x);
    const rightOverlap = Math.min(cur.x + cur.width, last.x + last.width);
    const overlapW = rightOverlap - leftOverlap;

    if (overlapW <= 0) {
      gameOver();
      return;
    }

    const isPerfect = Math.abs(cur.x - last.x) < PERFECT_THRESH;

    let newW = overlapW;
    let newX = leftOverlap;

    if (isPerfect) {
      newW = last.width;
      newX = last.x;
      perfectRef.current = { show: true, time: Date.now() };
    }

    if (newW < 8) {
      gameOver();
      return;
    }

    // Stack on top of last block
    blocksRef.current.push({
      x: newX,
      y: last.y - BH,
      width: newW,
      height: BH,
      color: COLORS[blocksRef.current.length % COLORS.length],
    });
    scoreRef.current++;

    // Increase difficulty
    if (scoreRef.current % 5 === 0) {
      swingSpeedRef.current = Math.min(8, swingSpeedRef.current + 0.4);
    }

    // Next swinging block
    curBlockRef.current = {
      x: 0,
      y: getSwingY(),
      width: newW,
      height: BH,
      color: COLORS[(blocksRef.current.length) % COLORS.length],
    };

    rerender();
  };

  const gameOver = () => {
    stateRef.current = "gameover";
    curBlockRef.current = null;
    if (scoreRef.current > bestRef.current) {
      bestRef.current = scoreRef.current;
      localStorage.setItem("pb-tower", scoreRef.current.toString());
    }
    rerender();
  };

  const gameLoop = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Swing current block
    if (stateRef.current === "playing" && curBlockRef.current) {
      curBlockRef.current.x += swingDirRef.current * swingSpeedRef.current;

      // Update swing y to track camera
      curBlockRef.current.y = getSwingY();

      const maxX = CW - curBlockRef.current.width;
      if (curBlockRef.current.x <= 0) {
        curBlockRef.current.x = 0;
        swingDirRef.current = 1;
      } else if (curBlockRef.current.x >= maxX) {
        curBlockRef.current.x = maxX;
        swingDirRef.current = -1;
      }
    }

    // --- Draw ---
    const cam = getCameraY();

    // Sky gradient
    const grad = ctx.createLinearGradient(0, 0, 0, CH);
    grad.addColorStop(0, "#0f172a");
    grad.addColorStop(0.5, "#1e293b");
    grad.addColorStop(1, "#334155");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, CW, CH);

    // Ground line
    const groundY = CH - 20 - cam;
    if (groundY < CH) {
      ctx.fillStyle = "#475569";
      ctx.fillRect(0, groundY + BH, CW, CH);
    }

    // Draw all stacked blocks
    for (const block of blocksRef.current) {
      const sy = block.y - cam;
      if (sy > CH + BH || sy < -BH) continue; // cull off-screen

      // Block body
      ctx.fillStyle = block.color;
      ctx.beginPath();
      ctx.roundRect(block.x, sy, block.width, block.height, 3);
      ctx.fill();

      // Brick texture pattern
      ctx.strokeStyle = "rgba(0,0,0,0.12)";
      ctx.lineWidth = 0.5;
      const brickW = 20;
      const brickH = BH / 2;
      for (let row = 0; row < 2; row++) {
        const by = sy + row * brickH;
        if (row > 0) {
          ctx.beginPath();
          ctx.moveTo(block.x, by);
          ctx.lineTo(block.x + block.width, by);
          ctx.stroke();
        }
        const offset = row % 2 === 0 ? 0 : brickW / 2;
        for (let bx = block.x + offset; bx < block.x + block.width; bx += brickW) {
          if (bx > block.x && bx < block.x + block.width) {
            ctx.beginPath();
            ctx.moveTo(bx, by);
            ctx.lineTo(bx, by + brickH);
            ctx.stroke();
          }
        }
      }

      // Top highlight
      ctx.fillStyle = "rgba(255,255,255,0.18)";
      ctx.fillRect(block.x + 2, sy + 1, block.width - 4, 3);

      // Bottom shadow
      ctx.fillStyle = "rgba(0,0,0,0.15)";
      ctx.fillRect(block.x + 2, sy + BH - 3, block.width - 4, 2);

      // Border
      ctx.strokeStyle = "rgba(0,0,0,0.35)";
      ctx.lineWidth = 1.5;
      ctx.strokeRect(block.x, sy, block.width, block.height);
    }

    // Draw swinging block
    if (curBlockRef.current && stateRef.current === "playing") {
      const cb = curBlockRef.current;

      // Drop guide line (faint)
      ctx.strokeStyle = "rgba(255,255,255,0.08)";
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(cb.x + cb.width / 2, cb.y + BH);
      const lastBlock = blocksRef.current[blocksRef.current.length - 1];
      ctx.lineTo(cb.x + cb.width / 2, lastBlock.y - cam);
      ctx.stroke();
      ctx.setLineDash([]);

      // The block itself
      ctx.fillStyle = cb.color;
      ctx.beginPath();
      ctx.roundRect(cb.x, cb.y, cb.width, BH, 3);
      ctx.fill();
      ctx.fillStyle = "rgba(255,255,255,0.2)";
      ctx.fillRect(cb.x + 2, cb.y + 2, cb.width - 4, 4);
      ctx.strokeStyle = "rgba(0,0,0,0.3)";
      ctx.lineWidth = 1.5;
      ctx.strokeRect(cb.x, cb.y, cb.width, BH);
    }

    // Perfect popup
    if (perfectRef.current.show) {
      const elapsed = Date.now() - perfectRef.current.time;
      if (elapsed < 800) {
        const alpha = 1 - elapsed / 800;
        const rise = elapsed * 0.03;
        ctx.globalAlpha = alpha;
        ctx.font = "bold 32px sans-serif";
        ctx.fillStyle = "#FFD700";
        ctx.textAlign = "center";
        ctx.fillText("Perfect!", CW / 2, 180 - rise);
        ctx.globalAlpha = 1;
      } else {
        perfectRef.current.show = false;
      }
    }

    // Score HUD
    ctx.font = "bold 20px sans-serif";
    ctx.fillStyle = "#fff";
    ctx.textAlign = "left";
    ctx.fillText(`Score: ${scoreRef.current}`, 12, 30);
    ctx.textAlign = "right";
    ctx.fillStyle = "#94a3b8";
    ctx.font = "14px sans-serif";
    ctx.fillText(`Best: ${bestRef.current}`, CW - 12, 30);

    if (stateRef.current === "playing") {
      animIdRef.current = requestAnimationFrame(gameLoop);
    }
  };

  useEffect(() => {
    return () => { if (animIdRef.current) cancelAnimationFrame(animIdRef.current); };
  }, []);

  const handleClick = () => {
    if (stateRef.current === "playing") dropBlock();
  };

  // Keyboard: space to drop
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === "Space" && stateRef.current === "playing") {
        e.preventDefault();
        dropBlock();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative">
        <canvas
          ref={canvasRef}
          width={CW}
          height={CH}
          className="rounded-2xl cursor-pointer max-w-full h-auto border border-slate-700"
          onClick={handleClick}
          style={{ touchAction: "manipulation" }}
        />

        {stateRef.current === "start" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/85 rounded-2xl backdrop-blur-sm">
            <div className="text-5xl mb-3">🏗️</div>
            <h2 className="text-3xl font-black text-pink-400 mb-2">Tower Builder</h2>
            <p className="text-ink-2 mb-6 text-sm text-center px-6">
              Tap to drop blocks. Align them to build higher!
            </p>
            <button
              onClick={startGame}
              className="px-10 py-3 bg-pink-600 hover:bg-pink-500 text-ink font-bold rounded-2xl transition-all hover:scale-105 active:scale-95"
            >
              Play
            </button>
          </div>
        )}

        {stateRef.current === "gameover" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/85 rounded-2xl backdrop-blur-sm">
            <h2 className="text-3xl font-black text-red-400 mb-4">Game Over</h2>
            <div className="bg-slate-900/80 rounded-xl px-6 py-3 mb-6 text-center">
              <p className="text-ink text-xl font-bold">Score: {scoreRef.current}</p>
              <p className="text-ink-2 text-sm mt-1">Best: {bestRef.current}</p>
              {scoreRef.current >= bestRef.current && scoreRef.current > 0 && (
                <p className="text-yellow-400 text-sm font-bold mt-1">New Best!</p>
              )}
            </div>
            <div className="flex gap-3">
              <button
                onClick={startGame}
                className="px-6 py-3 bg-pink-600 hover:bg-pink-500 text-ink font-bold rounded-xl transition-all hover:scale-105 active:scale-95"
              >
                Play Again
              </button>
            </div>
          </div>
        )}
      </div>

      {stateRef.current === "playing" && (
        <p className="text-ink-3 text-xs text-center">Tap or press Space to drop the block</p>
      )}
    </div>
  );
}
