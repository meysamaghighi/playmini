"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import DownloadButton from "./DownloadButton";
import { useGameLoop } from "./useGameLoop";

const CANVAS_W = 600;
const CANVAS_H = 480;
const PADDLE_W = 100;
const PADDLE_H = 12;
const PADDLE_Y = CANVAS_H - 40;
const BALL_R = 7;
const BRICK_ROWS = 6;
const BRICK_COLS = 10;
const BRICK_W = (CANVAS_W - 40) / BRICK_COLS;
const BRICK_H = 22;
const BRICK_TOP = 60;
const BRICK_GAP = 4;

type GameState = "ready" | "playing" | "gameover" | "won";
type Brick = { x: number; y: number; alive: boolean; color: string };

const ROW_COLORS = ["#ef4444", "#f97316", "#facc15", "#22c55e", "#3b82f6", "#a855f7"];

function makeBricks(): Brick[] {
  const out: Brick[] = [];
  for (let r = 0; r < BRICK_ROWS; r++) {
    for (let c = 0; c < BRICK_COLS; c++) {
      out.push({
        x: 20 + c * BRICK_W,
        y: BRICK_TOP + r * (BRICK_H + BRICK_GAP),
        alive: true,
        color: ROW_COLORS[r],
      });
    }
  }
  return out;
}

