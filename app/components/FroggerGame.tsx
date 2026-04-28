"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useGameLoop } from "./useGameLoop";

const COLS = 13;
const ROWS = 14;
const CELL = 36;
const W = COLS * CELL;
const H = ROWS * CELL;

// Row types: "safe" | "road" | "water" | "home"
// Row 0 = top (homes), Row 13 = bottom (safe start)
type RowType = "home" | "water" | "safe" | "road";

interface Lane {
  type: RowType;
  bg: string;
  objects: LaneObject[];
  speed: number; // px/frame, negative = left
  objectW: number;
  objectH: number;
  gap: number; // min gap between objects
  color: string;
}

interface LaneObject {
  x: number; // pixel x of left edge
}

const HOME_SLOTS = [1, 3, 5, 7, 9]; // column indices for home slots (1-based cols * CELL + CELL/2 centers)
const HOME_SLOT_PX = HOME_SLOTS.map(c => c * CELL + CELL / 2);

function buildLanes(level: number): Lane[] {
  const spd = 1 + (level - 1) * 0.3;
  return [
    // Row 0: homes
    { type: "home", bg: "#1a5c1a", objects: [], speed: 0, objectW: 0, objectH: 0, gap: 0, color: "" },
    // Rows 1-5: water
    { type: "water", bg: "#0a3a6b", objects: spaced(5, CELL * 3, W), speed:  spd * 1.2, objectW: CELL * 3, objectH: CELL - 4, gap: CELL * 1.5, color: "#5a3a1a" }, // logs right
    { type: "water", bg: "#0a3a6b", objects: spaced(4, CELL * 4, W), speed: -spd * 1.0, objectW: CELL * 4, objectH: CELL - 4, gap: CELL * 2,   color: "#5a3a1a" }, // logs left
    { type: "water", bg: "#0a3a6b", objects: spaced(6, CELL * 2, W), speed:  spd * 1.5, objectW: CELL * 2, objectH: CELL - 4, gap: CELL * 1.2, color: "#2a7a2a" }, // turtles right
    { type: "water", bg: "#0a3a6b", objects: spaced(4, CELL * 3, W), speed: -spd * 0.8, objectW: CELL * 3, objectH: CELL - 4, gap: CELL * 1.8, color: "#5a3a1a" }, // logs left
    { type: "water", bg: "#0a3a6b", objects: spaced(5, CELL * 2, W), speed:  spd * 1.1, objectW: CELL * 2, objectH: CELL - 4, gap: CELL * 1.5, color: "#2a7a2a" }, // turtles right
    // Row 6: safe median
    { type: "safe", bg: "#2d5a1a", objects: [], speed: 0, objectW: 0, objectH: 0, gap: 0, color: "" },
    // Rows 7-12: road
    { type: "road", bg: "#333", objects: spaced(3, CELL * 2, W), speed: -spd * 1.8, objectW: CELL * 2, objectH: CELL - 6, gap: CELL * 2, color: "#c0392b" }, // cars left fast
    { type: "road", bg: "#333", objects: spaced(4, CELL * 2, W), speed:  spd * 1.4, objectW: CELL * 2, objectH: CELL - 6, gap: CELL * 2, color: "#e67e22" }, // cars right
    { type: "road", bg: "#333", objects: spaced(2, CELL * 3, W), speed: -spd * 1.0, objectW: CELL * 3, objectH: CELL - 6, gap: CELL * 3, color: "#8e44ad" }, // truck left
    { type: "road", bg: "#333", objects: spaced(3, CELL * 2, W), speed:  spd * 2.0, objectW: CELL * 2, objectH: CELL - 6, gap: CELL * 2, color: "#e74c3c" }, // cars right fast
    { type: "road", bg: "#333", objects: spaced(4, CELL * 2, W), speed: -spd * 1.2, objectW: CELL * 2, objectH: CELL - 6, gap: CELL * 2.5, color: "#2980b9" }, // cars left
    { type: "road", bg: "#333", objects: spaced(3, CELL * 3, W), speed:  spd * 0.9, objectW: CELL * 3, objectH: CELL - 6, gap: CELL * 3, color: "#27ae60" }, // trucks right
    // Row 13: safe start
    { type: "safe", bg: "#2d5a1a", objects: [], speed: 0, objectW: 0, objectH: 0, gap: 0, color: "" },
  ];
}

