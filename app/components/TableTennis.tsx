"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import DownloadButton from "./DownloadButton";

const CANVAS_W = 600;
const CANVAS_H = 400;
const PADDLE_W = 10;
const PADDLE_H = 70;
const BALL_R = 7;
const WIN_SCORE = 7;
const PADDLE_SPEED = 6;

type GameState = "ready" | "playing" | "gameover";

export default function TableTennis() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameState, setGameState] = useState<GameState>("ready");
  const [playerScore, setPlayerScore] = useState(0);
  const [aiScore, setAiScore] = useState(0);
  const [winner, setWinner] = useState<"player" | "ai" | null>(null);

  const playerYRef = useRef(CANVAS_H / 2 - PADDLE_H / 2);
  const aiYRef = useRef(CANVAS_H / 2 - PADDLE_H / 2);
  const ballRef = useRef({ x: CANVAS_W / 2, y: CANVAS_H / 2, vx: 5, vy: 3 });
  const keysRef = useRef<{ up: boolean; down: boolean }>({ up: false, down: false });
  const stateRef = useRef<GameState>("ready");
  const rafRef = useRef<number | null>(null);
  const pScoreRef = useRef(0);
  const aScoreRef = useRef(0);

  const serve = useCallback((toPlayer: boolean) => {
    ballRef.current = {
      x: CANVAS_W / 2,
      y: CANVAS_H / 2,
      vx: toPlayer ? -5 : 5,
      vy: (Math.random() - 0.5) * 6,
    };
  }, []);

  const reset = useCallback(() => {
    pScoreRef.current = 0;
    aScoreRef.current = 0;
    setPlayerScore(0);
    setAiScore(0);
    setWinner(null);
    playerYRef.current = CANVAS_H / 2 - PADDLE_H / 2;
    aiYRef.current = CANVAS_H / 2 - PADDLE_H / 2;
    serve(Math.random() < 0.5);
  }, [serve]);

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

    // Center line
    ctx.strokeStyle = "rgba(255,255,255,0.3)";
    ctx.setLineDash([8, 8]);
    ctx.beginPath();
    ctx.moveTo(CANVAS_W / 2, 0);
    ctx.lineTo(CANVAS_W / 2, CANVAS_H);
    ctx.stroke();
    ctx.setLineDash([]);

    // Paddles
    ctx.fillStyle = "#fff";
    ctx.fillRect(10, playerYRef.current, PADDLE_W, PADDLE_H);
    ctx.fillRect(CANVAS_W - 20, aiYRef.current, PADDLE_W, PADDLE_H);

    // Ball
    const ball = ballRef.current;
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, BALL_R, 0, Math.PI * 2);
    ctx.fill();

    // Score
    ctx.fillStyle = "rgba(255,255,255,0.3)";
    ctx.font = "bold 48px monospace";
    ctx.textAlign = "center";
    ctx.fillText(String(pScoreRef.current), CANVAS_W / 4, 60);
    ctx.fillText(String(aScoreRef.current), (CANVAS_W * 3) / 4, 60);
  }, []);

  const tick = useCallback(() => {
    if (stateRef.current === "playing") {
      if (keysRef.current.up) playerYRef.current -= PADDLE_SPEED;
      if (keysRef.current.down) playerYRef.current += PADDLE_SPEED;
      playerYRef.current = Math.max(0, Math.min(CANVAS_H - PADDLE_H, playerYRef.current));

      // Simple AI
      const ball = ballRef.current;
      const target = ball.y - PADDLE_H / 2;
      const diff = target - aiYRef.current;
      aiYRef.current += Math.sign(diff) * Math.min(4.5, Math.abs(diff));
      aiYRef.current = Math.max(0, Math.min(CANVAS_H - PADDLE_H, aiYRef.current));

      ball.x += ball.vx;
      ball.y += ball.vy;

      if (ball.y - BALL_R < 0) {
        ball.y = BALL_R;
        ball.vy = -ball.vy;
      } else if (ball.y + BALL_R > CANVAS_H) {
        ball.y = CANVAS_H - BALL_R;
        ball.vy = -ball.vy;
      }

      // Player paddle
      if (
        ball.vx < 0 &&
        ball.x - BALL_R < 10 + PADDLE_W &&
        ball.y > playerYRef.current &&
        ball.y < playerYRef.current + PADDLE_H
      ) {
        ball.x = 10 + PADDLE_W + BALL_R;
        const hit = (ball.y - (playerYRef.current + PADDLE_H / 2)) / (PADDLE_H / 2);
        const speed = Math.min(12, Math.hypot(ball.vx, ball.vy) + 0.3);
        const angle = hit * (Math.PI / 4);
        ball.vx = speed * Math.cos(angle);
        ball.vy = speed * Math.sin(angle);
      }
      // AI paddle
      if (
        ball.vx > 0 &&
        ball.x + BALL_R > CANVAS_W - 20 &&
        ball.y > aiYRef.current &&
        ball.y < aiYRef.current + PADDLE_H
      ) {
        ball.x = CANVAS_W - 20 - BALL_R;
        const hit = (ball.y - (aiYRef.current + PADDLE_H / 2)) / (PADDLE_H / 2);
        const speed = Math.min(12, Math.hypot(ball.vx, ball.vy) + 0.3);
        const angle = hit * (Math.PI / 4);
        ball.vx = -speed * Math.cos(angle);
        ball.vy = speed * Math.sin(angle);
      }

      // Score
      if (ball.x < -BALL_R) {
        aScoreRef.current += 1;
        setAiScore(aScoreRef.current);
        if (aScoreRef.current >= WIN_SCORE) {
          stateRef.current = "gameover";
          setGameState("gameover");
          setWinner("ai");
        } else {
          serve(true);
        }
      } else if (ball.x > CANVAS_W + BALL_R) {
        pScoreRef.current += 1;
        setPlayerScore(pScoreRef.current);
        if (pScoreRef.current >= WIN_SCORE) {
          stateRef.current = "gameover";
          setGameState("gameover");
          setWinner("player");
        } else {
          serve(false);
        }
      }
    }

    draw();
    rafRef.current = requestAnimationFrame(tick);
  }, [draw, serve]);

  useEffect(() => {
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [tick]);

  useEffect(() => {
    const onDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowUp" || e.key === "w") {
        e.preventDefault();
        keysRef.current.up = true;
      } else if (e.key === "ArrowDown" || e.key === "s") {
        e.preventDefault();
        keysRef.current.down = true;
      }
    };
    const onUp = (e: KeyboardEvent) => {
      if (e.key === "ArrowUp" || e.key === "w") keysRef.current.up = false;
      else if (e.key === "ArrowDown" || e.key === "s") keysRef.current.down = false;
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
    const y = ((e.clientY - rect.top) / rect.height) * CANVAS_H;
    playerYRef.current = Math.max(0, Math.min(CANVAS_H - PADDLE_H, y - PADDLE_H / 2));
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex items-center gap-6 text-white text-lg">
        <div>
          You: <span className="font-bold text-green-400">{playerScore}</span>
        </div>
        <div>
          AI: <span className="font-bold text-red-400">{aiScore}</span>
        </div>
        <div className="text-sm text-gray-400">First to {WIN_SCORE}</div>
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
                  <div className="text-2xl font-bold mb-2">Table Tennis</div>
                  <div className="text-sm text-gray-600 mb-4">W/S, arrows or mouse</div>
                </>
              ) : (
                <>
                  <div className="text-2xl font-bold mb-2">
                    {winner === "player" ? "You win!" : "AI wins"}
                  </div>
                  <div className="mb-3">
                    {playerScore} – {aiScore}
                  </div>
                </>
              )}
              <button
                onClick={start}
                className="px-6 py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700"
              >
                {gameState === "ready" ? "Start" : "Play Again"}
              </button>
            </div>
          </div>
        )}
      </div>

      <DownloadButton canvasRef={canvasRef} filename="table-tennis" />
    </div>
  );
}