export default function BreakoutGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameState, setGameState] = useState<GameState>("ready");
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [level, setLevel] = useState(1);
  const [best, setBest] = useState(0);

  const paddleXRef = useRef(CANVAS_W / 2 - PADDLE_W / 2);
  const ballRef = useRef({ x: CANVAS_W / 2, y: PADDLE_Y - 20, vx: 4, vy: -4 });
  const bricksRef = useRef<Brick[]>(makeBricks());
  const stateRef = useRef<GameState>("ready");
  const scoreRef = useRef(0);
  const livesRef = useRef(3);
  const levelRef = useRef(1);
  const keysRef = useRef<{ left: boolean; right: boolean }>({ left: false, right: false });

  const baseSpeed = useCallback(() => 4 + (levelRef.current - 1) * 0.6, []);

  const resetBall = useCallback(() => {
    const sp = baseSpeed();
    ballRef.current = {
      x: CANVAS_W / 2,
      y: PADDLE_Y - 20,
      vx: (Math.random() < 0.5 ? -1 : 1) * sp,
      vy: -sp,
    };
  }, [baseSpeed]);

  const resetLevel = useCallback(() => {
    bricksRef.current = makeBricks();
    paddleXRef.current = CANVAS_W / 2 - PADDLE_W / 2;
    resetBall();
  }, [resetBall]);

  const reset = useCallback(() => {
    scoreRef.current = 0;
    livesRef.current = 3;
    levelRef.current = 1;
    setScore(0);
    setLives(3);
    setLevel(1);
    resetLevel();
  }, [resetLevel]);

  const start = useCallback(() => {
    reset();
    stateRef.current = "playing";
    setGameState("playing");
  }, [reset]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = "#0f172a";
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

    for (const b of bricksRef.current) {
      if (!b.alive) continue;
      ctx.fillStyle = b.color;
      ctx.fillRect(b.x, b.y, BRICK_W - 2, BRICK_H);
    }

    ctx.fillStyle = "#e2e8f0";
    ctx.fillRect(paddleXRef.current, PADDLE_Y, PADDLE_W, PADDLE_H);

    const ball = ballRef.current;
    ctx.fillStyle = "#fbbf24";
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, BALL_R, 0, Math.PI * 2);
    ctx.fill();
  }, []);

  const tick = useCallback(() => {
    if (stateRef.current === "playing") {
      const speed = 7 + (levelRef.current - 1) * 0.4;
      if (keysRef.current.left) paddleXRef.current -= speed;
      if (keysRef.current.right) paddleXRef.current += speed;
      paddleXRef.current = Math.max(0, Math.min(CANVAS_W - PADDLE_W, paddleXRef.current));

      const ball = ballRef.current;
      ball.x += ball.vx;
      ball.y += ball.vy;

      if (ball.x - BALL_R < 0) {
        ball.x = BALL_R;
        ball.vx = -ball.vx;
      } else if (ball.x + BALL_R > CANVAS_W) {
        ball.x = CANVAS_W - BALL_R;
        ball.vx = -ball.vx;
      }
      if (ball.y - BALL_R < 0) {
        ball.y = BALL_R;
        ball.vy = -ball.vy;
      }

      // Paddle collision
      if (
        ball.vy > 0 &&
        ball.y + BALL_R >= PADDLE_Y &&
        ball.y - BALL_R <= PADDLE_Y + PADDLE_H &&
        ball.x >= paddleXRef.current &&
        ball.x <= paddleXRef.current + PADDLE_W
      ) {
        const hit = (ball.x - (paddleXRef.current + PADDLE_W / 2)) / (PADDLE_W / 2);
        const speed = Math.hypot(ball.vx, ball.vy);
        const angle = hit * (Math.PI / 3);
        ball.vx = speed * Math.sin(angle);
        ball.vy = -Math.abs(speed * Math.cos(angle));
        ball.y = PADDLE_Y - BALL_R - 1;
      }

      // Brick collision
      for (const b of bricksRef.current) {
        if (!b.alive) continue;
        if (
          ball.x + BALL_R > b.x &&
          ball.x - BALL_R < b.x + BRICK_W - 2 &&
          ball.y + BALL_R > b.y &&
          ball.y - BALL_R < b.y + BRICK_H
        ) {
          b.alive = false;
          scoreRef.current += 10;
          setScore(scoreRef.current);
          // Determine bounce direction
          const prevX = ball.x - ball.vx;
          const prevY = ball.y - ball.vy;
          const fromSide = prevX <= b.x || prevX >= b.x + BRICK_W - 2;
          const fromTopBottom = prevY <= b.y || prevY >= b.y + BRICK_H;
          if (fromSide && !fromTopBottom) ball.vx = -ball.vx;
          else ball.vy = -ball.vy;
          break;
        }
      }

      // Lose ball
      if (ball.y - BALL_R > CANVAS_H) {
        livesRef.current -= 1;
        setLives(livesRef.current);
        if (livesRef.current <= 0) {
          stateRef.current = "gameover";
          setGameState("gameover");
          setBest((prev) => {
            const next = Math.max(prev, scoreRef.current);
            try {
              localStorage.setItem("pb-breakout-best", String(next));
            } catch {}
            return next;
          });
        } else {
          resetBall();
        }
      }

      // Won this level
      if (bricksRef.current.every((b) => !b.alive)) {
        levelRef.current += 1;
        setLevel(levelRef.current);
        scoreRef.current += 100;
        setScore(scoreRef.current);
        resetLevel();
      }
    }

    draw();
  }, [draw, resetBall, resetLevel]);

  useGameLoop(tick);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("pb-breakout-best");
      if (saved) setBest(parseInt(saved, 10) || 0);
    } catch {}
    resetLevel();
  }, [resetLevel]);

  useEffect(() => {
    const onDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft" || e.key === "a") {
        e.preventDefault();
        keysRef.current.left = true;
      } else if (e.key === "ArrowRight" || e.key === "d") {
        e.preventDefault();
        keysRef.current.right = true;
      }
    };
    const onUp = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft" || e.key === "a") keysRef.current.left = false;
      else if (e.key === "ArrowRight" || e.key === "d") keysRef.current.right = false;
    };
    window.addEventListener("keydown", onDown);
    window.addEventListener("keyup", onUp);
    return () => {
      window.removeEventListener("keydown", onDown);
      window.removeEventListener("keyup", onUp);
    };
  }, []);

  const onPointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * CANVAS_W;
    paddleXRef.current = Math.max(0, Math.min(CANVAS_W - PADDLE_W, x - PADDLE_W / 2));
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex flex-wrap items-center justify-center gap-6 text-white">
        <div>
          Score: <span className="font-bold">{score}</span>
        </div>
        <div>
          Lives: <span className="font-bold">{lives}</span>
        </div>
        <div>
          Level: <span className="font-bold">{level}</span>
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
          onPointerMove={onPointerMove}
          className="border-4 border-gray-700 rounded-lg max-w-full h-auto touch-none"
        />

        {gameState !== "playing" && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-lg">
            <div className="bg-white text-gray-900 px-8 py-6 rounded-lg text-center">
              {gameState === "ready" ? (
                <>
                  <div className="text-2xl font-bold mb-2">Breakout</div>
                  <div className="text-sm text-gray-600 mb-4">Move with mouse or arrow keys</div>
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
                className="px-6 py-2 bg-amber-500 text-white font-bold rounded-lg hover:bg-amber-600"
              >
                {gameState === "ready" ? "Start" : "Play Again"}
              </button>
            </div>
          </div>
        )}
      </div>

      <DownloadButton canvasRef={canvasRef} filename="breakout" />
    </div>
  );
}
