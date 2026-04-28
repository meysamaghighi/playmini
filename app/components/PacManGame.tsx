"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useGameLoop } from "./useGameLoop";

type Dir = 0 | 1 | 2 | 3; // 0=R 1=D 2=L 3=U
const DX = [1, 0, -1, 0];
const DY = [0, 1, 0, -1];

// 21×21 maze: 1=wall 0=dot 2=empty(no dot) 3=power pellet
const MAZE_TEMPLATE = [
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,3,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,3,1],
  [1,0,1,1,0,1,1,1,0,1,1,1,0,1,1,1,0,1,1,0,1],
  [1,0,1,1,0,1,1,1,0,1,1,1,0,1,1,1,0,1,1,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,1,1,0,1,0,1,1,1,1,1,1,1,0,1,0,1,1,0,1],
  [1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],
  [1,1,1,1,0,1,1,1,2,2,2,2,2,1,1,1,0,1,1,1,1],
  [1,1,1,1,0,1,2,2,2,2,2,2,2,2,2,1,0,1,1,1,1],
  [1,1,1,1,0,2,2,1,1,2,2,2,1,1,2,2,0,1,1,1,1],
  [2,2,2,2,0,2,2,1,2,2,2,2,2,1,2,2,0,2,2,2,2],
  [1,1,1,1,0,2,2,1,1,1,1,1,1,1,2,2,0,1,1,1,1],
  [1,1,1,1,0,1,2,2,2,2,2,2,2,2,2,1,0,1,1,1,1],
  [1,1,1,1,0,1,2,2,2,2,2,2,2,2,2,1,0,1,1,1,1],
  [1,1,1,1,0,1,2,1,1,1,1,1,1,1,2,1,0,1,1,1,1],
  [1,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,1],
  [1,0,1,1,0,1,1,1,0,1,1,1,0,1,1,1,0,1,1,0,1],
  [1,3,0,1,0,0,0,0,0,0,2,0,0,0,0,0,0,1,0,3,1],
  [1,1,0,1,0,1,0,1,1,1,1,1,1,1,0,1,0,1,0,1,1],
  [1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
];

const COLS = 21;
const ROWS = 21;
const CELL = 22;
const W = COLS * CELL;
const H = ROWS * CELL;

const GHOST_COLORS = ["#ff0000", "#ffb8ff", "#00ffff", "#ffb852"];
const GHOST_HOME = { x: 10, y: 9 }; // scatter target fallback
const GHOST_STARTS = [
  { x: 9, y: 9 }, { x: 10, y: 9 }, { x: 11, y: 9 }, { x: 10, y: 10 },
];
const PAC_START = { x: 10, y: 15 };

function freshMaze(): number[][] {
  return MAZE_TEMPLATE.map(row => [...row]);
}

function countDots(maze: number[][]): number {
  let n = 0;
  for (const row of maze) for (const c of row) if (c === 0 || c === 3) n++;
  return n;
}

interface Ghost {
  x: number; y: number;
  px: number; py: number; // pixel position
  dir: Dir;
  frightened: boolean;
  eaten: boolean;
  releaseTimer: number;
  released: boolean;
  color: string;
  scatterTarget: { x: number; y: number };
}

