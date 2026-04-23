"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import DownloadButton from "./DownloadButton";
import { useGameLoop } from "./useGameLoop";

const CANVAS_W = 600;
const CANVAS_H = 450;
const GOAL_Y = 50;
const GOAL_WIDTH = 320;
const GOAL_LEFT = (CANVAS_W - GOAL_WIDTH) / 2;
const GOAL_RIGHT = GOAL_LEFT + GOAL_WIDTH;
const GOAL_HEIGHT = 80;
const BALL_R = 12;
const BALL_START_Y = CANVAS_H - 60;
const KEEPER_W = 50;
const KEEPER_H = 30;
const KEEPER_Y = GOAL_Y + 10;

type Phase = "aim" | "shooting" | "result" | "gameover";

export default function SoccerGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [aim, setAim] = useState(0); // -1 left to 1 right
  const [power, setPower] = useState(0.5);
  const [phase, setPhase] = useState<Phase>("aim");
  const [score, setScore] = useState(0);
  const [misses, setMisses] = useState(0);
  const [best, setBest] = useState(0);
  const [msg, setMsg] = useState<string | null>(null);

  const ballRef = useRef({ x: CANVAS_W / 2, y: BALL_START_Y, vx: 0, vy: 0 });
  const keeperXRef = useRef(CANVAS_W / 2);
  const keeperTargetRef = useRef(CANVAS_W / 2);
  const phaseRef = useRef<Phase>("aim");

  useEffect(() => {
    try {
      const saved = localStorage.getItem("pb-soccer-best");
      if (saved) setBest(parseInt(saved, 10) || 0);
    } catch {}
  }, []);

  const resetBall = useCallback(() => {
    ballRef.current = { x: CANVAS_W / 2, y: BALL_START_Y, vx: 0, vy: 0 };
  }, []);

  const startShoot = () => {
    if (phaseRef.current !== "aim") return;
    // Keeper picks a side
    const leftShot = aim < -0.15;
    const rightShot = aim > 0.15;
    const r = Math.random();
    if (r < 0.5) {
      keeperTargetRef.current = leftShot
        ? GOAL_LEFT + KEEPER_W
        : rightShot
        ? GOAL_RIGHT - KEEPER_W
        : CANVAS_W / 2;
    } else {
      keeperTargetRef.current =
        GOAL_LEFT + KEEPER_W + Math.random() * (GOAL_WIDTH - KEEPER_W * 2);
    }

    const targetX = CANVAS_W / 2 + aim * (GOAL_WIDTH / 2 + 20);
    const ball = ballRef.current;
    const dx = targetX - ball.x;
    const dy = GOAL_Y + GOAL_HEIGHT / 2 - ball.y;
    const speed = 6 + power * 12;
    const dist = Math.hypot(dx, dy);
    ball.vx = (dx / dist) * speed;
    ball.vy = (dy / dist) * speed;
    phaseRef.current = "shooting";
    setPhase("shooting");
  };

  const endShot = useCallback(
    (result: "goal" | "save" | "miss") => {
      phaseRef.current = "result";
      setPhase("result");
      if (result === "goal") {
        const next = score + 1;
        setScore(next);
        setMsg("GOAL! ⚽");
        if (next > best) {
          setBest(next);
          try {
            localStorage.setItem("pb-soccer-best", String(next));
          } catch {}
        }
      } else {
        setMsg(result === "save" ? "SAVED 🧤" : "MISS!");
        const nextMisses = misses + 1;
        setMisses(nextMisses);
        if (nextMisses >= 3) {
          phaseRef.current = "gameover";
          setPhase("gameover");
          return;
        }
      }
      setTimeout(() => {
        if (phaseRef.current === "result") {
          resetBall();
          keeperXRef.current = CANVAS_W / 2;
          setAim(0);
          setPower(0.5);
          setMsg(null);
          phaseRef.current = "aim";
          setPhase("aim");
        }
      }, 1200);
    },
    [best, misses, resetBall, score]
  );

  const tick = useCallback(() => {
    const ball = ballRef.current;
    if (phaseRef.current === "shooting") {
      ball.x += ball.vx;
      ball.y += ball.vy;

      // Keeper dive
      const dx = keeperTargetRef.current - keeperXRef.current;
      keeperXRef.current += Math.sign(dx) * Math.min(6, Math.abs(dx));

      // Collision with keeper
      if (
        ball.y - BALL_R < KEEPER_Y + KEEPER_H &&
        ball.y + BALL_R > KEEPER_Y &&
        ball.x + BALL_R > keeperXRef.current - KEEPER_W / 2 &&
        ball.x - BALL_R < keeperXRef.current + KEEPER_W / 2
      ) {
        endShot("save");
      } else if (ball.y < GOAL_Y + GOAL_HEIGHT) {
        // Reached goal line area
        if (
          ball.y < GOAL_Y + 10 &&
          ball.x > GOAL_LEFT &&
          ball.x < GOAL_RIGHT
        ) {
          endShot("goal");
        } else if (ball.y < -BALL_R || ball.x < -BALL_R || ball.x > CANVAS_W + BALL_R) {
          endShot("miss");
        }
      }
    }

    // Draw
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        // Pitch
        ctx.fillStyle = "#2d7d2d";
        ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
        ctx.strokeStyle = "#1f5c1f";
        ctx.lineWidth = 1;
        for (let y = 0; y < CANVAS_H; y += 40) {
          ctx.fillStyle = y % 80 === 0 ? "#2d7d2d" : "#286c28";
          ctx.fillRect(0, y, CANVAS_W, 40);
        }

        // Goal
        ctx.strokeStyle = "#fff";
        ctx.lineWidth = 5;
        ctx.strokeRect(GOAL_LEFT, GOAL_Y, GOAL_WIDTH, GOAL_HEIGHT);
        // Net
        ctx.strokeStyle = "rgba(255,255,255,0.35)";
        ctx.lineWidth = 1;
        for (let x = GOAL_LEFT; x < GOAL_RIGHT; x += 16) {
          ctx.beginPath();
          ctx.moveTo(x, GOAL_Y);
          ctx.lineTo(x, GOAL_Y + GOAL_HEIGHT);
          ctx.stroke();
        }
        for (let y = GOAL_Y; y < GOAL_Y + GOAL_HEIGHT; y += 12) {
          ctx.beginPath();
          ctx.moveTo(GOAL_LEFT, y);
          ctx.lineTo(GOAL_RIGHT, y);
          ctx.stroke();
        }

        // Keeper
        ctx.fillStyle = "#fbbf24";
        ctx.fillRect(
          keeperXRef.current - KEEPER_W / 2,
          KEEPER_Y,
          KEEPER_W,
          KEEPER_H
        );

        // Ball
        ctx.fillStyle = "#fff";
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, BALL_R, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#000";
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Aim preview
        if (phaseRef.current === "aim") {
          const targetX = CANVAS_W / 2 + aim * (GOAL_WIDTH / 2 + 20);
          const targetY = GOAL_Y + GOAL_HEIGHT / 2;
          ctx.strokeStyle = "rgba(255,255,255,0.4)";
          ctx.setLineDash([6, 4]);
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(ball.x, ball.y);
          ctx.lineTo(targetX, targetY);
          ctx.stroke();
          ctx.setLineDash([]);
          ctx.fillStyle = "rgba(255,255,255,0.9)";
          ctx.beginPath();
          ctx.arc(targetX, targetY, 8, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

  }, [aim, endShot]);

  useGameLoop(tick);

  const newGame = () => {
    setScore(0);
    setMisses(0);
    setMsg(null);
    resetBall();
    setAim(0);
    setPower(0.5);
    phaseRef.current = "aim";
    setPhase("aim");
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex items-center gap-6 text-white text-lg bg-gray-900 px-4 py-2 rounded">
        <div>
          Score: <span className="font-bold">{score}</span>
        </div>
        <div>
          Misses: <span className="font-bold text-red-400">{misses}/3</span>
        </div>
        <div>
          Best: <span className="font-bold text-yellow-400">{best}</span>
        </div>
      </div>

      <div className="relative">
        <canvas
          ref={canvasRef}
          width={CANVAS_W}
          height={CANVAS_H}
          className="border-4 border-gray-700 rounded-lg max-w-full h-auto"
        />
        {msg && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-5xl font-extrabold text-white drop-shadow-lg">{msg}</div>
          </div>
        )}
        {phase === "gameover" && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-lg">
            <div className="bg-white text-gray-900 px-8 py-6 rounded-lg text-center">
              <div className="text-2xl font-bold mb-2">Game Over</div>
              <div className="mb-1">Goals: {score}</div>
              <div className="mb-3">
                Best: <span className="text-yellow-600 font-bold">{best}</span>
              </div>
              <button
                onClick={newGame}
                className="px-6 py-2 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-700"
              >
                Play Again
              </button>
            </div>
          </div>
        )}
      </div>

      {phase === "aim" && (
        <div className="flex flex-col items-center gap-3 w-full max-w-md">
          <div className="w-full">
            <label className="text-white text-sm">Aim</label>
            <input
              type="range"
              min={-100}
              max={100}
              value={Math.round(aim * 100)}
              onChange={(e) => setAim(parseInt(e.target.value, 10) / 100)}
              className="w-full"
            />
          </div>
          <div className="w-full">
            <label className="text-white text-sm">Power</label>
            <input
              type="range"
              min={0}
              max={100}
              value={Math.round(power * 100)}
              onChange={(e) => setPower(parseInt(e.target.value, 10) / 100)}
              className="w-full"
            />
          </div>
          <button
            onClick={startShoot}
            className="px-8 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg text-lg"
          >
            SHOOT!
          </button>
        </div>
      )}

      <DownloadButton canvasRef={canvasRef} filename="penalty-kick" />
    </div>
  );
}
