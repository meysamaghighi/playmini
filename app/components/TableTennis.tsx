"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import DownloadButton from "./DownloadButton";

type PowerUpType = "wide" | "slow" | "multiball" | "shield";

type PowerUp = {
  x: number;
  y: number;
  type: PowerUpType;
};

type Ball = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  spin: number; // spin factor for curve effect
};

const CW = 400;
const CH = 600;
const PADDLE_H = 12;
const BALL_R = 8;
const POWERUP_SIZE = 20;
const POWERUP_FALL_SPEED = 2;
const POWERUP_DURATION = 7000;
const POWERUP_SPAWN_CHANCE = 0.15;

type LevelConfig = {
  pointsToWin: number;
  aiSpeed: number;
  aiAccuracy: number; // 0-1, how well AI tracks ball
  ballSpeedMultiplier: number;
  paddleWidth: number;
  hasSpinShots: boolean;
  speedUpPerRally: number;
  description: string;
};

function getLevelConfig(level: number): LevelConfig {
  if (level === 1) return {
    pointsToWin: 7,
    aiSpeed: 2.5,
    aiAccuracy: 0.6,
    ballSpeedMultiplier: 0.9,
    paddleWidth: 90,
    hasSpinShots: false,
    speedUpPerRally: 0,
    description: "Warm-up: Slow AI, wide paddle",
  };
  if (level === 2) return {
    pointsToWin: 7,
    aiSpeed: 3,
    aiAccuracy: 0.7,
    ballSpeedMultiplier: 1.0,
    paddleWidth: 80,
    hasSpinShots: false,
    speedUpPerRally: 0,
    description: "Beginner: Faster AI",
  };
  if (level === 3) return {
    pointsToWin: 7,
    aiSpeed: 3.5,
    aiAccuracy: 0.75,
    ballSpeedMultiplier: 1.1,
    paddleWidth: 80,
    hasSpinShots: false,
    speedUpPerRally: 0.01,
    description: "Intermediate: Ball speeds up",
  };
  if (level === 4) return {
    pointsToWin: 9,
    aiSpeed: 4,
    aiAccuracy: 0.8,
    ballSpeedMultiplier: 1.15,
    paddleWidth: 75,
    hasSpinShots: false,
    speedUpPerRally: 0.015,
    description: "Advanced: Smaller paddle, 9 points",
  };
  if (level === 5) return {
    pointsToWin: 9,
    aiSpeed: 4.5,
    aiAccuracy: 0.82,
    ballSpeedMultiplier: 1.2,
    paddleWidth: 70,
    hasSpinShots: true,
    speedUpPerRally: 0.02,
    description: "Expert: AI uses spin shots!",
  };
  if (level === 6) return {
    pointsToWin: 9,
    aiSpeed: 5,
    aiAccuracy: 0.85,
    ballSpeedMultiplier: 1.25,
    paddleWidth: 70,
    hasSpinShots: true,
    speedUpPerRally: 0.02,
    description: "Pro: Faster spins",
  };
  if (level === 7) return {
    pointsToWin: 11,
    aiSpeed: 5.5,
    aiAccuracy: 0.87,
    ballSpeedMultiplier: 1.3,
    paddleWidth: 65,
    hasSpinShots: true,
    speedUpPerRally: 0.025,
    description: "Master: 11 points, tiny paddle",
  };
  if (level === 8) return {
    pointsToWin: 11,
    aiSpeed: 6,
    aiAccuracy: 0.9,
    ballSpeedMultiplier: 1.35,
    paddleWidth: 65,
    hasSpinShots: true,
    speedUpPerRally: 0.025,
    description: "Champion: Lightning fast AI",
  };
  if (level === 9) return {
    pointsToWin: 11,
    aiSpeed: 6.5,
    aiAccuracy: 0.92,
    ballSpeedMultiplier: 1.4,
    paddleWidth: 60,
    hasSpinShots: true,
    speedUpPerRally: 0.03,
    description: "Legend: Almost unbeatable",
  };
  if (level === 10) return {
    pointsToWin: 13,
    aiSpeed: 7,
    aiAccuracy: 0.95,
    ballSpeedMultiplier: 1.5,
    paddleWidth: 55,
    hasSpinShots: true,
    speedUpPerRally: 0.03,
    description: "Ultimate: 13 points, insane speed!",
  };

  // Endless mode for level 11+
  const pointsToWin = 11;
  const aiSpeed = Math.min(10, 7 + (level - 10) * 0.3);
  const aiAccuracy = Math.min(0.98, 0.95 + (level - 10) * 0.005);
  const ballSpeedMultiplier = Math.min(2.5, 1.5 + (level - 10) * 0.1);
  const paddleWidth = Math.max(45, 55 - (level - 10) * 2);
  return {
    pointsToWin,
    aiSpeed,
    aiAccuracy,
    ballSpeedMultiplier,
    paddleWidth,
    hasSpinShots: true,
    speedUpPerRally: 0.035,
    description: `Endless Level ${level}: Extreme difficulty!`,
  };
}