export default function PacManGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameRef = useRef({
    state: "start" as "start" | "playing" | "dead" | "win" | "gameover",
    maze: freshMaze(),
    pac: { x: PAC_START.x, y: PAC_START.y, px: PAC_START.x * CELL + CELL / 2, py: PAC_START.y * CELL + CELL / 2, dir: 0 as Dir, nextDir: 0 as Dir, mouth: 0, mouthDir: 1 },
    ghosts: GHOST_STARTS.map((s, i) => ({
      x: s.x, y: s.y,
      px: s.x * CELL + CELL / 2, py: s.y * CELL + CELL / 2,
      dir: (i % 2 === 0 ? 0 : 2) as Dir,
      frightened: false, eaten: false,
      releaseTimer: i * 60,
      released: i === 0,
      color: GHOST_COLORS[i],
      scatterTarget: [{ x: 20, y: 0 }, { x: 0, y: 0 }, { x: 20, y: 20 }, { x: 0, y: 20 }][i],
    })) as Ghost[],
    score: 0,
    lives: 3,
    level: 1,
    dotsLeft: countDots(freshMaze()),
    frightenTimer: 0,
    ghostCombo: 0,
    deathTimer: 0,
    frame: 0,
    speed: 2,
    touchStart: null as { x: number; y: number } | null,
  });

  const [display, setDisplay] = useState({ score: 0, lives: 3, level: 1, state: "start" as string });

  const isWall = useCallback((maze: number[][], x: number, y: number) => {
    if (x < 0 || x >= COLS || y < 0 || y >= ROWS) return true;
    return maze[y][x] === 1;
  }, []);

  const canMove = useCallback((maze: number[][], x: number, y: number, d: Dir) => {
    const nx = x + DX[d], ny = y + DY[d];
    if (nx < 0) return true; // tunnel
    if (nx >= COLS) return true;
    return !isWall(maze, nx, ny);
  }, [isWall]);

  const chooseGhostDir = useCallback((g: Ghost, maze: number[][], pacX: number, pacY: number, scatter: boolean) => {
    const tx = scatter ? g.scatterTarget.x : (g.frightened ? Math.floor(Math.random() * COLS) : pacX);
    const ty = scatter ? g.scatterTarget.y : (g.frightened ? Math.floor(Math.random() * ROWS) : pacY);

    const opposite = ((g.dir + 2) % 4) as Dir;
    let best: Dir = g.dir;
    let bestDist = Infinity;

    for (let d = 0; d < 4; d++) {
      if (d === opposite) continue;
      const nx = g.x + DX[d], ny = g.y + DY[d];
      if (nx < 0 || nx >= COLS || ny < 0 || ny >= ROWS) continue;
      if (isWall(maze, nx, ny)) continue;
      // ghosts can't go back into ghost house unless eaten
      if (!g.released && ny < 8) continue;
      const dist = (nx - tx) ** 2 + (ny - ty) ** 2;
      if (dist < bestDist) { bestDist = dist; best = d as Dir; }
    }
    return best;
  }, [isWall]);

  const resetRound = useCallback((g: typeof gameRef.current) => {
    const pac = g.pac;
    pac.x = PAC_START.x; pac.y = PAC_START.y;
    pac.px = PAC_START.x * CELL + CELL / 2; pac.py = PAC_START.y * CELL + CELL / 2;
    pac.dir = 0; pac.nextDir = 0; pac.mouth = 0; pac.mouthDir = 1;

    g.ghosts = GHOST_STARTS.map((s, i) => ({
      x: s.x, y: s.y,
      px: s.x * CELL + CELL / 2, py: s.y * CELL + CELL / 2,
      dir: (i % 2 === 0 ? 0 : 2) as Dir,
      frightened: false, eaten: false,
      releaseTimer: i * 60,
      released: i === 0,
      color: GHOST_COLORS[i],
      scatterTarget: [{ x: 20, y: 0 }, { x: 0, y: 0 }, { x: 20, y: 20 }, { x: 0, y: 20 }][i],
    }));
    g.frightenTimer = 0;
    g.ghostCombo = 0;
    g.deathTimer = 0;
    g.state = "playing";
  }, []);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const g = gameRef.current;

    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, W, H);

    // Draw maze
    for (let row = 0; row < ROWS; row++) {
      for (let col = 0; col < COLS; col++) {
        const cell = g.maze[row][col];
        const cx = col * CELL, cy = row * CELL;
        if (cell === 1) {
          ctx.fillStyle = "#1a1aff";
          ctx.fillRect(cx, cy, CELL, CELL);
          // Inner dark block for visual depth
          ctx.fillStyle = "#0000cc";
          ctx.fillRect(cx + 2, cy + 2, CELL - 4, CELL - 4);
        } else if (cell === 0) {
          ctx.fillStyle = "#ffff99";
          ctx.beginPath();
          ctx.arc(cx + CELL / 2, cy + CELL / 2, 2, 0, Math.PI * 2);
          ctx.fill();
        } else if (cell === 3) {
          // Power pellet — pulse
          const pulse = 0.7 + 0.3 * Math.sin(g.frame * 0.12);
          ctx.fillStyle = "#ffffff";
          ctx.beginPath();
          ctx.arc(cx + CELL / 2, cy + CELL / 2, 5 * pulse, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    // Draw pac-man
    if (g.state !== "gameover") {
      const pac = g.pac;
      const angle = (pac.dir * Math.PI) / 2;
      const mouthAngle = pac.mouth * 0.4;
      ctx.fillStyle = "#ffe000";
      ctx.beginPath();
      ctx.moveTo(pac.px, pac.py);
      ctx.arc(pac.px, pac.py, CELL / 2 - 2, angle + mouthAngle, angle + Math.PI * 2 - mouthAngle);
      ctx.closePath();
      ctx.fill();
    }

    // Draw ghosts
    for (const ghost of g.ghosts) {
      if (ghost.eaten) continue;
      const gx = ghost.px - CELL / 2 + 2, gy = ghost.py - CELL / 2 + 2;
      const gw = CELL - 4, gh = CELL - 4;

      if (ghost.frightened) {
        const flash = g.frightenTimer < 120 && Math.floor(g.frame / 15) % 2 === 0;
        ctx.fillStyle = flash ? "#ffffff" : "#2121de";
      } else {
        ctx.fillStyle = ghost.color;
      }

      // Body
      ctx.beginPath();
      ctx.arc(gx + gw / 2, gy + gh / 2, gw / 2, Math.PI, 0);
      ctx.lineTo(gx + gw, gy + gh);
      // Wavy bottom
      const waves = 3;
      for (let w = waves; w >= 0; w--) {
        const wx = gx + (gw / waves) * w;
        const wy = gy + gh - (w % 2 === 0 ? 4 : 0);
        ctx.lineTo(wx, wy);
      }
      ctx.lineTo(gx, gy + gh);
      ctx.closePath();
      ctx.fill();

      // Eyes (not when frightened)
      if (!ghost.frightened) {
        ctx.fillStyle = "#fff";
        ctx.beginPath(); ctx.ellipse(gx + gw * 0.3, gy + gh * 0.35, 3, 4, 0, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.ellipse(gx + gw * 0.7, gy + gh * 0.35, 3, 4, 0, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = "#00f";
        const eyeDX = DX[ghost.dir], eyeDY = DY[ghost.dir];
        ctx.beginPath(); ctx.arc(gx + gw * 0.3 + eyeDX * 2, gy + gh * 0.35 + eyeDY * 2, 2, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(gx + gw * 0.7 + eyeDX * 2, gy + gh * 0.35 + eyeDY * 2, 2, 0, Math.PI * 2); ctx.fill();
      }
    }

    // Eaten ghost eyes (just eyes floating back)
    for (const ghost of g.ghosts) {
      if (!ghost.eaten) continue;
      ctx.fillStyle = "#fff";
      ctx.beginPath(); ctx.ellipse(ghost.px - 4, ghost.py - 3, 3, 4, 0, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(ghost.px + 4, ghost.py - 3, 3, 4, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#00f";
      ctx.beginPath(); ctx.arc(ghost.px - 3, ghost.py - 3, 2, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(ghost.px + 5, ghost.py - 3, 2, 0, Math.PI * 2); ctx.fill();
    }

    // Overlay messages
    if (g.state === "start") {
      ctx.fillStyle = "rgba(0,0,0,0.6)";
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = "#ffe000";
      ctx.font = "bold 28px monospace";
      ctx.textAlign = "center";
      ctx.fillText("PAC-MAN", W / 2, H / 2 - 30);
      ctx.fillStyle = "#fff";
      ctx.font = "16px monospace";
      ctx.fillText("Arrow keys / WASD to move", W / 2, H / 2 + 10);
      ctx.fillText("Swipe on mobile", W / 2, H / 2 + 32);
      ctx.fillStyle = "#ffe000";
      ctx.font = "bold 18px monospace";
      ctx.fillText("Press Space or tap to start", W / 2, H / 2 + 64);
    } else if (g.state === "dead") {
      ctx.fillStyle = "rgba(0,0,0,0.55)";
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = "#ff4444";
      ctx.font = "bold 24px monospace";
      ctx.textAlign = "center";
      ctx.fillText("CAUGHT!", W / 2, H / 2);
    } else if (g.state === "win") {
      ctx.fillStyle = "rgba(0,0,0,0.55)";
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = "#00ff88";
      ctx.font = "bold 22px monospace";
      ctx.textAlign = "center";
      ctx.fillText("LEVEL CLEAR!", W / 2, H / 2);
    } else if (g.state === "gameover") {
      ctx.fillStyle = "rgba(0,0,0,0.7)";
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = "#ff4444";
      ctx.font = "bold 28px monospace";
      ctx.textAlign = "center";
      ctx.fillText("GAME OVER", W / 2, H / 2 - 20);
      ctx.fillStyle = "#fff";
      ctx.font = "18px monospace";
      ctx.fillText(`Score: ${g.score}`, W / 2, H / 2 + 16);
      ctx.fillStyle = "#ffe000";
      ctx.font = "15px monospace";
      ctx.fillText("Space / tap to play again", W / 2, H / 2 + 48);
    }
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
          resetRound(g);
          setDisplay(d => ({ ...d, state: "playing" }));
        }
      }
      return;
    }

    if (g.state === "win") {
      g.deathTimer--;
      draw();
      if (g.deathTimer <= 0) {
        g.level++;
        g.speed = Math.min(3.5, 2 + (g.level - 1) * 0.25);
        g.maze = freshMaze();
        g.dotsLeft = countDots(g.maze);
        resetRound(g);
        setDisplay(d => ({ ...d, level: g.level, state: "playing" }));
      }
      return;
    }

    const spd = g.speed;
    const pac = g.pac;

    // Frighten timer
    if (g.frightenTimer > 0) {
      g.frightenTimer--;
      if (g.frightenTimer === 0) {
        for (const gh of g.ghosts) { gh.frightened = false; }
      }
    }

    // Ghost release
    for (const gh of g.ghosts) {
      if (!gh.released) {
        gh.releaseTimer--;
        if (gh.releaseTimer <= 0) {
          gh.released = true;
          gh.x = GHOST_HOME.x; gh.y = GHOST_HOME.y;
          gh.px = gh.x * CELL + CELL / 2; gh.py = gh.y * CELL + CELL / 2;
        }
      }
    }

    // Move pac-man
    const targetPX = pac.x * CELL + CELL / 2;
    const targetPY = pac.y * CELL + CELL / 2;
    const atCenter = Math.abs(pac.px - targetPX) < spd + 1 && Math.abs(pac.py - targetPY) < spd + 1;

    if (atCenter) {
      pac.px = targetPX; pac.py = targetPY;
      // Try next direction
      if (canMove(g.maze, pac.x, pac.y, pac.nextDir)) {
        pac.dir = pac.nextDir;
      }
      if (canMove(g.maze, pac.x, pac.y, pac.dir)) {
        pac.x += DX[pac.dir]; pac.y += DY[pac.dir];
        // Tunnel
        if (pac.x < 0) { pac.x = COLS - 1; pac.px = (COLS - 1) * CELL + CELL / 2; }
        if (pac.x >= COLS) { pac.x = 0; pac.px = CELL / 2; }
      }
      // Eat dot
      const cell = g.maze[pac.y]?.[pac.x];
      if (cell === 0) {
        g.maze[pac.y][pac.x] = 2;
        g.score += 10;
        g.dotsLeft--;
        setDisplay(d => ({ ...d, score: g.score }));
      } else if (cell === 3) {
        g.maze[pac.y][pac.x] = 2;
        g.score += 50;
        g.dotsLeft--;
        g.frightenTimer = 400;
        g.ghostCombo = 0;
        for (const gh of g.ghosts) { if (!gh.eaten) gh.frightened = true; }
        setDisplay(d => ({ ...d, score: g.score }));
      }
    } else {
      // Move toward center
      if (pac.px < targetPX) pac.px = Math.min(pac.px + spd, targetPX);
      else if (pac.px > targetPX) pac.px = Math.max(pac.px - spd, targetPX);
      if (pac.py < targetPY) pac.py = Math.min(pac.py + spd, targetPY);
      else if (pac.py > targetPY) pac.py = Math.max(pac.py - spd, targetPY);
    }

    // Mouth animation
    pac.mouth += pac.mouthDir * 0.15;
    if (pac.mouth >= 1) pac.mouthDir = -1;
    if (pac.mouth <= 0) pac.mouthDir = 1;

    // Check win
    if (g.dotsLeft <= 0) {
      g.state = "win";
      g.deathTimer = 120;
      setDisplay(d => ({ ...d, state: "win" }));
      draw();
      return;
    }

    // Move ghosts
    const scatter = g.frame < 200 || (g.frame > 400 && g.frame < 600);
    for (const gh of g.ghosts) {
      if (!gh.released) continue;

      const tpx = gh.x * CELL + CELL / 2;
      const tpy = gh.y * CELL + CELL / 2;
      const gAtCenter = Math.abs(gh.px - tpx) < spd + 1 && Math.abs(gh.py - tpy) < spd + 1;

      if (gAtCenter) {
        gh.px = tpx; gh.py = tpy;
        gh.dir = chooseGhostDir(gh, g.maze, pac.x, pac.y, scatter);
        const nx = gh.x + DX[gh.dir], ny = gh.y + DY[gh.dir];
        if (nx >= 0 && nx < COLS && ny >= 0 && ny < ROWS && !isWall(g.maze, nx, ny)) {
          gh.x = nx; gh.y = ny;
        }
        // Return eaten ghost to house
        if (gh.eaten && gh.x === GHOST_HOME.x && gh.y === GHOST_HOME.y) {
          gh.eaten = false; gh.frightened = false;
          gh.releaseTimer = 60;
          gh.released = false;
        }
      } else {
        const gs = gh.eaten ? spd * 2 : (gh.frightened ? spd * 0.6 : spd);
        if (gh.px < tpx) gh.px = Math.min(gh.px + gs, tpx);
        else if (gh.px > tpx) gh.px = Math.max(gh.px - gs, tpx);
        if (gh.py < tpy) gh.py = Math.min(gh.py + gs, tpy);
        else if (gh.py > tpy) gh.py = Math.max(gh.py - gs, tpy);
      }

      // Collision with pac
      if (!gh.eaten && Math.abs(gh.px - pac.px) < CELL - 4 && Math.abs(gh.py - pac.py) < CELL - 4) {
        if (gh.frightened) {
          gh.eaten = true; gh.frightened = false;
          g.ghostCombo++;
          const pts = 200 * (2 ** (g.ghostCombo - 1));
          g.score += pts;
          setDisplay(d => ({ ...d, score: g.score }));
        } else {
          g.lives--;
          g.state = "dead";
          g.deathTimer = 90;
          setDisplay(d => ({ ...d, lives: g.lives, state: "dead" }));
          draw();
          return;
        }
      }
    }

    draw();
  }, [draw, canMove, chooseGhostDir, isWall, resetRound]);

  const startGame = useCallback(() => {
    const g = gameRef.current;
    if (g.state === "gameover") {
      g.score = 0; g.lives = 3; g.level = 1; g.speed = 2;
      g.maze = freshMaze(); g.dotsLeft = countDots(g.maze);
      setDisplay({ score: 0, lives: 3, level: 1, state: "playing" });
    } else {
      setDisplay(d => ({ ...d, state: "playing" }));
    }
    resetRound(g);
    g.state = "playing";
  }, [resetRound]);

  // Game loop
  useGameLoop(tick);

  // Keyboard
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const g = gameRef.current;
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        if (g.state === "start" || g.state === "gameover") startGame();
        return;
      }
      const map: Record<string, Dir> = {
        ArrowRight: 0, ArrowDown: 1, ArrowLeft: 2, ArrowUp: 3,
        d: 0, s: 1, a: 2, w: 3, D: 0, S: 1, A: 2, W: 3,
      };
      if (map[e.key] !== undefined) {
        e.preventDefault();
        gameRef.current.pac.nextDir = map[e.key];
        if (g.state === "start") startGame();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [startGame]);

  // Touch
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const onStart = (e: TouchEvent) => {
      e.preventDefault();
      const g = gameRef.current;
      if (g.state === "start" || g.state === "gameover") { startGame(); return; }
      g.touchStart = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    };
    const onEnd = (e: TouchEvent) => {
      const g = gameRef.current;
      if (!g.touchStart) return;
      const dx = e.changedTouches[0].clientX - g.touchStart.x;
      const dy = e.changedTouches[0].clientY - g.touchStart.y;
      g.touchStart = null;
      if (Math.abs(dx) < 10 && Math.abs(dy) < 10) return;
      if (Math.abs(dx) > Math.abs(dy)) g.pac.nextDir = dx > 0 ? 0 : 2;
      else g.pac.nextDir = dy > 0 ? 1 : 3;
    };
    canvas.addEventListener("touchstart", onStart, { passive: false });
    canvas.addEventListener("touchend", onEnd);
    return () => {
      canvas.removeEventListener("touchstart", onStart);
      canvas.removeEventListener("touchend", onEnd);
    };
  }, [startGame]);

  const livesArr = Array.from({ length: Math.max(0, display.lives) });

  return (
    <div className="flex flex-col items-center gap-4">
      {/* HUD */}
      <div className="flex items-center justify-between w-full max-w-[462px] px-1">
        <div className="text-sm text-ink-2">
          Level <span className="text-ink font-bold">{display.level}</span>
        </div>
        <div className="flex gap-1">
          {livesArr.map((_, i) => (
            <svg key={i} width="16" height="16" viewBox="0 0 16 16">
              <path d="M8 14 L2 8 A4 4 0 0 1 8 4 A4 4 0 0 1 14 8 Z" fill="#ffe000" />
            </svg>
          ))}
        </div>
        <div className="text-sm text-ink-2">
          Score <span className="text-ink font-bold">{display.score}</span>
        </div>
      </div>

      {/* Canvas */}
      <canvas
        ref={canvasRef}
        width={W}
        height={H}
        className="max-w-full h-auto rounded-lg border border-line cursor-pointer touch-none"
        style={{ imageRendering: "pixelated" }}
        onClick={() => {
          const g = gameRef.current;
          if (g.state === "start" || g.state === "gameover") startGame();
        }}
      />

      <p className="text-xs text-ink-3">Arrow keys / WASD — Swipe on mobile</p>
    </div>
  );
}