function spaced(count: number, objW: number, totalW: number): LaneObject[] {
  const objects: LaneObject[] = [];
  const spacing = totalW / count;
  for (let i = 0; i < count; i++) {
    objects.push({ x: i * spacing + Math.random() * (spacing - objW) * 0.4 });
  }
  return objects;
}

export default function FroggerGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameRef = useRef({
    state: "start" as "start" | "playing" | "dead" | "win" | "gameover",
    lanes: buildLanes(1),
    frog: { x: Math.floor(COLS / 2) * CELL + CELL / 2, y: (ROWS - 1) * CELL + CELL / 2, dir: 3 }, // dir: 0R 1D 2L 3U
    lives: 3,
    score: 0,
    level: 1,
    homes: new Set<number>(), // which home slots are filled (px center)
    timer: 30 * 60, // 30 seconds in frames
    deathTimer: 0,
    winTimer: 0,
    frame: 0,
    touchStart: null as { x: number; y: number } | null,
    moving: false, // frog mid-hop
    targetX: 0, targetY: 0,
    hopProgress: 0,
    startX: 0, startY: 0,
    onLog: false, logDX: 0,
  });

  const [display, setDisplay] = useState({ score: 0, lives: 3, level: 1, timer: 30, state: "start" });

  const resetFrog = useCallback(() => {
    const g = gameRef.current;
    g.frog = { x: Math.floor(COLS / 2) * CELL + CELL / 2, y: (ROWS - 1) * CELL + CELL / 2, dir: 3 };
    g.moving = false; g.onLog = false; g.logDX = 0;
  }, []);

  const startGame = useCallback((fresh: boolean) => {
    const g = gameRef.current;
    if (fresh) {
      g.score = 0; g.lives = 3; g.level = 1;
      g.lanes = buildLanes(1);
    }
    g.homes = new Set();
    g.timer = 30 * 60;
    g.state = "playing";
    g.deathTimer = 0; g.winTimer = 0;
    resetFrog();
    setDisplay({ score: g.score, lives: g.lives, level: g.level, timer: 30, state: "playing" });
  }, [resetFrog]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const g = gameRef.current;

    // Draw lanes
    for (let row = 0; row < ROWS; row++) {
      const lane = g.lanes[row];
      ctx.fillStyle = lane.bg;
      ctx.fillRect(0, row * CELL, W, CELL);

      // Road markings
      if (lane.type === "road" && row % 2 === 0) {
        ctx.fillStyle = "#555";
        ctx.fillRect(0, row * CELL + CELL / 2 - 2, W, 4);
      }

      // Lane objects
      for (const obj of lane.objects) {
        const y = row * CELL + (CELL - lane.objectH) / 2;
        if (lane.type === "water") {
          // Log / turtle platform
          ctx.fillStyle = lane.color;
          ctx.beginPath();
          ctx.roundRect(obj.x, y, lane.objectW, lane.objectH, 6);
          ctx.fill();
          // Wood grain lines
          ctx.strokeStyle = "rgba(0,0,0,0.2)";
          ctx.lineWidth = 1;
          for (let gx = 1; gx < Math.floor(lane.objectW / 20); gx++) {
            ctx.beginPath();
            ctx.moveTo(obj.x + gx * 20, y + 4);
            ctx.lineTo(obj.x + gx * 20, y + lane.objectH - 4);
            ctx.stroke();
          }
        } else if (lane.type === "road") {
          // Car / truck body
          ctx.fillStyle = lane.color;
          ctx.beginPath();
          ctx.roundRect(obj.x, y + 4, lane.objectW, lane.objectH - 8, 5);
          ctx.fill();
          // Windshield
          const winW = lane.objectW * 0.3;
          const winX = lane.speed > 0 ? obj.x + lane.objectW - winW - 6 : obj.x + 6;
          ctx.fillStyle = "rgba(150,220,255,0.7)";
          ctx.fillRect(winX, y + 8, winW, lane.objectH - 18);
          // Wheels
          ctx.fillStyle = "#111";
          ctx.beginPath(); ctx.arc(obj.x + 8, y + lane.objectH - 3, 5, 0, Math.PI * 2); ctx.fill();
          ctx.beginPath(); ctx.arc(obj.x + lane.objectW - 8, y + lane.objectH - 3, 5, 0, Math.PI * 2); ctx.fill();
          // Headlights
          ctx.fillStyle = lane.speed > 0 ? "#ffe066" : "#ff4444";
          const lightX = lane.speed > 0 ? obj.x + lane.objectW - 4 : obj.x;
          ctx.fillRect(lightX, y + 8, 4, 8);
        }
      }
    }

    // Home row decorations
    const homeRow = 0;
    ctx.fillStyle = "#0a3a6b";
    for (let i = 0; i < HOME_SLOTS.length; i++) {
      const cx = HOME_SLOT_PX[i];
      ctx.beginPath();
      ctx.arc(cx, homeRow * CELL + CELL / 2, CELL / 2 - 4, 0, Math.PI * 2);
      ctx.fill();
      if (g.homes.has(HOME_SLOT_PX[i])) {
        // Filled home — draw frog silhouette
        ctx.fillStyle = "#00cc44";
        ctx.beginPath(); ctx.arc(cx, homeRow * CELL + CELL / 2, CELL / 2 - 6, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = "#0a3a6b";
      }
    }

    // Draw frog
    if (g.state !== "gameover") {
      const fx = g.frog.x, fy = g.frog.y;
      const r = CELL / 2 - 4;
      // Body
      ctx.fillStyle = "#00cc44";
      ctx.beginPath(); ctx.ellipse(fx, fy, r, r * 0.85, 0, 0, Math.PI * 2); ctx.fill();
      // Eyes
      ctx.fillStyle = "#fff";
      const ed = 6;
      ctx.beginPath(); ctx.arc(fx - ed, fy - ed, 4, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(fx + ed, fy - ed, 4, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#000";
      ctx.beginPath(); ctx.arc(fx - ed + 1, fy - ed, 2, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(fx + ed + 1, fy - ed, 2, 0, Math.PI * 2); ctx.fill();
      // Legs
      ctx.strokeStyle = "#00aa33"; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(fx - r, fy); ctx.lineTo(fx - r - 6, fy + 8); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(fx + r, fy); ctx.lineTo(fx + r + 6, fy + 8); ctx.stroke();
    }

    // Timer bar
    const timerFrac = g.timer / (30 * 60);
    ctx.fillStyle = "#222";
    ctx.fillRect(0, H - 4, W, 4);
    ctx.fillStyle = timerFrac > 0.4 ? "#22c55e" : timerFrac > 0.2 ? "#f59e0b" : "#ef4444";
    ctx.fillRect(0, H - 4, W * timerFrac, 4);

    // Overlay
    const overlay = (title: string, sub: string, hint: string, titleColor: string) => {
      ctx.fillStyle = "rgba(0,0,0,0.65)";
      ctx.fillRect(0, 0, W, H);
      ctx.textAlign = "center";
      ctx.fillStyle = titleColor;
      ctx.font = "bold 28px monospace";
      ctx.fillText(title, W / 2, H / 2 - 30);
      if (sub) {
        ctx.fillStyle = "#fff";
        ctx.font = "16px monospace";
        ctx.fillText(sub, W / 2, H / 2 + 4);
      }
      ctx.fillStyle = "#ffe000";
      ctx.font = "bold 15px monospace";
      ctx.fillText(hint, W / 2, H / 2 + 36);
    };

    if (g.state === "start") overlay("FROGGER", "Hop to the top — avoid cars & water!", "Space / tap to start", "#00cc44");
    else if (g.state === "dead" && g.deathTimer > 0) overlay("SQUISHED!", "", "", "#ef4444");
    else if (g.state === "gameover") overlay("GAME OVER", `Score: ${g.score}`, "Space / tap to play again", "#ef4444");
    else if (g.state === "win") overlay("LEVEL CLEAR!", `Score: ${g.score}`, "Get ready...", "#00cc44");
  }, []);

  const tick = useCallback(() => {
    const g = gameRef.current;
    if (g.state === "start" || g.state === "gameover") { draw(); return; }

    g.frame++;

    if (g.state === "dead") {
      g.deathTimer--;
      draw();
      if (g.deathTimer <= 0) {
        if (g.lives <= 0) {
          g.state = "gameover";
          setDisplay(d => ({ ...d, state: "gameover" }));
        } else {
          g.timer = 30 * 60;
          g.state = "playing";
          resetFrog();
          setDisplay(d => ({ ...d, state: "playing", timer: 30 }));
        }
      }
      return;
    }

    if (g.state === "win") {
      g.winTimer--;
      draw();
      if (g.winTimer <= 0) {
        g.level++;
        g.lanes = buildLanes(g.level);
        startGame(false);
        setDisplay(d => ({ ...d, level: g.level }));
      }
      return;
    }

    // Move lane objects
    for (const lane of g.lanes) {
      if (lane.speed === 0) continue;
      for (const obj of lane.objects) {
        obj.x += lane.speed;
        if (lane.speed > 0 && obj.x > W) obj.x -= W + lane.objectW;
        if (lane.speed < 0 && obj.x + lane.objectW < 0) obj.x += W + lane.objectW;
      }
    }

    // Timer
    g.timer--;
    if (g.timer % 60 === 0) setDisplay(d => ({ ...d, timer: Math.ceil(g.timer / 60) }));
    if (g.timer <= 0) {
      die(g);
      return;
    }

    // Move frog (hop animation)
    const HOP_SPEED = 8;
    if (g.moving) {
      g.hopProgress = Math.min(1, g.hopProgress + HOP_SPEED / CELL);
      g.frog.x = g.startX + (g.targetX - g.startX) * g.hopProgress;
      g.frog.y = g.startY + (g.targetY - g.startY) * g.hopProgress;
      if (g.hopProgress >= 1) {
        g.frog.x = g.targetX; g.frog.y = g.targetY;
        g.moving = false;
      }
    }

    const frogRow = Math.round((g.frog.y - CELL / 2) / CELL);
    const lane = g.lanes[frogRow];

    // Water row: must be on a platform
    if (lane && lane.type === "water") {
      let onPlatform = false;
      let platformDX = 0;
      for (const obj of lane.objects) {
        if (g.frog.x >= obj.x + 4 && g.frog.x <= obj.x + lane.objectW - 4) {
          onPlatform = true;
          platformDX = lane.speed;
          break;
        }
      }
      if (!onPlatform) { die(g); return; }
      // Carry frog with platform
      if (!g.moving) {
        g.frog.x += platformDX;
        // Out of bounds on water = death
        if (g.frog.x < CELL / 2 || g.frog.x > W - CELL / 2) { die(g); return; }
      }
    }

    // Road row: collision with cars
    if (lane && lane.type === "road") {
      for (const obj of lane.objects) {
        const frogL = g.frog.x - CELL / 2 + 4;
        const frogR = g.frog.x + CELL / 2 - 4;
        const objR = obj.x + lane.objectW;
        if (frogR > obj.x + 4 && frogL < objR - 4 &&
            g.frog.y > frogRow * CELL + 4 && g.frog.y < frogRow * CELL + CELL - 4) {
          die(g); return;
        }
      }
    }

    // Home row: reached a home slot?
    if (frogRow === 0) {
      let reached = false;
      for (const slotPx of HOME_SLOT_PX) {
        if (Math.abs(g.frog.x - slotPx) < CELL / 2 - 2) {
          if (!g.homes.has(slotPx)) {
            g.homes.add(slotPx);
            g.score += 100 + Math.ceil(g.timer / 60) * 10;
            setDisplay(d => ({ ...d, score: g.score }));
            reached = true;
          } else {
            die(g); return; // already filled
          }
          break;
        }
      }
      if (!reached) { die(g); return; } // landed on wall/edge

      if (g.homes.size === HOME_SLOTS.length) {
        // Level complete
        g.state = "win";
        g.winTimer = 120;
        setDisplay(d => ({ ...d, state: "win", score: g.score }));
        draw();
        return;
      }
      resetFrog();
    }

    draw();
  }, [draw, resetFrog, startGame]);

  function die(g: typeof gameRef.current) {
    g.lives--;
    g.state = "dead";
    g.deathTimer = 60;
    setDisplay(d => ({ ...d, lives: g.lives, state: "dead" }));
  }

  const hop = useCallback((dir: number) => {
    const g = gameRef.current;
    if (g.state !== "playing" || g.moving) return;
    const DX = [CELL, 0, -CELL, 0];
    const DY = [0, CELL, 0, -CELL];
    const nx = g.frog.x + DX[dir];
    const ny = g.frog.y + DY[dir];
    if (nx < CELL / 2 || nx > W - CELL / 2 || ny < CELL / 2 || ny > H - CELL / 2) return;
    g.frog.dir = dir;
    g.startX = g.frog.x; g.startY = g.frog.y;
    g.targetX = nx; g.targetY = ny;
    g.moving = true; g.hopProgress = 0;
  }, []);

  // Game loop
  useGameLoop(tick);

  // Keyboard
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const g = gameRef.current;
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        if (g.state === "start") startGame(true);
        else if (g.state === "gameover") startGame(true);
        return;
      }
      if (g.state !== "playing") return;
      const map: Record<string, number> = {
        ArrowRight: 0, ArrowDown: 1, ArrowLeft: 2, ArrowUp: 3,
        d: 0, s: 1, a: 2, w: 3, D: 0, S: 1, A: 2, W: 3,
      };
      if (map[e.key] !== undefined) { e.preventDefault(); hop(map[e.key]); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [startGame, hop]);

  // Touch
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const onStart = (e: TouchEvent) => {
      e.preventDefault();
      const g = gameRef.current;
      if (g.state === "start" || g.state === "gameover") { startGame(true); return; }
      gameRef.current.touchStart = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    };
    const onEnd = (e: TouchEvent) => {
      const g = gameRef.current;
      if (!g.touchStart) return;
      const dx = e.changedTouches[0].clientX - g.touchStart.x;
      const dy = e.changedTouches[0].clientY - g.touchStart.y;
      g.touchStart = null;
      if (Math.abs(dx) < 8 && Math.abs(dy) < 8) hop(3); // tap = up
      else if (Math.abs(dx) > Math.abs(dy)) hop(dx > 0 ? 0 : 2);
      else hop(dy > 0 ? 1 : 3);
    };
    canvas.addEventListener("touchstart", onStart, { passive: false });
    canvas.addEventListener("touchend", onEnd);
    return () => {
      canvas.removeEventListener("touchstart", onStart);
      canvas.removeEventListener("touchend", onEnd);
    };
  }, [startGame, hop]);

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex items-center justify-between w-full max-w-[468px] px-1">
        <div className="text-sm text-ink-2">Level <span className="font-bold text-ink">{display.level}</span></div>
        <div className="flex gap-1">
          {Array.from({ length: Math.max(0, display.lives) }).map((_, i) => (
            <span key={i} className="text-green-400 text-lg">🐸</span>
          ))}
        </div>
        <div className="text-sm text-ink-2">Score <span className="font-bold text-ink">{display.score}</span></div>
      </div>

      <canvas
        ref={canvasRef}
        width={W}
        height={H}
        className="max-w-full h-auto rounded-lg border border-line cursor-pointer touch-none"
        onClick={() => {
          const g = gameRef.current;
          if (g.state === "start" || g.state === "gameover") startGame(true);
          else hop(3);
        }}
      />

      <p className="text-xs text-ink-3">Arrow keys / WASD — Swipe or tap to hop up</p>
    </div>
  );
}
