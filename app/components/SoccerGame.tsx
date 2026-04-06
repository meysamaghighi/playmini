"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import DownloadButton from "./DownloadButton";

type GameState = "aiming" | "shooting" | "scored" | "saved" | "roundEnd";
type PowerUpType = "power" | "curve" | "freeze";

type PowerUp = {
  x: number;
  y: number;
  type: PowerUpType;
};

type LevelConfig = {
  rounds: number;
  goalsNeeded: number;
  keeperSpeed: number;
  keeperReactionDelay: number; // ms before keeper reacts
  windEnabled: boolean;
  obstaclesEnabled: boolean;
  bonusTargetsEnabled: boolean;
  goalSizeMultiplier: number; // 1.0 = normal, 0.8 = smaller
};

function getLevelConfig(level: number): LevelConfig {
  if (level === 1)
    return {
      rounds: 10,
      goalsNeeded: 5,
      keeperSpeed: 0.04,
      keeperReactionDelay: 300,
      windEnabled: false,
      obstaclesEnabled: false,
      bonusTargetsEnabled: false,
      goalSizeMultiplier: 1.2,
    };
  if (level === 2)
    return {
      rounds: 10,
      goalsNeeded: 6,
      keeperSpeed: 0.05,
      keeperReactionDelay: 250,
      windEnabled: false,
      obstaclesEnabled: false,
      bonusTargetsEnabled: true,
      goalSizeMultiplier: 1.1,
    };
  if (level === 3)
    return {
      rounds: 10,
      goalsNeeded: 6,
      keeperSpeed: 0.06,
      keeperReactionDelay: 200,
      windEnabled: true,
      obstaclesEnabled: false,
      bonusTargetsEnabled: true,
      goalSizeMultiplier: 1.0,
    };
  if (level === 4)
    return {
      rounds: 10,
      goalsNeeded: 7,
      keeperSpeed: 0.07,
      keeperReactionDelay: 180,
      windEnabled: true,
      obstaclesEnabled: false,
      bonusTargetsEnabled: true,
      goalSizeMultiplier: 1.0,
    };
  if (level === 5)
    return {
      rounds: 10,
      goalsNeeded: 7,
      keeperSpeed: 0.08,
      keeperReactionDelay: 150,
      windEnabled: true,
      obstaclesEnabled: true,
      bonusTargetsEnabled: true,
      goalSizeMultiplier: 0.95,
    };
  if (level === 6)
    return {
      rounds: 12,
      goalsNeeded: 8,
      keeperSpeed: 0.09,
      keeperReactionDelay: 130,
      windEnabled: true,
      obstaclesEnabled: true,
      bonusTargetsEnabled: true,
      goalSizeMultiplier: 0.9,
    };
  if (level === 7)
    return {
      rounds: 12,
      goalsNeeded: 8,
      keeperSpeed: 0.1,
      keeperReactionDelay: 110,
      windEnabled: true,
      obstaclesEnabled: true,
      bonusTargetsEnabled: true,
      goalSizeMultiplier: 0.85,
    };
  if (level === 8)
    return {
      rounds: 12,
      goalsNeeded: 9,
      keeperSpeed: 0.11,
      keeperReactionDelay: 90,
      windEnabled: true,
      obstaclesEnabled: true,
      bonusTargetsEnabled: true,
      goalSizeMultiplier: 0.8,
    };
  if (level === 9)
    return {
      rounds: 15,
      goalsNeeded: 10,
      keeperSpeed: 0.12,
      keeperReactionDelay: 70,
      windEnabled: true,
      obstaclesEnabled: true,
      bonusTargetsEnabled: true,
      goalSizeMultiplier: 0.75,
    };
  if (level === 10)
    return {
      rounds: 15,
      goalsNeeded: 11,
      keeperSpeed: 0.13,
      keeperReactionDelay: 50,
      windEnabled: true,
      obstaclesEnabled: true,
      bonusTargetsEnabled: true,
      goalSizeMultiplier: 0.7,
    };

  // Endless mode (level 11+)
  const rounds = 20;
  const goalsNeeded = Math.min(18, 11 + (level - 10));
  const keeperSpeed = Math.min(0.2, 0.13 + (level - 10) * 0.01);
  const keeperReactionDelay = Math.max(20, 50 - (level - 10) * 5);
  const goalSizeMultiplier = Math.max(0.5, 0.7 - (level - 10) * 0.02);

  return {
    rounds,
    goalsNeeded,
    keeperSpeed,
    keeperReactionDelay,
    windEnabled: true,
    obstaclesEnabled: true,
    bonusTargetsEnabled: true,
    goalSizeMultiplier,
  };
}

