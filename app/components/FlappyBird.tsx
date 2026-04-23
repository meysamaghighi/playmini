"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import DownloadButton from "./DownloadButton";
import { useGameLoop } from "./useGameLoop";

const CANVAS_WIDTH = 400;
const CANVAS_HEIGHT = 600;
const BIRD_X = 80;
const BIRD_SIZE = 28;
const GRAVITY = 0.5;
const FLAP_VELOCITY = -8;
const PIPE_WIDTH = 60;
const PIPE_GAP = 160;
const PIPE_SPEED = 2.5;
const PIPE_SPACING = 220;
const GROUND_HEIGHT = 60;

type Pipe = { x: number; gapY: number; passed: boolean };
type GameState = "ready" | "playing" | "gameover";

export default function FlappyBird() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameState, setGameState] = useState<GameState>("ready");
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);

  const birdYRef = useRef(CANVAS_HEIGHT / 2);
  const birdVRef = useRef(0);
  const pipesRef = useRef<Pipe[]>([]);
  const scoreRef = useRef(0);
  const stateRef = useRef<GameState>("ready");

  const reset = useCallback(() => {
    birdYRef.current = CANVAS_HEIGHT / 2;
    birdVRef.current = 0;
    pipesRef.current = [
      { x: CANVAS_WIDTH + 100, gapY: 200 + Math.random() * 200, passed: false },
      { x: CANVAS_WIDTH + 100 + PIPE_SPACING, gapY: 200 + Math.random() * 200, passed: false },
    ];
    scoreRef.current = 0;
    setScore(0);
  }, []);

  const gameOver = useCallback(() => {
    stateRef.current = "gameover";
    setGameState("gameover");
    setBest((prev) => {
      const next = Math.max(prev, scoreRef.current);
      try {
        localStorage.setItem("pb-flappy-best", String(next));
      } catch {}
      return next;
    });
  }, []);

  const flap = useCallback(() => {
    if (stateRef.current === "ready") {
      reset();
      stateRef.current = "playing";
      setGameState("playing");
      birdVRef.current = FLAP_VELOCITY;
    } else if (stateRef.current === "playing") {
      birdVRef.current = FLAP_VELOCITY;
    } else if (stateRef.current === "gameover") {
      reset();
      stateRef.current = "ready";
      setGameState("ready");
    }
  }, [reset]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const grad = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
    grad.addColorStop(0, "#70c5ce");
    grad.addColorStop(1, "#9be0c5");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    ctx.fillStyle = "#5cb85c";
    ctx.strokeStyle = "#2e7d32";
    ctx.lineWidth = 2;
    for (const p of pipesRef.current) {
      ctx.fillRect(p.x, 0, PIPE_WIDTH, p.gapY - PIPE_GAP / 2);
      ctx.strokeRect(p.x, 0, PIPE_WIDTH, p.gapY - PIPE_GAP / 2);
      const bottomY = p.gapY + PIPE_GAP / 2;
      ctx.fillRect(p.x, bottomY, PIPE_WIDTH, CANVAS_HEIGHT - GROUND_HEIGHT - bottomY);
      ctx.strokeRect(p.x, bottomY, PIPE_WIDTH, CANVAS_HEIGHT - GROUND_HEIGHT - bottomY);
    }

    ctx.fillStyle = "#ded895";
    ctx.fillRect(0, CANVAS_HEIGHT - GROUND_HEIGHT, CANVAS_WIDTH, GROUND_HEIGHT);
    ctx.fillStyle = "#a8a060";
    for (let x = 0; x < CANVAS_WIDTH; x += 20) {
      ctx.fillRect(x, CANVAS_HEIGHT - GROUND_HEIGHT, 10, 4);
    }

    const by = birdYRef.current;
    const tilt = Math.max(-0.5, Math.min(1.2, birdVRef.current / 10));
    ctx.save();
    ctx.translate(BIRD_X, by);
    ctx.rotate(tilt);
    ctx.fillStyle = "#ffd83d";
    ctx.beginPath();
    ctx.arc(0, 0, BIRD_SIZE / 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.arc(6, -4, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#000";
    ctx.beginPath();
    ctx.arc(7, -4, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#f4a522";
    ctx.fillRect(BIRD_SIZE / 2 - 4, -2, 8, 4);
    ctx.restore();

    if (stateRef.current === "playing") {
      ctx.fillStyle = "rgba(0,0,0,0.4)";
      ctx.font = "bold 48px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(String(scoreRef.current), CANVAS_WIDTH / 2 + 2, 82);
      ctx.fillStyle = "#fff";
      ctx.fillText(String(scoreRef.current), CANVAS_WIDTH / 2, 80);
    }
  }, []);

  const tick = useCallback(() => {
    if (stateRef.current === "playing") {
      birdVRef.current += GRAVITY;
      birdYRef.current += birdVRef.current;

      for (const p of pipesRef.current) {
        p.x -= PIPE_SPEED;
        if (!p.passed && p.x + PIPE_WIDTH < BIRD_X) {
          p.passed = true;
          scoreRef.current += 1;
          setScore(scoreRef.current);
        }
      }

      if (pipesRef.current[0] && pipesRef.current[0].x + PIPE_WIDTH < 0) {
        pipesRef.current.shift();
      }
      const last = pipesRef.current[pipesRef.current.length - 1];
      if (last && last.x < CANVAS_WIDTH - PIPE_SPACING) {
        pipesRef.current.push({
          x: last.x + PIPE_SPACING,
          gapY: 120 + Math.random() * (CANVAS_HEIGHT - GROUND_HEIGHT - 240),
          passed: false,
        });
      }

      const by = birdYRef.current;
      if (by + BIRD_SIZE / 2 >= CANVAS_HEIGHT - GROUND_HEIGHT || by - BIRD_SIZE / 2 <= 0) {
        gameOver();
      } else {
        for (const p of pipesRef.current) {
          if (
            BIRD_X + BIRD_SIZE / 2 > p.x &&
            BIRD_X - BIRD_SIZE / 2 < p.x + PIPE_WIDTH &&
            (by - BIRD_SIZE / 2 < p.gapY - PIPE_GAP / 2 ||
              by + BIRD_SIZE / 2 > p.gapY + PIPE_GAP / 2)
          ) {
            gameOver();
            break;
          }
        }
      }
    } else if (stateRef.current === "ready") {
      birdYRef.current = CANVAS_HEIGHT / 2 + Math.sin(Date.now() / 200) * 8;
    }

    draw();
  }, [draw, gameOver]);

  useGameLoop(tick);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("pb-flappy-best");
      if (saved) setBest(parseInt(saved, 10) || 0);
    } catch {}
    reset();
  }, [reset]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === "Space" || e.key === " " || e.key === "ArrowUp") {
        e.preventDefault();
        flap();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [flap]);

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex items-center justify-between w-full max-w-md text-white">
        <div className="text-lg">
          Score: <span className="font-bold">{score}</span>
        </div>
        <div className="text-lg">
          Best: <span className="font-bold text-yellow-400">{best}</span>
        </div>
      </div>

      <div
        className="relative cursor-pointer touch-none select-none"
        onPointerDown={(e) => {
          e.preventDefault();
          flap();
        }}
      >
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          className="border-4 border-gray-700 rounded-lg bg-sky-300 max-w-full h-auto"
        />

        {gameState === "ready" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/30 rounded-lg pointer-events-none">
            <div className="bg-white/90 text-gray-900 px-6 py-4 rounded-lg text-center">
              <div className="font-bold text-xl mb-1">Tap to Start</div>
              <div className="text-sm">Space / Click / Tap to flap</div>
            </div>
          </div>
        )}

        {gameState === "gameover" && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg pointer-events-none">
            <div className="bg-white text-gray-900 px-8 py-6 rounded-lg text-center">
              <div className="text-2xl font-bold mb-2">Game Over</div>
              <div className="mb-1">Score: {score}</div>
              <div className="mb-3">
                Best: <span className="text-yellow-600 font-bold">{best}</span>
              </div>
              <div className="text-sm text-gray-600">Tap to play again</div>
            </div>
          </div>
        )}
      </div>

      <DownloadButton canvasRef={canvasRef} filename="flappy-bird" />
    </div>
  );
}