export default function TableTennis() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [displayState, setDisplayState] = useState<"start" | "playing" | "gameover">("start");
  const [pScore, setPScore] = useState(0);
  const [aiScore, setAiScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [level, setLevel] = useState(1);
  const [highScore, setHighScore] = useState(0);
  const [totalScore, setTotalScore] = useState(0);

  const playerRef = useRef({ x: CW / 2 });
  const aiRef = useRef({ x: CW / 2 });
  const ballsRef = useRef<Ball[]>([]);
  const powerUpsRef = useRef<PowerUp[]>([]);
  const pScoreRef = useRef(0);
  const aiScoreRef = useRef(0);
  const livesRef = useRef(3);
  const levelRef = useRef(1);
  const totalScoreRef = useRef(0);
  const highScoreRef = useRef(0);
  const gameStateRef = useRef<"start" | "playing" | "paused" | "gameover">("start");
  const animIdRef = useRef(0);
  const rallyRef = useRef(0);
  const bestRallyRef = useRef(0);
  const serveDelayRef = useRef(0);
  const levelUpFlashRef = useRef(0);
  const activePowerUpRef = useRef<PowerUpType | null>(null);
  const powerUpTimerRef = useRef<number | null>(null);
  const shieldActiveRef = useRef(false);
  const lastPowerUpSpawnRef = useRef(0);
  const configRef = useRef<LevelConfig>(getLevelConfig(1));
  const touchXRef = useRef<number | null>(null);
  const keysRef = useRef<Record<string, boolean>>({});

  useEffect(() => {
    const s = localStorage.getItem("pb-tabletennis-high");
    if (s) {
      highScoreRef.current = parseInt(s, 10);
      setHighScore(highScoreRef.current);
    }
  }, []);

  const spawnPowerUp = useCallback((x: number, y: number) => {
    const now = Date.now();
    if (now - lastPowerUpSpawnRef.current < 3000) return; // cooldown
    if (Math.random() < POWERUP_SPAWN_CHANCE) {
      const types: PowerUpType[] = ["wide", "slow", "multiball", "shield"];
      const type = types[Math.floor(Math.random() * types.length)];
      powerUpsRef.current.push({ x, y, type });
      lastPowerUpSpawnRef.current = now;
    }
  }, []);

  const activatePowerUp = useCallback((type: PowerUpType) => {
    if (powerUpTimerRef.current !== null) {
      clearTimeout(powerUpTimerRef.current);
    }

    if (type === "shield") {
      shieldActiveRef.current = true;
      activePowerUpRef.current = "shield";
      // Shield stays until used
    } else if (type === "multiball") {
      // Spawn 2 extra balls
      const b = ballsRef.current[0];
      if (b) {
        ballsRef.current.push({
          x: b.x,
          y: b.y,
          vx: b.vx * 0.8 - 2,
          vy: b.vy,
          spin: 0,
        });
        ballsRef.current.push({
          x: b.x,
          y: b.y,
          vx: b.vx * 0.8 + 2,
          vy: b.vy,
          spin: 0,
        });
      }
    } else {
      activePowerUpRef.current = type;
      powerUpTimerRef.current = window.setTimeout(() => {
        activePowerUpRef.current = null;
        powerUpTimerRef.current = null;
      }, POWERUP_DURATION);
    }
  }, []);

  const resetBall = useCallback((direction: number) => {
    const config = configRef.current;
    const baseVx = (Math.random() > 0.5 ? 1 : -1) * (2.5 + Math.random() * 0.5);
    const baseVy = direction * (3 + Math.random() * 0.5);
    ballsRef.current = [{
      x: CW / 2,
      y: CH / 2,
      vx: baseVx * config.ballSpeedMultiplier,
      vy: baseVy * config.ballSpeedMultiplier,
      spin: 0,
    }];
    rallyRef.current = 0;
    serveDelayRef.current = 30;
  }, []);

  const advanceLevel = useCallback(() => {
    levelRef.current++;
    setLevel(levelRef.current);
    configRef.current = getLevelConfig(levelRef.current);
    pScoreRef.current = 0;
    aiScoreRef.current = 0;
    setPScore(0);
    setAiScore(0);
    levelUpFlashRef.current = 60;
    resetBall(1);
  }, [resetBall]);

  const loseLife = useCallback(() => {
    livesRef.current--;
    setLives(livesRef.current);
    if (livesRef.current <= 0) {
      gameStateRef.current = "gameover";
      setDisplayState("gameover");
      if (totalScoreRef.current > highScoreRef.current) {
        highScoreRef.current = totalScoreRef.current;
        setHighScore(highScoreRef.current);
        localStorage.setItem("pb-tabletennis-high", highScoreRef.current.toString());
      }
    } else {
      // Lost a round, reset scores for this round
      pScoreRef.current = 0;
      aiScoreRef.current = 0;
      setPScore(0);
      setAiScore(0);
      resetBall(1);
    }
  }, [resetBall]);

  const gameLoop = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    if (gameStateRef.current !== "playing") return;

    const config = configRef.current;
    const PADDLE_W = config.paddleWidth;
    const PADDLE_W_PLAYER = activePowerUpRef.current === "wide" ? PADDLE_W * 1.5 : PADDLE_W;

    // Level-up flash countdown
    if (levelUpFlashRef.current > 0) {
      levelUpFlashRef.current--;
      drawFrame(ctx);
      animIdRef.current = requestAnimationFrame(gameLoop);
      return;
    }

    // Serve delay
    if (serveDelayRef.current > 0) {
      serveDelayRef.current--;
      drawFrame(ctx);
      animIdRef.current = requestAnimationFrame(gameLoop);
      return;
    }

    const p = playerRef.current;
    const ai = aiRef.current;

    // Update power-ups
    powerUpsRef.current = powerUpsRef.current.filter(pu => {
      pu.y += POWERUP_FALL_SPEED;

      // Collision with player paddle
      const pLeft = p.x - PADDLE_W_PLAYER / 2;
      const pRight = p.x + PADDLE_W_PLAYER / 2;
      const pTop = CH - 40;
      if (pu.y + POWERUP_SIZE >= pTop && pu.y <= pTop + PADDLE_H + 10 &&
          pu.x + POWERUP_SIZE >= pLeft && pu.x <= pRight) {
        activatePowerUp(pu.type);
        return false;
      }

      return pu.y < CH + POWERUP_SIZE;
    });

    // Update balls
    ballsRef.current = ballsRef.current.filter(b => {
      // Ball movement
      b.x += b.vx;
      b.y += b.vy;

      // Apply spin curve
      if (b.spin !== 0) {
        b.vx += b.spin * 0.02;
      }

      // Wall bounce
      if (b.x - BALL_R <= 0 || b.x + BALL_R >= CW) {
        b.vx *= -1;
        b.x = Math.max(BALL_R, Math.min(CW - BALL_R, b.x));
        b.spin *= 0.7; // reduce spin on wall bounce
      }

      // Player paddle collision (bottom)
      const pLeft = p.x - PADDLE_W_PLAYER / 2;
      const pRight = p.x + PADDLE_W_PLAYER / 2;
      const pTop = CH - 40;
      if (b.vy > 0 && b.y + BALL_R >= pTop && b.y + BALL_R <= pTop + PADDLE_H + 4 &&
          b.x >= pLeft && b.x <= pRight) {
        b.vy = -Math.abs(b.vy);
        // Add spin based on where ball hits paddle
        const hitPos = (b.x - p.x) / (PADDLE_W_PLAYER / 2); // -1 to 1
        b.vx += hitPos * 2;
        b.spin = hitPos * 3;
        b.vx = Math.max(-8, Math.min(8, b.vx));
        // Speed up slightly
        const speedUp = 1 + config.speedUpPerRally;
        b.vy *= speedUp;
        b.vx *= speedUp;
        rallyRef.current++;
        if (rallyRef.current > bestRallyRef.current) bestRallyRef.current = rallyRef.current;

        // Spawn power-up chance
        if (Math.random() < 0.1) {
          spawnPowerUp(b.x, pTop - 30);
        }
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
        // AI adds spin sometimes
        if (config.hasSpinShots && Math.random() < 0.3) {
          b.spin = (Math.random() - 0.5) * 4;
        }
        b.vx = Math.max(-8, Math.min(8, b.vx));
        const speedUp = 1 + config.speedUpPerRally * 0.5;
        b.vy *= speedUp;
        rallyRef.current++;
      }

      // Scoring
      if (b.y - BALL_R > CH) {
        // AI scores
        if (ballsRef.current.length === 1) {
          // Only count if it's the last ball
          aiScoreRef.current++;
          setAiScore(aiScoreRef.current);
          if (aiScoreRef.current >= config.pointsToWin) {
            loseLife();
            return false;
          }
          resetBall(-1); // serve toward AI
        }
        return false; // remove this ball
      } else if (b.y + BALL_R < 0) {
        // Player scores
        if (ballsRef.current.length === 1 || b.vy < 0) {
          // Count if last ball or ball is moving up
          const points = 10 + rallyRef.current * 2;
          totalScoreRef.current += points;
          setTotalScore(totalScoreRef.current);
          pScoreRef.current++;
          setPScore(pScoreRef.current);
          if (pScoreRef.current >= config.pointsToWin) {
            // Player won this round
            if (shieldActiveRef.current) {
              shieldActiveRef.current = false;
              activePowerUpRef.current = null;
            }
            advanceLevel();
            return false;
          }
          resetBall(1); // serve toward player
        }
        return false; // remove this ball
      }

      return true; // keep ball
    });

    // Ensure at least one ball exists
    if (ballsRef.current.length === 0) {
      resetBall(1);
    }

    // AI movement
    const slowFactor = activePowerUpRef.current === "slow" ? 0.5 : 1.0;
    const aiSpeed = config.aiSpeed * slowFactor;
    const targetBall = ballsRef.current.find(b => b.vy < 0) || ballsRef.current[0];
    if (targetBall) {
      const aiTarget = targetBall.vy < 0
        ? targetBall.x + (1 - config.aiAccuracy) * (Math.random() - 0.5) * 50
        : CW / 2;
      const aiDiff = aiTarget - ai.x;
      if (Math.abs(aiDiff) > 2) {
        ai.x += Math.sign(aiDiff) * Math.min(aiSpeed, Math.abs(aiDiff));
      }
    }
    ai.x = Math.max(PADDLE_W / 2, Math.min(CW - PADDLE_W / 2, ai.x));

    drawFrame(ctx);
    animIdRef.current = requestAnimationFrame(gameLoop);
  }, [loseLife, resetBall, advanceLevel, spawnPowerUp, activatePowerUp]);

  const drawFrame = (ctx: CanvasRenderingContext2D) => {
    const config = configRef.current;
    const PADDLE_W = config.paddleWidth;
    const PADDLE_W_PLAYER = activePowerUpRef.current === "wide" ? PADDLE_W * 1.5 : PADDLE_W;
    const p = playerRef.current;
    const ai = aiRef.current;

    // Table background
    ctx.fillStyle = "#0c4a2c";
    ctx.fillRect(0, 0, CW, CH);

    // Level-up flash
    if (levelUpFlashRef.current > 0) {
      const alpha = (levelUpFlashRef.current % 20) / 20 * 0.3;
      ctx.fillStyle = `rgba(34, 197, 94, ${alpha})`;
      ctx.fillRect(0, 0, CW, CH);
    }

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
    ctx.roundRect(p.x - PADDLE_W_PLAYER / 2, CH - 40, PADDLE_W_PLAYER, PADDLE_H, 4);
    ctx.fill();
    // Highlight
    ctx.fillStyle = "rgba(255,255,255,0.3)";
    ctx.fillRect(p.x - PADDLE_W_PLAYER / 2 + 4, CH - 40 + 2, PADDLE_W_PLAYER - 8, 3);

    // Shield indicator
    if (shieldActiveRef.current) {
      ctx.strokeStyle = "#fbbf24";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(p.x, CH - 34, PADDLE_W_PLAYER / 2 + 10, Math.PI, Math.PI * 2);
      ctx.stroke();
    }

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

    // Slow indicator on AI
    if (activePowerUpRef.current === "slow") {
      ctx.strokeStyle = "#a855f7";
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]);
      ctx.strokeRect(ai.x - PADDLE_W / 2 - 5, 35, PADDLE_W + 10, PADDLE_H + 10);
      ctx.setLineDash([]);
    }

    // Balls
    ballsRef.current.forEach(b => {
      // Ball shadow
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
      // Spin indicator
      if (Math.abs(b.spin) > 1) {
        ctx.strokeStyle = "rgba(255,100,200,0.5)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(b.x, b.y, BALL_R + 3, 0, Math.PI * 2);
        ctx.stroke();
      }
    });

    // Power-ups
    powerUpsRef.current.forEach(pu => {
      let color = "#fff";
      let symbol = "?";
      if (pu.type === "wide") { color = "#3b82f6"; symbol = "W"; }
      if (pu.type === "slow") { color = "#a855f7"; symbol = "S"; }
      if (pu.type === "multiball") { color = "#10b981"; symbol = "M"; }
      if (pu.type === "shield") { color = "#fbbf24"; symbol = "D"; }

      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(pu.x + POWERUP_SIZE / 2, pu.y + POWERUP_SIZE / 2, POWERUP_SIZE / 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#000";
      ctx.font = "bold 14px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(symbol, pu.x + POWERUP_SIZE / 2, pu.y + POWERUP_SIZE / 2);
    });

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
    if (rallyRef.current > 3) {
      ctx.font = "bold 14px sans-serif";
      ctx.fillStyle = "rgba(255,200,50,0.6)";
      ctx.fillText(`Rally: ${rallyRef.current}`, CW / 2, CH / 2 + 3);
    }

    // Level-up text
    if (levelUpFlashRef.current > 30) {
      ctx.font = "bold 24px sans-serif";
      ctx.fillStyle = "#22c55e";
      ctx.strokeStyle = "#000";
      ctx.lineWidth = 3;
      ctx.strokeText(`LEVEL ${levelRef.current}!`, CW / 2, CH / 2 - 80);
      ctx.fillText(`LEVEL ${levelRef.current}!`, CW / 2, CH / 2 - 80);
      ctx.font = "14px sans-serif";
      ctx.strokeText(config.description, CW / 2, CH / 2 - 55);
      ctx.fillText(config.description, CW / 2, CH / 2 - 55);
    }
  };

  const startGame = () => {
    pScoreRef.current = 0;
    aiScoreRef.current = 0;
    livesRef.current = 3;
    levelRef.current = 1;
    totalScoreRef.current = 0;
    rallyRef.current = 0;
    bestRallyRef.current = 0;
    shieldActiveRef.current = false;
    activePowerUpRef.current = null;
    powerUpsRef.current = [];
    levelUpFlashRef.current = 0;
    setPScore(0);
    setAiScore(0);
    setLives(3);
    setLevel(1);
    setTotalScore(0);
    configRef.current = getLevelConfig(1);
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
      const config = configRef.current;
      const PADDLE_W = activePowerUpRef.current === "wide" ? config.paddleWidth * 1.5 : config.paddleWidth;
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
      const config = configRef.current;
      const PADDLE_W = activePowerUpRef.current === "wide" ? config.paddleWidth * 1.5 : config.paddleWidth;
      playerRef.current.x = Math.max(PADDLE_W / 2, Math.min(CW - PADDLE_W / 2, (touch.clientX - rect.left) * scaleX));
    };

    const handleTouchStart = (e: TouchEvent) => {
      if (gameStateRef.current !== "playing") return;
      e.preventDefault();
      const rect = canvas.getBoundingClientRect();
      const scaleX = CW / rect.width;
      const touch = e.touches[0];
      const config = configRef.current;
      const PADDLE_W = activePowerUpRef.current === "wide" ? config.paddleWidth * 1.5 : config.paddleWidth;
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
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft" || e.key === "ArrowRight") e.preventDefault();
      keysRef.current[e.key] = true;
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      keysRef.current[e.key] = false;
    };

    const moveLoop = () => {
      if (gameStateRef.current === "playing") {
        const config = configRef.current;
        const PADDLE_W = activePowerUpRef.current === "wide" ? config.paddleWidth * 1.5 : config.paddleWidth;
        if (keysRef.current["ArrowLeft"] || keysRef.current["a"] || keysRef.current["A"]) {
          playerRef.current.x = Math.max(PADDLE_W / 2, playerRef.current.x - 8);
        }
        if (keysRef.current["ArrowRight"] || keysRef.current["d"] || keysRef.current["D"]) {
          playerRef.current.x = Math.min(CW - PADDLE_W / 2, playerRef.current.x + 8);
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
    return () => {
      if (animIdRef.current) cancelAnimationFrame(animIdRef.current);
      if (powerUpTimerRef.current) clearTimeout(powerUpTimerRef.current);
    };
  }, []);

  const handleShare = async () => {
    const text = `I reached Level ${levelRef.current} with ${totalScoreRef.current} points in Table Tennis! Play at playmini.fun/table-tennis`;
    if (navigator.share) {
      try { await navigator.share({ text }); } catch {}
    } else {
      try { await navigator.clipboard.writeText(text); alert("Copied!"); } catch {}
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex gap-6 text-center">
        <div>
          <div className="text-xs text-gray-500 uppercase tracking-wider">Level</div>
          <div className="text-2xl font-black text-blue-400 tabular-nums">{level}</div>
        </div>
        <div>
          <div className="text-xs text-gray-500 uppercase tracking-wider">Score</div>
          <div className="text-2xl font-black text-green-400 tabular-nums">{totalScore}</div>
        </div>
        <div>
          <div className="text-xs text-gray-500 uppercase tracking-wider">Best</div>
          <div className="text-2xl font-black text-yellow-400 tabular-nums">{highScore}</div>
        </div>
        <div>
          <div className="text-xs text-gray-500 uppercase tracking-wider">Lives</div>
          <div className="text-2xl font-black text-red-400 tabular-nums">{lives}</div>
        </div>
      </div>

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
            <p className="text-gray-400 mb-2 text-sm text-center px-6">
              Move your paddle to hit the ball. Win each round to advance!
            </p>
            <p className="text-gray-500 mb-6 text-xs">10 levels + endless mode</p>
            <button
              onClick={startGame}
              className="px-10 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-2xl transition-all hover:scale-105 active:scale-95"
            >
              Play
            </button>
            {highScore > 0 && (
              <p className="text-yellow-400 text-sm mt-3">High Score: {highScore}</p>
            )}
          </div>
        )}

        {displayState === "gameover" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/85 rounded-2xl backdrop-blur-sm">
            <h2 className="text-3xl font-black text-red-400 mb-4">Game Over</h2>
            <div className="bg-slate-900/80 rounded-xl px-6 py-3 mb-6 text-center">
              <p className="text-white text-lg font-bold">Final Score: {totalScore}</p>
              <p className="text-white text-md">Level Reached: {level}</p>
              <p className="text-gray-400 text-sm mt-1">Best Rally: {bestRallyRef.current}</p>
              <p className="text-yellow-400 text-md font-bold">High Score: {highScore}</p>
              {totalScore === highScore && totalScore > 0 && (
                <p className="text-green-400 text-sm mt-2">New High Score!</p>
              )}
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
        <div className="text-center text-xs text-gray-600">
          <p>Move mouse/touch or use arrow keys (A/D)</p>
          <p className="mt-1 text-gray-500">
            Power-ups: Wide (W), Slow (S), Multi-ball (M), Shield (D)
          </p>
          <p className="mt-1 text-gray-400">
            Round: First to {configRef.current.pointsToWin} • {lives} {lives === 1 ? "life" : "lives"} left
          </p>
        </div>
      )}
    </div>
  );
}