export default function SoccerGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [displayState, setDisplayState] = useState<"start" | "playing" | "gameover">("start");
  const [goals, setGoals] = useState(0);
  const [round, setRound] = useState(0);
  const [level, setLevel] = useState(1);
  const [lives, setLives] = useState(3);
  const [bestScore, setBestScore] = useState(0);
  const [lastResult, setLastResult] = useState<"scored" | "saved" | null>(null);

  const stateRef = useRef<GameState>("aiming");
  const goalsRef = useRef(0);
  const roundRef = useRef(0);
  const levelRef = useRef(1);
  const livesRef = useRef(3);
  const bestRef = useRef(0);
  const aimXRef = useRef(0.5);
  const aimYRef = useRef(0.5);
  const aimDirXRef = useRef(1);
  const aimDirYRef = useRef(0.7);
  const aimSpeedRef = useRef(0.012);
  const ballRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0, t: 0, curveX: 0 });
  const keeperRef = useRef({ x: 0.5, targetX: 0.5, diving: false, frozen: false, frozenUntil: 0 });
  const animIdRef = useRef(0);
  const resultTimerRef = useRef(0);
  const windRef = useRef({ x: 0, y: 0 });
  const obstacleRef = useRef({ x: 0.5, direction: 1, speed: 0.008 });
  const powerUpsRef = useRef<PowerUp[]>([]);
  const activePowerUpRef = useRef<PowerUpType | null>(null);
  const levelUpFlashRef = useRef(0);
  const bonusHitRef = useRef(false);
  const gameStateRef = useRef<"start" | "playing" | "gameover">("start");

  const CW = 400;
  const CH = 500;
  const BASE_GOAL_TOP = 80;
  const BASE_GOAL_BOT = 220;
  const BASE_GOAL_LEFT = 80;
  const BASE_GOAL_RIGHT = 320;
  const POWERUP_DROP_CHANCE = 0.15;
  const POWERUP_FALL_SPEED = 2;

  useEffect(() => {
    const s = localStorage.getItem("pb-soccer");
    if (s) {
      bestRef.current = parseInt(s, 10);
      setBestScore(bestRef.current);
    }
  }, []);

  const getGoalDimensions = useCallback(() => {
    const config = getLevelConfig(levelRef.current);
    const mult = config.goalSizeMultiplier;
    const baseW = BASE_GOAL_RIGHT - BASE_GOAL_LEFT;
    const baseH = BASE_GOAL_BOT - BASE_GOAL_TOP;
    const newW = baseW * mult;
    const newH = baseH * mult;

    const centerX = (BASE_GOAL_LEFT + BASE_GOAL_RIGHT) / 2;
    const centerY = (BASE_GOAL_TOP + BASE_GOAL_BOT) / 2;

    return {
      left: centerX - newW / 2,
      right: centerX + newW / 2,
      top: centerY - newH / 2,
      bot: centerY + newH / 2,
      width: newW,
      height: newH,
    };
  }, []);

  const drawGoal = useCallback(
    (ctx: CanvasRenderingContext2D) => {
      const goal = getGoalDimensions();

      // Goal net
      ctx.fillStyle = "rgba(255,255,255,0.08)";
      ctx.fillRect(goal.left, goal.top, goal.width, goal.height);

      // Net lines
      ctx.strokeStyle = "rgba(255,255,255,0.15)";
      ctx.lineWidth = 0.5;
      for (let x = goal.left; x <= goal.right; x += 20) {
        ctx.beginPath();
        ctx.moveTo(x, goal.top);
        ctx.lineTo(x, goal.bot);
        ctx.stroke();
      }
      for (let y = goal.top; y <= goal.bot; y += 20) {
        ctx.beginPath();
        ctx.moveTo(goal.left, y);
        ctx.lineTo(goal.right, y);
        ctx.stroke();
      }

      // Goal posts
      ctx.strokeStyle = "#fff";
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(goal.left, goal.bot);
      ctx.lineTo(goal.left, goal.top);
      ctx.lineTo(goal.right, goal.top);
      ctx.lineTo(goal.right, goal.bot);
      ctx.stroke();

      // Bonus targets in corners (if enabled)
      const config = getLevelConfig(levelRef.current);
      if (config.bonusTargetsEnabled) {
        ctx.strokeStyle = "#fbbf24";
        ctx.lineWidth = 2;
        ctx.setLineDash([3, 3]);
        const targetSize = 20;
        // Top-left
        ctx.strokeRect(goal.left + 5, goal.top + 5, targetSize, targetSize);
        // Top-right
        ctx.strokeRect(goal.right - targetSize - 5, goal.top + 5, targetSize, targetSize);
        ctx.setLineDash([]);
      }
    },
    [getGoalDimensions]
  );

  const drawKeeper = useCallback(
    (ctx: CanvasRenderingContext2D) => {
      const goal = getGoalDimensions();
      const kx = goal.left + keeperRef.current.x * goal.width;
      const ky = goal.bot - 50;
      const diving = keeperRef.current.diving;
      const frozen = keeperRef.current.frozen && Date.now() < keeperRef.current.frozenUntil;
      const diveOffset = diving ? (keeperRef.current.targetX - 0.5) * 40 : 0;

      // Frozen effect
      if (frozen) {
        ctx.globalAlpha = 0.5;
        ctx.fillStyle = "#60a5fa";
        ctx.beginPath();
        ctx.arc(kx, ky - 6, 30, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      }

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
        ctx.moveTo(kx - 10, ky - 14);
        ctx.lineTo(kx - 24, ky - 24);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(kx + 10, ky - 14);
        ctx.lineTo(kx + 24, ky - 24);
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
        ctx.beginPath();
        ctx.arc(kx - 24, ky - 24, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(kx + 24, ky - 24, 5, 0, Math.PI * 2);
        ctx.fill();
      }
    },
    [getGoalDimensions]
  );

  const drawObstacle = useCallback(
    (ctx: CanvasRenderingContext2D) => {
      const config = getLevelConfig(levelRef.current);
      if (!config.obstaclesEnabled) return;

      const goal = getGoalDimensions();
      const ox = goal.left + obstacleRef.current.x * goal.width;
      const oy = goal.bot - 100;

      // Defender silhouette
      ctx.fillStyle = "rgba(200, 50, 50, 0.6)";
      ctx.fillRect(ox - 8, oy - 30, 16, 50);
      ctx.beginPath();
      ctx.arc(ox, oy - 36, 6, 0, Math.PI * 2);
      ctx.fill();
    },
    [getGoalDimensions]
  );

  const drawBall = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number) => {
    // Power shot glow
    if (activePowerUpRef.current === "power") {
      ctx.fillStyle = "rgba(239, 68, 68, 0.5)";
      ctx.beginPath();
      ctx.arc(x, y, size + 4, 0, Math.PI * 2);
      ctx.fill();
    }

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

  const drawAimCrosshair = useCallback(
    (ctx: CanvasRenderingContext2D) => {
      const goal = getGoalDimensions();
      const ax = goal.left + aimXRef.current * goal.width;
      const ay = goal.top + (1 - aimYRef.current) * goal.height;

      let color = "rgba(255,50,50,0.8)";
      if (activePowerUpRef.current === "power") color = "rgba(239,68,68,1)";
      else if (activePowerUpRef.current === "curve") color = "rgba(168,85,247,0.9)";

      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]);
      // Crosshair
      ctx.beginPath();
      ctx.moveTo(ax - 15, ay);
      ctx.lineTo(ax + 15, ay);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(ax, ay - 15);
      ctx.lineTo(ax, ay + 15);
      ctx.stroke();
      ctx.setLineDash([]);
      // Circle
      ctx.beginPath();
      ctx.arc(ax, ay, 10, 0, Math.PI * 2);
      ctx.stroke();
    },
    [getGoalDimensions]
  );

  const drawWindIndicator = useCallback((ctx: CanvasRenderingContext2D) => {
    const config = getLevelConfig(levelRef.current);
    if (!config.windEnabled) return;

    const windStrength = Math.sqrt(windRef.current.x ** 2 + windRef.current.y ** 2);
    if (windStrength < 0.01) return;

    const wx = CW / 2;
    const wy = CH - 30;
    const arrowLen = windStrength * 40;
    const angle = Math.atan2(windRef.current.y, windRef.current.x);

    ctx.strokeStyle = "rgba(147, 197, 253, 0.7)";
    ctx.fillStyle = "rgba(147, 197, 253, 0.7)";
    ctx.lineWidth = 2;

    // Arrow shaft
    ctx.beginPath();
    ctx.moveTo(wx, wy);
    ctx.lineTo(wx + Math.cos(angle) * arrowLen, wy + Math.sin(angle) * arrowLen);
    ctx.stroke();

    // Arrow head
    const headLen = 8;
    const headAngle = Math.PI / 6;
    const endX = wx + Math.cos(angle) * arrowLen;
    const endY = wy + Math.sin(angle) * arrowLen;

    ctx.beginPath();
    ctx.moveTo(endX, endY);
    ctx.lineTo(endX - headLen * Math.cos(angle - headAngle), endY - headLen * Math.sin(angle - headAngle));
    ctx.moveTo(endX, endY);
    ctx.lineTo(endX - headLen * Math.cos(angle + headAngle), endY - headLen * Math.sin(angle + headAngle));
    ctx.stroke();

    ctx.font = "10px sans-serif";
    ctx.fillStyle = "rgba(147, 197, 253, 0.9)";
    ctx.textAlign = "center";
    ctx.fillText("WIND", wx, wy - 10);
  }, [CW, CH]);

  const spawnPowerUp = useCallback(() => {
    if (Math.random() < POWERUP_DROP_CHANCE) {
      const types: PowerUpType[] = ["power", "curve", "freeze"];
      const type = types[Math.floor(Math.random() * types.length)];
      const x = 100 + Math.random() * (CW - 200);
      powerUpsRef.current.push({ x, y: 50, type });
    }
  }, [CW]);

  const shoot = useCallback(() => {
    if (stateRef.current !== "aiming") return;
    stateRef.current = "shooting";

    const goal = getGoalDimensions();
    const targetX = goal.left + aimXRef.current * goal.width;
    const targetY = goal.top + (1 - aimYRef.current) * goal.height;

    // Curve effect
    let curveX = 0;
    if (activePowerUpRef.current === "curve") {
      curveX = (Math.random() - 0.5) * 80; // Random curve
    }

    ballRef.current = { x: CW / 2, y: CH - 60, targetX, targetY, t: 0, curveX };

    // Keeper reacts (unless frozen or power shot)
    const config = getLevelConfig(levelRef.current);
    const isPowerShot = activePowerUpRef.current === "power";
    const isFrozen = keeperRef.current.frozen && Date.now() < keeperRef.current.frozenUntil;

    if (!isPowerShot && !isFrozen) {
      setTimeout(() => {
        const accuracy = 1 - config.keeperSpeed * 4;
        const keeperGuess = aimXRef.current + (Math.random() - 0.5) * accuracy;
        keeperRef.current.targetX = Math.max(0.1, Math.min(0.9, keeperGuess));
        keeperRef.current.diving = true;
      }, config.keeperReactionDelay);
    }

    // Clear power-up after use
    if (activePowerUpRef.current) {
      activePowerUpRef.current = null;
    }
  }, [getGoalDimensions, CW, CH]);

  const nextRound = useCallback(() => {
    const config = getLevelConfig(levelRef.current);

    // Check if level complete
    if (roundRef.current >= config.rounds) {
      if (goalsRef.current >= config.goalsNeeded) {
        // Level passed!
        levelRef.current++;
        setLevel(levelRef.current);
        roundRef.current = 0;
        goalsRef.current = 0;
        setRound(0);
        setGoals(0);

        // Bonus life every 3 levels (cap at 5)
        if (levelRef.current % 3 === 0 && livesRef.current < 5) {
          livesRef.current++;
          setLives(livesRef.current);
        }

        levelUpFlashRef.current = 120; // ~2 seconds
      } else {
        // Failed level - lose a life
        livesRef.current--;
        setLives(livesRef.current);

        if (livesRef.current <= 0) {
          // Game over
          stateRef.current = "roundEnd";
          gameStateRef.current = "gameover";
          setDisplayState("gameover");

          if (levelRef.current > bestRef.current) {
            bestRef.current = levelRef.current;
            setBestScore(bestRef.current);
            localStorage.setItem("pb-soccer", bestRef.current.toString());
          }
          return;
        } else {
          // Retry level
          roundRef.current = 0;
          goalsRef.current = 0;
          setRound(0);
          setGoals(0);
        }
      }

      // Reset wind and obstacles
      windRef.current = { x: 0, y: 0 };
      obstacleRef.current = { x: 0.5, direction: 1, speed: 0.008 };
    }

    roundRef.current++;
    setRound(roundRef.current);

    // Randomize wind
    if (config.windEnabled) {
      const strength = 0.3 + Math.random() * 0.7;
      const angle = Math.random() * Math.PI * 2;
      windRef.current = {
        x: Math.cos(angle) * strength,
        y: Math.sin(angle) * strength * 0.3,
      };
    }

    stateRef.current = "aiming";
    keeperRef.current = { x: 0.5, targetX: 0.5, diving: false, frozen: false, frozenUntil: 0 };
    aimSpeedRef.current = Math.min(0.025, 0.012 + levelRef.current * 0.0012);
    bonusHitRef.current = false;

    // Spawn power-up occasionally
    spawnPowerUp();
  }, [spawnPowerUp]);

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
    const goal = getGoalDimensions();
    ctx.beginPath();
    ctx.arc(CW / 2, goal.bot + 40, 50, 0, Math.PI * 2);
    ctx.stroke();
    // Penalty box
    ctx.strokeRect(goal.left - 30, goal.bot, goal.width + 60, 140);

    drawGoal(ctx);

    // Obstacle animation
    const config = getLevelConfig(levelRef.current);
    if (config.obstaclesEnabled && stateRef.current === "aiming") {
      obstacleRef.current.x += obstacleRef.current.direction * obstacleRef.current.speed;
      if (obstacleRef.current.x <= 0.1 || obstacleRef.current.x >= 0.9) {
        obstacleRef.current.direction *= -1;
      }
    }

    // Power-up movement
    powerUpsRef.current = powerUpsRef.current.filter((powerUp) => {
      powerUp.y += POWERUP_FALL_SPEED;

      // Check collision with ball area
      const ballX = CW / 2;
      const ballY = CH - 60;
      const dist = Math.sqrt((powerUp.x - ballX) ** 2 + (powerUp.y - ballY) ** 2);
      if (dist < 25 && stateRef.current === "aiming") {
        activePowerUpRef.current = powerUp.type;
        if (powerUp.type === "freeze") {
          keeperRef.current.frozen = true;
          keeperRef.current.frozenUntil = Date.now() + 3000; // 3 seconds
        }
        return false;
      }

      return powerUp.y < CH - 50;
    });

    // Draw power-ups
    powerUpsRef.current.forEach((powerUp) => {
      let color = "#ef4444"; // power
      let letter = "P";
      if (powerUp.type === "curve") {
        color = "#a855f7";
        letter = "C";
      } else if (powerUp.type === "freeze") {
        color = "#60a5fa";
        letter = "F";
      }

      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(powerUp.x, powerUp.y, 12, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "#fff";
      ctx.font = "bold 14px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(letter, powerUp.x, powerUp.y);
    });

    // Aim movement
    if (stateRef.current === "aiming") {
      aimXRef.current += aimDirXRef.current * aimSpeedRef.current;
      aimYRef.current += aimDirYRef.current * aimSpeedRef.current * 0.6;
      if (aimXRef.current <= 0 || aimXRef.current >= 1) aimDirXRef.current *= -1;
      if (aimYRef.current <= 0 || aimYRef.current >= 1) aimDirYRef.current *= -1;
      aimXRef.current = Math.max(0, Math.min(1, aimXRef.current));
      aimYRef.current = Math.max(0, Math.min(1, aimYRef.current));

      drawObstacle(ctx);
      drawAimCrosshair(ctx);
      drawWindIndicator(ctx);
      drawKeeper(ctx);
      drawBall(ctx, CW / 2, CH - 60, 14);
    }

    // Ball animation
    if (stateRef.current === "shooting") {
      const b = ballRef.current;
      b.t += 0.04;
      if (b.t >= 1) b.t = 1;

      const ease = 1 - Math.pow(1 - b.t, 3);
      let bx = b.x + (b.targetX - b.x) * ease;
      const by = b.y + (b.targetY - b.y) * ease;

      // Apply wind
      if (config.windEnabled) {
        bx += windRef.current.x * ease * 30;
      }

      // Apply curve
      if (b.curveX !== 0) {
        const curveProgress = Math.sin(ease * Math.PI);
        bx += b.curveX * curveProgress;
      }

      const size = 14 - ease * 6;

      // Keeper movement (unless frozen)
      const k = keeperRef.current;
      const isFrozen = k.frozen && Date.now() < k.frozenUntil;
      if (!isFrozen && k.diving) {
        k.x += (k.targetX - k.x) * config.keeperSpeed;
      }

      drawObstacle(ctx);
      drawWindIndicator(ctx);
      drawKeeper(ctx);
      drawBall(ctx, bx, by, size);

      if (b.t >= 1) {
        // Calculate final shot position in goal coordinates
        const shotX = (bx - goal.left) / goal.width;
        const shotY = (by - goal.top) / goal.height;

        // Check if in goal bounds
        if (bx >= goal.left && bx <= goal.right && by >= goal.top && by <= goal.bot) {
          // Check keeper save
          const dist = Math.abs(k.x - shotX);
          const saved = k.diving && dist < 0.16;

          // Check obstacle block
          let blocked = false;
          if (config.obstaclesEnabled) {
            const obstacleDist = Math.abs(obstacleRef.current.x - shotX);
            if (obstacleDist < 0.12 && shotY > 0.4) {
              // Obstacle blocks lower shots
              blocked = true;
            }
          }

          if (saved || blocked) {
            stateRef.current = "saved";
            setLastResult("saved");
          } else {
            // Check bonus target hit
            const targetSize = 20 / goal.width;
            const margin = 5 / goal.width;
            const isTopLeft =
              shotX >= margin && shotX <= margin + targetSize && shotY >= margin / (goal.height / goal.width) && shotY <= (margin + targetSize) / (goal.height / goal.width);
            const isTopRight =
              shotX >= 1 - margin - targetSize && shotX <= 1 - margin && shotY >= margin / (goal.height / goal.width) && shotY <= (margin + targetSize) / (goal.height / goal.width);

            if (config.bonusTargetsEnabled && (isTopLeft || isTopRight)) {
              bonusHitRef.current = true;
              goalsRef.current += 2; // Bonus!
            } else {
              goalsRef.current++;
            }

            setGoals(goalsRef.current);
            stateRef.current = "scored";
            setLastResult("scored");
          }
        } else {
          // Missed the goal entirely
          stateRef.current = "saved";
          setLastResult("saved");
        }

        resultTimerRef.current = Date.now();
      }
    }

    // Result display
    if (stateRef.current === "scored" || stateRef.current === "saved") {
      drawObstacle(ctx);
      drawKeeper(ctx);
      const elapsed = Date.now() - resultTimerRef.current;

      ctx.font = "bold 48px sans-serif";
      ctx.textAlign = "center";
      const alpha = Math.min(1, elapsed / 300);
      ctx.globalAlpha = alpha;

      if (stateRef.current === "scored") {
        ctx.fillStyle = "#22c55e";
        ctx.fillText(bonusHitRef.current ? "BONUS!" : "GOAL!", CW / 2, CH / 2 - 20);
        if (bonusHitRef.current) {
          ctx.font = "20px sans-serif";
          ctx.fillStyle = "#fbbf24";
          ctx.fillText("+2 Goals", CW / 2, CH / 2 + 20);
        }
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

    // Level-up flash
    if (levelUpFlashRef.current > 0) {
      levelUpFlashRef.current--;
      const alpha = Math.min(1, levelUpFlashRef.current / 40);
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.font = "bold 36px monospace";
      ctx.textAlign = "center";
      ctx.fillStyle = "#22c55e";
      ctx.fillText(`LEVEL ${levelRef.current}`, CW / 2, CH / 2 - 30);
      ctx.font = "18px monospace";
      ctx.fillStyle = "#86efac";

      const newConfig = getLevelConfig(levelRef.current);
      ctx.fillText(`Score ${newConfig.goalsNeeded}/${newConfig.rounds} goals!`, CW / 2, CH / 2 + 10);
      ctx.restore();
    }

    // HUD
    ctx.font = "bold 16px sans-serif";
    ctx.fillStyle = "#fff";
    ctx.textAlign = "left";
    const levelConfig = getLevelConfig(levelRef.current);
    ctx.fillText(`Goals: ${goalsRef.current}/${levelConfig.goalsNeeded}`, 12, 30);
    ctx.fillText(`Round: ${roundRef.current}/${levelConfig.rounds}`, 12, 50);
    ctx.textAlign = "right";
    ctx.fillStyle = "#ef4444";
    ctx.fillText(`Lives: ${livesRef.current}`, CW - 12, 30);
    ctx.fillStyle = "#60a5fa";
    ctx.fillText(`Level ${levelRef.current}`, CW - 12, 50);

    // Active power-up indicator
    if (activePowerUpRef.current) {
      ctx.font = "bold 12px sans-serif";
      ctx.textAlign = "center";
      ctx.fillStyle = "#fbbf24";
      let text = "";
      if (activePowerUpRef.current === "power") text = "POWER SHOT";
      else if (activePowerUpRef.current === "curve") text = "CURVE BALL";
      else if (activePowerUpRef.current === "freeze") text = "KEEPER FROZEN";
      ctx.fillText(text, CW / 2, 25);
    }

    if (stateRef.current !== "roundEnd" && gameStateRef.current !== "gameover") {
      animIdRef.current = requestAnimationFrame(gameLoop);
    }
  }, [nextRound, drawGoal, drawKeeper, drawObstacle, drawAimCrosshair, drawWindIndicator, getGoalDimensions, CW, CH]);

  useEffect(() => {
    return () => {
      if (animIdRef.current) cancelAnimationFrame(animIdRef.current);
    };
  }, []);

  const startGame = () => {
    goalsRef.current = 0;
    roundRef.current = 0;
    levelRef.current = 1;
    livesRef.current = 3;
    stateRef.current = "aiming";
    gameStateRef.current = "playing";
    keeperRef.current = { x: 0.5, targetX: 0.5, diving: false, frozen: false, frozenUntil: 0 };
    aimXRef.current = 0.5;
    aimYRef.current = 0.5;
    aimDirXRef.current = 1;
    aimDirYRef.current = 0.7;
    aimSpeedRef.current = 0.012;
    windRef.current = { x: 0, y: 0 };
    obstacleRef.current = { x: 0.5, direction: 1, speed: 0.008 };
    powerUpsRef.current = [];
    activePowerUpRef.current = null;
    levelUpFlashRef.current = 120;
    bonusHitRef.current = false;

    setGoals(0);
    setRound(0);
    setLevel(1);
    setLives(3);
    setLastResult(null);
    setDisplayState("playing");
    animIdRef.current = requestAnimationFrame(gameLoop);
  };

  const handleClick = () => {
    if (stateRef.current === "aiming") shoot();
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        e.preventDefault();
        handleClick();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const handleShare = async () => {
    const text = `I reached Level ${levelRef.current} in Penalty Kicks! Can you beat me? https://playmini.fun/soccer`;
    if (navigator.share) {
      try {
        await navigator.share({ text });
      } catch {}
    } else {
      try {
        await navigator.clipboard.writeText(text);
        alert("Copied!");
      } catch {}
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
          <div className="text-xs text-gray-500 uppercase tracking-wider">Goals</div>
          <div className="text-2xl font-black text-green-400 tabular-nums">{goals}</div>
        </div>
        <div>
          <div className="text-xs text-gray-500 uppercase tracking-wider">Lives</div>
          <div className="text-2xl font-black text-red-400 tabular-nums">{lives}</div>
        </div>
        <div>
          <div className="text-xs text-gray-500 uppercase tracking-wider">Best</div>
          <div className="text-2xl font-black text-yellow-400 tabular-nums">{bestScore}</div>
        </div>
      </div>

      <div className="relative">
        <canvas
          ref={canvasRef}
          width={CW}
          height={CH}
          className="rounded-2xl cursor-pointer max-w-full h-auto border border-slate-700"
          onClick={handleClick}
          onTouchStart={(e) => {
            e.preventDefault();
            handleClick();
          }}
          style={{ touchAction: "manipulation" }}
        />

        {displayState === "start" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/85 rounded-2xl backdrop-blur-sm">
            <div className="text-5xl mb-3">⚽</div>
            <h2 className="text-3xl font-black text-green-400 mb-2">Penalty Kicks</h2>
            <p className="text-gray-400 mb-2 text-sm text-center px-6">Shoot when the crosshair is positioned!</p>
            <p className="text-gray-500 mb-6 text-xs text-center px-6">10 campaign levels + endless mode</p>
            <button
              onClick={startGame}
              className="px-10 py-3 bg-green-600 hover:bg-green-500 text-white font-bold rounded-2xl transition-all hover:scale-105 active:scale-95"
            >
              Play
            </button>
            {bestScore > 0 && <p className="text-yellow-400 text-sm mt-3">Best Level: {bestScore}</p>}
          </div>
        )}

        {displayState === "gameover" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/85 rounded-2xl backdrop-blur-sm">
            <h2 className="text-3xl font-black text-green-400 mb-4">Full Time!</h2>
            <div className="bg-slate-900/80 rounded-xl px-6 py-3 mb-6 text-center">
              <p className="text-white text-xl font-bold">Level Reached: {level}</p>
              <p className="text-gray-400 text-sm mt-1">Best: Level {bestScore}</p>
              {level >= bestScore && level > 1 && <p className="text-yellow-400 text-sm font-bold mt-1">New Best!</p>}
            </div>
            <div className="flex gap-3">
              <button
                onClick={startGame}
                className="px-6 py-3 bg-green-600 hover:bg-green-500 text-white font-bold rounded-xl transition-all hover:scale-105 active:scale-95"
              >
                Play Again
              </button>
              <button
                onClick={handleShare}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all hover:scale-105 active:scale-95"
              >
                Share
              </button>
              <DownloadButton canvasRef={canvasRef} filename="soccer-score" label="Save" />
            </div>
          </div>
        )}
      </div>

      {displayState === "playing" && (
        <div className="text-center">
          <p className="text-gray-500 text-xs">Tap or press Space to shoot</p>
          <p className="text-gray-600 text-xs mt-1">Collect power-ups: Power Shot (P), Curve Ball (C), Freeze Keeper (F)</p>
          <p className="text-yellow-500 text-xs mt-1">Hit corner targets for bonus goals!</p>
        </div>
      )}
    </div>
  );
}
