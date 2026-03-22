"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import DownloadButton from "./DownloadButton";

type GameState = "aiming" | "shooting" | "scored" | "saved" | "gameover";

export default function SoccerGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [displayState, setDisplayState] = useState<"start" | "playing" | "gameover">("start");
  const [goals, setGoals] = useState(0);
  const [round, setRound] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const [lastResult, setLastResult] = useState<"scored" | "saved" | null>(null);

  const stateRef = useRef<GameState>("aiming");
  const goalsRef = useRef(0);
  const roundRef = useRef(0);
  const bestRef = useRef(0);
  const aimXRef = useRef(0.5); // 0-1, horizontal aim
  const aimYRef = useRef(0.5); // 0-1, vertical aim (low-high)
  const aimDirXRef = useRef(1);
  const aimDirYRef = useRef(0.7);
  const aimSpeedRef = useRef(0.012);
  const ballRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0, t: 0 });
  const keeperRef = useRef({ x: 0.5, targetX: 0.5, diving: false });
  const animIdRef = useRef(0);
  const resultTimerRef = useRef(0);

  const CW = 400;
  const CH = 500;
  const GOAL_TOP = 80;
  const GOAL_BOT = 220;
  const GOAL_LEFT = 80;
  const GOAL_RIGHT = 320;
  const GOAL_W = GOAL_RIGHT - GOAL_LEFT;
  const GOAL_H = GOAL_BOT - GOAL_TOP;
  const TOTAL_ROUNDS = 10;

  useEffect(() => {
    const s = localStorage.getItem("pb-soccer");
    if (s) { bestRef.current = parseInt(s, 10); setBestScore(bestRef.current); }
  }, []);

  const drawGoal = (ctx: CanvasRenderingContext2D) => {
    // Goal net
    ctx.fillStyle = "rgba(255,255,255,0.08)";
    ctx.fillRect(GOAL_LEFT, GOAL_TOP, GOAL_W, GOAL_H);

    // Net lines
    ctx.strokeStyle = "rgba(255,255,255,0.15)";
    ctx.lineWidth = 0.5;
    for (let x = GOAL_LEFT; x <= GOAL_RIGHT; x += 20) {
      ctx.beginPath(); ctx.moveTo(x, GOAL_TOP); ctx.lineTo(x, GOAL_BOT); ctx.stroke();
    }
    for (let y = GOAL_TOP; y <= GOAL_BOT; y += 20) {
      ctx.beginPath(); ctx.moveTo(GOAL_LEFT, y); ctx.lineTo(GOAL_RIGHT, y); ctx.stroke();
    }

    // Goal posts
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(GOAL_LEFT, GOAL_BOT);
    ctx.lineTo(GOAL_LEFT, GOAL_TOP);
    ctx.lineTo(GOAL_RIGHT, GOAL_TOP);
    ctx.lineTo(GOAL_RIGHT, GOAL_BOT);
    ctx.stroke();
  };

  const drawKeeper = (ctx: CanvasRenderingContext2D) => {
    const kx = GOAL_LEFT + keeperRef.current.x * GOAL_W;
    const ky = GOAL_BOT - 50;
    const diving = keeperRef.current.diving;
    const diveOffset = diving ? (keeperRef.current.targetX - 0.5) * 40 : 0;

    ctx.fillStyle = "#22c55e";
    // Body
    ctx.fillRect(kx - 10 + diveOffset, ky - 20, 20, 40);
    // Head
    ctx.fillStyle = "#fbbf24";
    ctx.beginPath();
    ctx.arc(kx + diveOffset, ky - 26, 8, 0, Math.PI * 2);
    ctx.fill();
    // Arms
    ctx.strokeStyle = "#22c55e";
    ctx.lineWidth = 4;
    ctx.lineCap = "round";
    if (diving) {
      const armDir = keeperRef.current.targetX > 0.5 ? 1 : -1;
      ctx.beginPath();
      ctx.moveTo(kx + diveOffset, ky - 14);
      ctx.lineTo(kx + diveOffset + armDir * 30, ky - 30);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(kx + diveOffset, ky - 8);
      ctx.lineTo(kx + diveOffset + armDir * 25, ky - 5);
      ctx.stroke();
    } else {
      ctx.beginPath();
      ctx.moveTo(kx - 10, ky - 14); ctx.lineTo(kx - 24, ky - 24);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(kx + 10, ky - 14); ctx.lineTo(kx + 24, ky - 24);
      ctx.stroke();
    }
    // Gloves
    ctx.fillStyle = "#f97316";
    if (diving) {
      const armDir = keeperRef.current.targetX > 0.5 ? 1 : -1;
      ctx.beginPath();
      ctx.arc(kx + diveOffset + armDir * 30, ky - 30, 5, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.beginPath(); ctx.arc(kx - 24, ky - 24, 5, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(kx + 24, ky - 24, 5, 0, Math.PI * 2); ctx.fill();
    }
  };

  const drawBall = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number) => {
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
    // Pentagon pattern
    ctx.fillStyle = "#333";
    for (let i = 0; i < 5; i++) {
      const a = (i * Math.PI * 2) / 5 - Math.PI / 2;
      ctx.beginPath();
      ctx.arc(x + Math.cos(a) * size * 0.45, y + Math.sin(a) * size * 0.45, size * 0.18, 0, Math.PI * 2);
      ctx.fill();
    }
  };

  const drawAimCrosshair = (ctx: CanvasRenderingContext2D) => {
    const ax = GOAL_LEFT + aimXRef.current * GOAL_W;
    const ay = GOAL_TOP + (1 - aimYRef.current) * GOAL_H;

    ctx.strokeStyle = "rgba(255,50,50,0.8)";
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 4]);
    // Crosshair
    ctx.beginPath(); ctx.moveTo(ax - 15, ay); ctx.lineTo(ax + 15, ay); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(ax, ay - 15); ctx.lineTo(ax, ay + 15); ctx.stroke();
    ctx.setLineDash([]);
    // Circle
    ctx.beginPath(); ctx.arc(ax, ay, 10, 0, Math.PI * 2); ctx.stroke();
  };

  const shoot = useCallback(() => {
    if (stateRef.current !== "aiming") return;
    stateRef.current = "shooting";

    const targetX = GOAL_LEFT + aimXRef.current * GOAL_W;
    const targetY = GOAL_TOP + (1 - aimYRef.current) * GOAL_H;

    ballRef.current = { x: CW / 2, y: CH - 60, targetX, targetY, t: 0 };

    // Keeper dives
    const difficulty = Math.min(0.7, 0.2 + roundRef.current * 0.05);
    // Keeper guesses with some randomness, biased toward the shot
    const keeperGuess = aimXRef.current + (Math.random() - 0.5) * (1 - difficulty) * 1.5;
    keeperRef.current.targetX = Math.max(0.1, Math.min(0.9, keeperGuess));
    keeperRef.current.diving = true;
  }, []);

  const nextRound = useCallback(() => {
    roundRef.current++;
    setRound(roundRef.current);

    if (roundRef.current >= TOTAL_ROUNDS) {
      stateRef.current = "gameover";
      setDisplayState("gameover");
      if (goalsRef.current > bestRef.current) {
        bestRef.current = goalsRef.current;
        setBestScore(bestRef.current);
        localStorage.setItem("pb-soccer", bestRef.current.toString());
      }
      return;
    }

    stateRef.current = "aiming";
    keeperRef.current = { x: 0.5, targetX: 0.5, diving: false };
    aimSpeedRef.current = Math.min(0.025, 0.012 + roundRef.current * 0.0015);
  }, []);

  const gameLoop = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Background - pitch
    const grad = ctx.createLinearGradient(0, 0, 0, CH);
    grad.addColorStop(0, "#1a472a");
    grad.addColorStop(1, "#2d6e3f");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, CW, CH);

    // Pitch lines
    ctx.strokeStyle = "rgba(255,255,255,0.12)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(CW / 2, GOAL_BOT + 40, 50, 0, Math.PI * 2);
    ctx.stroke();
    // Penalty box
    ctx.strokeRect(GOAL_LEFT - 30, GOAL_BOT, GOAL_W + 60, 140);

    drawGoal(ctx);

    // Aim movement
    if (stateRef.current === "aiming") {
      aimXRef.current += aimDirXRef.current * aimSpeedRef.current;
      aimYRef.current += aimDirYRef.current * aimSpeedRef.current * 0.6;
      if (aimXRef.current <= 0 || aimXRef.current >= 1) aimDirXRef.current *= -1;
      if (aimYRef.current <= 0 || aimYRef.current >= 1) aimDirYRef.current *= -1;
      aimXRef.current = Math.max(0, Math.min(1, aimXRef.current));
      aimYRef.current = Math.max(0, Math.min(1, aimYRef.current));

      drawAimCrosshair(ctx);
      drawKeeper(ctx);
      drawBall(ctx, CW / 2, CH - 60, 14);
    }

    // Ball animation
    if (stateRef.current === "shooting") {
      const b = ballRef.current;
      b.t += 0.04;
      if (b.t >= 1) b.t = 1;

      const ease = 1 - Math.pow(1 - b.t, 3);
      const bx = b.x + (b.targetX - b.x) * ease;
      const by = b.y + (b.targetY - b.y) * ease;
      const size = 14 - ease * 6; // gets smaller (perspective)

      // Keeper movement
      const k = keeperRef.current;
      k.x += (k.targetX - k.x) * 0.08;

      drawKeeper(ctx);
      drawBall(ctx, bx, by, size);

      if (b.t >= 1) {
        // Check if keeper saved it
        const kx = k.x;
        const shotX = aimXRef.current;
        const dist = Math.abs(kx - shotX);
        const saved = dist < 0.18;

        if (saved) {
          stateRef.current = "saved";
          setLastResult("saved");
        } else {
          goalsRef.current++;
          setGoals(goalsRef.current);
          stateRef.current = "scored";
          setLastResult("scored");
        }
        resultTimerRef.current = Date.now();
      }
    }

    // Result display
    if (stateRef.current === "scored" || stateRef.current === "saved") {
      drawKeeper(ctx);
      const elapsed = Date.now() - resultTimerRef.current;

      ctx.font = "bold 48px sans-serif";
      ctx.textAlign = "center";
      const alpha = Math.min(1, elapsed / 300);
      ctx.globalAlpha = alpha;

      if (stateRef.current === "scored") {
        ctx.fillStyle = "#22c55e";
        ctx.fillText("GOAL!", CW / 2, CH / 2 - 20);
      } else {
        ctx.fillStyle = "#ef4444";
        ctx.fillText("SAVED!", CW / 2, CH / 2 - 20);
      }
      ctx.globalAlpha = 1;

      if (elapsed > 1200) {
        setLastResult(null);
        nextRound();
      }
    }

    // HUD
    ctx.font = "bold 18px sans-serif";
    ctx.fillStyle = "#fff";
    ctx.textAlign = "left";
    ctx.fillText(`Goals: ${goalsRef.current}/${TOTAL_ROUNDS}`, 12, 30);
    ctx.textAlign = "right";
    ctx.fillStyle = "#94a3b8";
    ctx.font = "14px sans-serif";
    ctx.fillText(`Round ${Math.min(roundRef.current + 1, TOTAL_ROUNDS)}/${TOTAL_ROUNDS}`, CW - 12, 30);
    ctx.textAlign = "left";
    ctx.fillText(`Best: ${bestRef.current}`, 12, 50);

    if (stateRef.current !== "gameover") {
      animIdRef.current = requestAnimationFrame(gameLoop);
    }
  }, [nextRound]);

  useEffect(() => {
    return () => { if (animIdRef.current) cancelAnimationFrame(animIdRef.current); };
  }, []);

  const startGame = () => {
    goalsRef.current = 0;
    roundRef.current = 0;
    stateRef.current = "aiming";
    keeperRef.current = { x: 0.5, targetX: 0.5, diving: false };
    aimXRef.current = 0.5;
    aimYRef.current = 0.5;
    aimDirXRef.current = 1;
    aimDirYRef.current = 0.7;
    aimSpeedRef.current = 0.012;
    setGoals(0);
    setRound(0);
    setLastResult(null);
    setDisplayState("playing");
    animIdRef.current = requestAnimationFrame(gameLoop);
  };

  const handleClick = () => {
    if (stateRef.current === "aiming") shoot();
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === "Space") { e.preventDefault(); handleClick(); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const handleShare = async () => {
    const text = `I scored ${goalsRef.current}/${TOTAL_ROUNDS} goals in Penalty Kicks! Can you beat me? https://playmini.fun/soccer`;
    if (navigator.share) {
      try { await navigator.share({ text }); } catch {}
    } else {
      try { await navigator.clipboard.writeText(text); alert("Copied!"); } catch {}
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative">
        <canvas
          ref={canvasRef}
          width={CW}
          height={CH}
          className="rounded-2xl cursor-pointer max-w-full h-auto border border-slate-700"
          onClick={handleClick}
          onTouchStart={(e) => { e.preventDefault(); handleClick(); }}
          style={{ touchAction: "manipulation" }}
        />

        {displayState === "start" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/85 rounded-2xl backdrop-blur-sm">
            <div className="text-5xl mb-3">&#9917;</div>
            <h2 className="text-3xl font-black text-green-400 mb-2">Penalty Kicks</h2>
            <p className="text-gray-400 mb-6 text-sm text-center px-6">
              Tap to shoot when the crosshair is where you want!
            </p>
            <button
              onClick={startGame}
              className="px-10 py-3 bg-green-600 hover:bg-green-500 text-white font-bold rounded-2xl transition-all hover:scale-105 active:scale-95"
            >
              Play
            </button>
            {bestScore > 0 && (
              <p className="text-yellow-400 text-sm mt-3">Best: {bestScore}/{TOTAL_ROUNDS}</p>
            )}
          </div>
        )}

        {displayState === "gameover" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/85 rounded-2xl backdrop-blur-sm">
            <h2 className="text-3xl font-black text-green-400 mb-4">Full Time!</h2>
            <div className="bg-slate-900/80 rounded-xl px-6 py-3 mb-6 text-center">
              <p className="text-white text-xl font-bold">Goals: {goals}/{TOTAL_ROUNDS}</p>
              <p className="text-gray-400 text-sm mt-1">Best: {bestScore}</p>
              {goals >= bestScore && goals > 0 && (
                <p className="text-yellow-400 text-sm font-bold mt-1">New Best!</p>
              )}
            </div>
            <div className="flex gap-3">
              <button onClick={startGame} className="px-6 py-3 bg-green-600 hover:bg-green-500 text-white font-bold rounded-xl transition-all hover:scale-105 active:scale-95">
                Play Again
              </button>
              <button onClick={handleShare} className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all hover:scale-105 active:scale-95">
                Share
              </button>
              <DownloadButton canvasRef={canvasRef} filename="soccer-score" label="Save" />
            </div>
          </div>
        )}
      </div>

      {displayState === "playing" && (
        <p className="text-gray-500 text-xs text-center">Tap or press Space to shoot</p>
      )}
    </div>
  );
}
