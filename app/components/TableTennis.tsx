"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import DownloadButton from "./DownloadButton";

export default function TableTennis() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [displayState, setDisplayState] = useState<"start" | "playing" | "gameover">("start");
  const [pScore, setPScore] = useState(0);
  const [aiScore, setAiScore] = useState(0);
  const [bestScore, setBestScore] = useState(0);

  const CW = 400;
  const CH = 600;
  const PADDLE_W = 80;
  const PADDLE_H = 12;
  const BALL_R = 8;
  const WIN_SCORE = 7;

  const playerRef = useRef({ x: CW / 2 });
  const aiRef = useRef({ x: CW / 2 });
  const ballRef = useRef({ x: CW / 2, y: CH / 2, vx: 3, vy: 4 });
  const pScoreRef = useRef(0);
  const aiScoreRef = useRef(0);
  const bestRef = useRef(0);
  const gameStateRef = useRef<"start" | "playing" | "paused" | "gameover">("start");
  const animIdRef = useRef(0);
  const rallyRef = useRef(0);
  const bestRallyRef = useRef(0);
  const serveDelayRef = useRef(0);
  const touchXRef = useRef<number | null>(null);

  useEffect(() => {
    const s = localStorage.getItem("pb-tabletennis");
    if (s) { bestRef.current = parseInt(s, 10); setBestScore(bestRef.current); }
  }, []);

  const resetBall = useCallback((direction: number) => {
    ballRef.current = {
      x: CW / 2,
      y: CH / 2,
      vx: (Math.random() > 0.5 ? 1 : -1) * (2.5 + Math.random()),
      vy: direction * (3 + Math.random()),
    };
    rallyRef.current = 0;
    serveDelayRef.current = 30; // short pause before serve
  }, []);

  const gameLoop = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    if (gameStateRef.current !== "playing") return;

    // Serve delay
    if (serveDelayRef.current > 0) {
      serveDelayRef.current--;
      drawFrame(ctx);
      animIdRef.current = requestAnimationFrame(gameLoop);
      return;
    }

    const b = ballRef.current;
    const p = playerRef.current;
    const ai = aiRef.current;

    // Ball movement
    b.x += b.vx;
    b.y += b.vy;

    // Wall bounce
    if (b.x - BALL_R <= 0 || b.x + BALL_R >= CW) {
      b.vx *= -1;
      b.x = Math.max(BALL_R, Math.min(CW - BALL_R, b.x));
    }

    // Player paddle collision (bottom)
    const pLeft = p.x - PADDLE_W / 2;
    const pRight = p.x + PADDLE_W / 2;
    const pTop = CH - 40;
    if (b.vy > 0 && b.y + BALL_R >= pTop && b.y + BALL_R <= pTop + PADDLE_H + 4 &&
        b.x >= pLeft && b.x <= pRight) {
      b.vy = -Math.abs(b.vy);
      // Add spin based on where ball hits paddle
      const hitPos = (b.x - p.x) / (PADDLE_W / 2); // -1 to 1
      b.vx += hitPos * 2;
      b.vx = Math.max(-6, Math.min(6, b.vx));
      // Speed up slightly
      b.vy *= 1.03;
      rallyRef.current++;
      if (rallyRef.current > bestRallyRef.current) bestRallyRef.current = rallyRef.current;
    }

    // AI paddle collision (top)
    const aiLeft = ai.x - PADDLE_W / 2;
    const aiRight = ai.x + PADDLE_W / 2;
    const aiBot = 40 + PADDLE_H;
    if (b.vy < 0 && b.y - BALL_R <= aiBot && b.y - BALL_R >= 40 - 4 &&
        b.x >= aiLeft && b.x <= aiRight) {
      b.vy = Math.abs(b.vy);
      const hitPos = (b.x - ai.x) / (PADDLE_W / 2);
      b.vx += hitPos * 1.5;
      b.vx = Math.max(-6, Math.min(6, b.vx));
      b.vy *= 1.02;
      rallyRef.current++;
    }

    // AI movement - difficulty scales with player score
    const aiSpeed = Math.min(4.5, 2.5 + pScoreRef.current * 0.3);
    const aiTarget = b.vy < 0 ? b.x : CW / 2; // track ball when coming, center otherwise
    const aiDiff = aiTarget - ai.x;
    if (Math.abs(aiDiff) > 2) {
      ai.x += Math.sign(aiDiff) * Math.min(aiSpeed, Math.abs(aiDiff));
    }
    ai.x = Math.max(PADDLE_W / 2, Math.min(CW - PADDLE_W / 2, ai.x));

    // Scoring
    if (b.y - BALL_R > CH) {
      // AI scores
      aiScoreRef.current++;
      setAiScore(aiScoreRef.current);
      if (aiScoreRef.current >= WIN_SCORE) { endGame(); return; }
      resetBall(-1); // serve toward AI
    } else if (b.y + BALL_R < 0) {
      // Player scores
      pScoreRef.current++;
      setPScore(pScoreRef.current);
      if (pScoreRef.current >= WIN_SCORE) { endGame(); return; }
      resetBall(1); // serve toward player
    }

    drawFrame(ctx);
    animIdRef.current = requestAnimationFrame(gameLoop);
  }, []);

  const drawFrame = (ctx: CanvasRenderingContext2D) => {
    const b = ballRef.current;
    const p = playerRef.current;
    const ai = aiRef.current;

    // Table background
    ctx.fillStyle = "#0c4a2c";
    ctx.fillRect(0, 0, CW, CH);

    // Table border
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 3;
    ctx.strokeRect(2, 2, CW - 4, CH - 4);

    // Center line
    ctx.strokeStyle = "rgba(255,255,255,0.4)";
    ctx.lineWidth = 2;
    ctx.setLineDash([8, 8]);
    ctx.beginPath();
    ctx.moveTo(0, CH / 2);
    ctx.lineTo(CW, CH / 2);
    ctx.stroke();
    ctx.setLineDash([]);

    // Net
    ctx.fillStyle = "rgba(255,255,255,0.15)";
    ctx.fillRect(0, CH / 2 - 3, CW, 6);

    // Player paddle (bottom)
    const pGrad = ctx.createLinearGradient(0, CH - 40, 0, CH - 40 + PADDLE_H);
    pGrad.addColorStop(0, "#3b82f6");
    pGrad.addColorStop(1, "#1d4ed8");
    ctx.fillStyle = pGrad;
    ctx.beginPath();
    ctx.roundRect(p.x - PADDLE_W / 2, CH - 40, PADDLE_W, PADDLE_H, 4);
    ctx.fill();
    // Highlight
    ctx.fillStyle = "rgba(255,255,255,0.3)";
    ctx.fillRect(p.x - PADDLE_W / 2 + 4, CH - 40 + 2, PADDLE_W - 8, 3);

    // AI paddle (top)
    const aiGrad = ctx.createLinearGradient(0, 40, 0, 40 + PADDLE_H);
    aiGrad.addColorStop(0, "#ef4444");
    aiGrad.addColorStop(1, "#b91c1c");
    ctx.fillStyle = aiGrad;
    ctx.beginPath();
    ctx.roundRect(ai.x - PADDLE_W / 2, 40, PADDLE_W, PADDLE_H, 4);
    ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,0.3)";
    ctx.fillRect(ai.x - PADDLE_W / 2 + 4, 40 + 2, PADDLE_W - 8, 3);

    // Ball with shadow
    ctx.fillStyle = "rgba(0,0,0,0.2)";
    ctx.beginPath();
    ctx.arc(b.x + 2, b.y + 2, BALL_R, 0, Math.PI * 2);
    ctx.fill();
    // Ball
    ctx.fillStyle = "#fbbf24";
    ctx.beginPath();
    ctx.arc(b.x, b.y, BALL_R, 0, Math.PI * 2);
    ctx.fill();
    // Ball highlight
    ctx.fillStyle = "rgba(255,255,255,0.4)";
    ctx.beginPath();
    ctx.arc(b.x - 2, b.y - 2, BALL_R * 0.4, 0, Math.PI * 2);
    ctx.fill();

    // Score display
    ctx.font = "bold 36px sans-serif";
    ctx.textAlign = "center";
    ctx.fillStyle = "rgba(255,255,255,0.3)";
    ctx.fillText(aiScoreRef.current.toString(), CW / 2, CH / 2 - 30);
    ctx.fillText(pScoreRef.current.toString(), CW / 2, CH / 2 + 55);

    // Labels
    ctx.font = "12px sans-serif";
    ctx.fillStyle = "rgba(255,255,255,0.2)";
    ctx.fillText("CPU", CW / 2, 30);
    ctx.fillText("YOU", CW / 2, CH - 15);

    // Rally counter
    if (rallyRef.current > 2) {
      ctx.font = "bold 14px sans-serif";
      ctx.fillStyle = "rgba(255,200,50,0.6)";
      ctx.fillText(`Rally: ${rallyRef.current}`, CW / 2, CH / 2 + 3);
    }
  };

  const endGame = () => {
    gameStateRef.current = "gameover";
    setDisplayState("gameover");
    const won = pScoreRef.current >= WIN_SCORE;
    if (won && pScoreRef.current > bestRef.current) {
      bestRef.current = pScoreRef.current;
      setBestScore(bestRef.current);
      // Store wins
    }
    const totalWins = parseInt(localStorage.getItem("pb-tabletennis") || "0", 10);
    if (won) {
      localStorage.setItem("pb-tabletennis", (totalWins + 1).toString());
      setBestScore(totalWins + 1);
      bestRef.current = totalWins + 1;
    }
  };

  const startGame = () => {
    pScoreRef.current = 0;
    aiScoreRef.current = 0;
    rallyRef.current = 0;
    bestRallyRef.current = 0;
    setPScore(0);
    setAiScore(0);
    playerRef.current = { x: CW / 2 };
    aiRef.current = { x: CW / 2 };
    resetBall(1);
    gameStateRef.current = "playing";
    setDisplayState("playing");
    animIdRef.current = requestAnimationFrame(gameLoop);
  };

  // Mouse control
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (gameStateRef.current !== "playing") return;
      const rect = canvas.getBoundingClientRect();
      const scaleX = CW / rect.width;
      playerRef.current.x = Math.max(PADDLE_W / 2, Math.min(CW - PADDLE_W / 2, (e.clientX - rect.left) * scaleX));
    };

    canvas.addEventListener("mousemove", handleMouseMove);
    return () => canvas.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Touch control
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleTouchMove = (e: TouchEvent) => {
      if (gameStateRef.current !== "playing") return;
      e.preventDefault();
      const rect = canvas.getBoundingClientRect();
      const scaleX = CW / rect.width;
      const touch = e.touches[0];
      playerRef.current.x = Math.max(PADDLE_W / 2, Math.min(CW - PADDLE_W / 2, (touch.clientX - rect.left) * scaleX));
    };

    const handleTouchStart = (e: TouchEvent) => {
      if (gameStateRef.current !== "playing") return;
      e.preventDefault();
      const rect = canvas.getBoundingClientRect();
      const scaleX = CW / rect.width;
      const touch = e.touches[0];
      playerRef.current.x = Math.max(PADDLE_W / 2, Math.min(CW - PADDLE_W / 2, (touch.clientX - rect.left) * scaleX));
    };

    canvas.addEventListener("touchmove", handleTouchMove, { passive: false });
    canvas.addEventListener("touchstart", handleTouchStart, { passive: false });
    return () => {
      canvas.removeEventListener("touchmove", handleTouchMove);
      canvas.removeEventListener("touchstart", handleTouchStart);
    };
  }, []);

  // Keyboard control
  useEffect(() => {
    const keysDown = new Set<string>();
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft" || e.key === "ArrowRight") e.preventDefault();
      keysDown.add(e.key);
    };
    const handleKeyUp = (e: KeyboardEvent) => { keysDown.delete(e.key); };

    const moveLoop = () => {
      if (gameStateRef.current === "playing") {
        if (keysDown.has("ArrowLeft") || keysDown.has("a") || keysDown.has("A")) {
          playerRef.current.x = Math.max(PADDLE_W / 2, playerRef.current.x - 6);
        }
        if (keysDown.has("ArrowRight") || keysDown.has("d") || keysDown.has("D")) {
          playerRef.current.x = Math.min(CW - PADDLE_W / 2, playerRef.current.x + 6);
        }
      }
      requestAnimationFrame(moveLoop);
    };
    const moveId = requestAnimationFrame(moveLoop);

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      cancelAnimationFrame(moveId);
    };
  }, []);

  useEffect(() => {
    return () => { if (animIdRef.current) cancelAnimationFrame(animIdRef.current); };
  }, []);

  const handleShare = async () => {
    const won = pScore >= WIN_SCORE;
    const text = `${won ? "I won" : "I lost"} ${pScore}-${aiScore} in Table Tennis! Play at playmini.fun/table-tennis`;
    if (navigator.share) {
      try { await navigator.share({ text }); } catch {}
    } else {
      try { await navigator.clipboard.writeText(text); alert("Copied!"); } catch {}
    }
  };

  const won = pScore >= WIN_SCORE;

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative">
        <canvas
          ref={canvasRef}
          width={CW}
          height={CH}
          className="rounded-2xl cursor-pointer max-w-full h-auto border border-slate-700"
          style={{ touchAction: "none" }}
        />

        {displayState === "start" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/85 rounded-2xl backdrop-blur-sm">
            <div className="text-5xl mb-3">&#127955;</div>
            <h2 className="text-3xl font-black text-blue-400 mb-2">Table Tennis</h2>
            <p className="text-gray-400 mb-6 text-sm text-center px-6">
              Move your paddle to hit the ball. First to {WIN_SCORE} wins!
            </p>
            <button
              onClick={startGame}
              className="px-10 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-2xl transition-all hover:scale-105 active:scale-95"
            >
              Play
            </button>
            {bestScore > 0 && (
              <p className="text-yellow-400 text-sm mt-3">Wins: {bestScore}</p>
            )}
          </div>
        )}

        {displayState === "gameover" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/85 rounded-2xl backdrop-blur-sm">
            <h2 className={`text-3xl font-black mb-4 ${won ? "text-green-400" : "text-red-400"}`}>
              {won ? "You Win!" : "You Lose!"}
            </h2>
            <div className="bg-slate-900/80 rounded-xl px-6 py-3 mb-6 text-center">
              <p className="text-white text-xl font-bold">{pScore} - {aiScore}</p>
              <p className="text-gray-400 text-sm mt-1">Best Rally: {bestRallyRef.current}</p>
              <p className="text-gray-400 text-sm">Total Wins: {bestScore}</p>
            </div>
            <div className="flex gap-3">
              <button onClick={startGame} className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all hover:scale-105 active:scale-95">
                Play Again
              </button>
              <button onClick={handleShare} className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-all hover:scale-105 active:scale-95">
                Share
              </button>
              <DownloadButton canvasRef={canvasRef} filename="tabletennis-score" label="Save" />
            </div>
          </div>
        )}
      </div>

      {displayState === "playing" && (
        <p className="text-gray-500 text-xs text-center">Move mouse/touch or use arrow keys</p>
      )}
    </div>
  );
}
