"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import DownloadButton from "./DownloadButton";

type BrickType = "normal" | "tough" | "steel" | "explosive" | "gold";

interface Brick {
  x: number;
  y: number;
  color: string;
  points: number;
  visible: boolean;
  type: BrickType;
  hp: number;
  maxHp: number;
}

type PowerUpType = "multiball" | "wide" | "laser" | "slow";

interface PowerUp {
  x: number;
  y: number;
  type: PowerUpType;
  active: boolean;
}

interface Laser {
  x: number;
  y: number;
}

interface Ball {
  x: number;
  y: number;
  radius: number;
  velocityX: number;
  velocityY: number;
  launched: boolean;
}

const SCALE = 2;
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;
const RENDER_WIDTH = CANVAS_WIDTH * SCALE;
const RENDER_HEIGHT = CANVAS_HEIGHT * SCALE;

const BRICK_ROWS = 6;
const BRICK_COLS = 10;
const BRICK_WIDTH = 70;
const BRICK_HEIGHT = 20;
const BRICK_PADDING = 5;
const BRICK_OFFSET_TOP = 60;
const BRICK_OFFSET_LEFT = 35;

const POWERUP_FALL_SPEED = 3;
const POWERUP_DURATION = 10000; // 10 seconds
const POWERUP_DROP_CHANCE = 0.15;
const LASER_SPEED = 8;

type LevelConfig = {
  level: number;
  name: string;
  ballSpeed: number;
  pattern: string;
  description: string;
};

const LEVEL_CONFIGS: LevelConfig[] = [
  { level: 1, name: "Getting Started", ballSpeed: 4, pattern: "classic", description: "Classic 6-row rainbow" },
  { level: 2, name: "Tough Walls", ballSpeed: 4.5, pattern: "mixed1", description: "Tough bricks appear" },
  { level: 3, name: "Speed Up", ballSpeed: 5, pattern: "mixed2", description: "Faster ball speed" },
  { level: 4, name: "Steel Fortress", ballSpeed: 5.5, pattern: "steel", description: "Steel bricks added" },
  { level: 5, name: "Explosions", ballSpeed: 6, pattern: "explosive", description: "Watch for explosions" },
  { level: 6, name: "Gold Rush", ballSpeed: 6.5, pattern: "gold", description: "Bonus point bricks" },
  { level: 7, name: "Chaos", ballSpeed: 7, pattern: "chaos", description: "All brick types mixed" },
  { level: 8, name: "The Gauntlet", ballSpeed: 7.5, pattern: "gauntlet", description: "Dense patterns" },
  { level: 9, name: "Speed Demon", ballSpeed: 8, pattern: "demon", description: "Maximum speed" },
  { level: 10, name: "Final Challenge", ballSpeed: 8.5, pattern: "final", description: "The ultimate test" },
];

export default function BreakoutGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameStateRef = useRef({
    isRunning: false,
    gameOver: false,
    score: 0,
    bestScore: 0,
    lives: 3,
    level: 1,
    combo: 0,
    maxCombo: 0,
    lastHitTime: 0,
    paddle: {
      x: 350,
      y: 550,
      width: 100,
      height: 12,
      speed: 8,
      baseWidth: 100,
    },
    balls: [] as Ball[],
    bricks: [] as Brick[],
    powerUps: [] as PowerUp[],
    lasers: [] as Laser[],
    activePowerUps: {
      wide: false,
      laser: false,
      slow: false,
    },
    powerUpTimers: {
      wide: 0,
      laser: 0,
      slow: 0,
    },
    keys: {
      left: false,
      right: false,
    },
    touchX: null as number | null,
  });

  const [displayScore, setDisplayScore] = useState(0);
  const [displayBest, setDisplayBest] = useState(0);
  const [displayLives, setDisplayLives] = useState(3);
  const [displayLevel, setDisplayLevel] = useState(1);
  const [displayCombo, setDisplayCombo] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [started, setStarted] = useState(false);
  const [levelUpFlash, setLevelUpFlash] = useState(0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const best = localStorage.getItem("pb-breakout");
    if (best) {
      gameStateRef.current.bestScore = parseInt(best, 10);
      setDisplayBest(parseInt(best, 10));
    }
  }, []);

  const getBrickColor = (type: BrickType, row: number): string => {
    if (type === "gold") return "#eab308";
    if (type === "explosive") return "#dc2626";
    if (type === "steel") return "#64748b";
    if (type === "tough") return "#2563eb";

    // Normal bricks use rainbow
    const colors = ["#ef4444", "#f97316", "#eab308", "#22c55e", "#3b82f6", "#a855f7"];
    return colors[row % 6];
  };

  const getBrickHP = (type: BrickType): number => {
    if (type === "tough") return 2;
    if (type === "steel") return 3;
    return 1;
  };

  const getBrickPoints = (type: BrickType, row: number): number => {
    if (type === "gold") return 200;
    if (type === "explosive") return 100;
    if (type === "steel") return 80;
    if (type === "tough") return 60;

    // Normal bricks by row
    return 70 - row * 10;
  };

  const createBricks = (level: number): Brick[] => {
    const bricks: Brick[] = [];
    const config = LEVEL_CONFIGS[Math.min(level - 1, LEVEL_CONFIGS.length - 1)];
    const pattern = config.pattern;

    for (let row = 0; row < BRICK_ROWS; row++) {
      for (let col = 0; col < BRICK_COLS; col++) {
        let type: BrickType = "normal";

        // Pattern-based brick types
        if (pattern === "classic") {
          type = "normal";
        } else if (pattern === "mixed1") {
          if (row === 0 || row === 1) type = "tough";
        } else if (pattern === "mixed2") {
          if (row === 0) type = "tough";
          if (row === 1 && col % 2 === 0) type = "tough";
        } else if (pattern === "steel") {
          if (row === 0) type = "steel";
          if (row === 1 || row === 2) type = "tough";
        } else if (pattern === "explosive") {
          if ((row + col) % 3 === 0) type = "explosive";
          if (row === 0) type = "tough";
        } else if (pattern === "gold") {
          if (row === 0 && col % 2 === 0) type = "gold";
          if (row === 1) type = "steel";
          if (row === 2 || row === 3) type = "tough";
        } else if (pattern === "chaos") {
          const rand = Math.random();
          if (rand < 0.1) type = "gold";
          else if (rand < 0.25) type = "explosive";
          else if (rand < 0.45) type = "steel";
          else if (rand < 0.65) type = "tough";
        } else if (pattern === "gauntlet") {
          if (row === 0) type = "steel";
          if (row === 1 || row === 2) type = "tough";
          if ((row + col) % 4 === 0 && row > 2) type = "explosive";
        } else if (pattern === "demon") {
          if (row <= 1) type = "steel";
          if (row === 2 || row === 3) type = "tough";
          if (col % 3 === 0 && row > 3) type = "explosive";
        } else if (pattern === "final") {
          if (row === 0) type = col % 2 === 0 ? "gold" : "steel";
          if (row === 1 || row === 2) type = "steel";
          if (row === 3 || row === 4) type = "tough";
          if ((row + col) % 3 === 0 && row === 5) type = "explosive";
        }

        const hp = getBrickHP(type);
        bricks.push({
          x: col * (BRICK_WIDTH + BRICK_PADDING) + BRICK_OFFSET_LEFT,
          y: row * (BRICK_HEIGHT + BRICK_PADDING) + BRICK_OFFSET_TOP,
          color: getBrickColor(type, row),
          points: getBrickPoints(type, row),
          visible: true,
          type,
          hp,
          maxHp: hp,
        });
      }
    }
    return bricks;
  };

  const drawBrick = (ctx: CanvasRenderingContext2D, brick: Brick) => {
    if (!brick.visible) return;

    // Dim if damaged
    const opacity = brick.hp / brick.maxHp;
    ctx.globalAlpha = opacity;

    // Main brick
    ctx.fillStyle = brick.color;
    ctx.fillRect(brick.x, brick.y, BRICK_WIDTH, BRICK_HEIGHT);

    // Special effects
    if (brick.type === "explosive") {
      // Warning stripes
      ctx.fillStyle = "rgba(0, 0, 0, 0.2)";
      for (let i = 0; i < BRICK_WIDTH; i += 8) {
        ctx.fillRect(brick.x + i, brick.y, 4, BRICK_HEIGHT);
      }
      // Exclamation mark
      ctx.fillStyle = "#fff";
      ctx.font = "bold 14px monospace";
      ctx.textAlign = "center";
      ctx.fillText("!", brick.x + BRICK_WIDTH / 2, brick.y + BRICK_HEIGHT - 4);
    } else if (brick.type === "gold") {
      // Star
      ctx.fillStyle = "#fef3c7";
      ctx.font = "bold 16px monospace";
      ctx.textAlign = "center";
      ctx.fillText("★", brick.x + BRICK_WIDTH / 2, brick.y + BRICK_HEIGHT - 3);
    } else if (brick.type === "steel") {
      // Metallic pattern
      ctx.fillStyle = "rgba(255, 255, 255, 0.2)";
      ctx.fillRect(brick.x + 2, brick.y + 2, 4, BRICK_HEIGHT - 4);
      ctx.fillRect(brick.x + BRICK_WIDTH - 6, brick.y + 2, 4, BRICK_HEIGHT - 4);
    }

    // Highlight (top-left)
    ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
    ctx.fillRect(brick.x + 2, brick.y + 2, BRICK_WIDTH - 4, 3);

    // Shadow (bottom-right)
    ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
    ctx.fillRect(brick.x + 2, brick.y + BRICK_HEIGHT - 3, BRICK_WIDTH - 4, 2);

    // HP indicator for multi-hit bricks
    if (brick.hp > 1 && brick.type !== "gold") {
      ctx.fillStyle = "#fff";
      ctx.font = "bold 10px monospace";
      ctx.textAlign = "right";
      ctx.fillText(brick.hp.toString(), brick.x + BRICK_WIDTH - 4, brick.y + 12);
    }

    ctx.globalAlpha = 1.0;
  };

  const drawPaddle = (ctx: CanvasRenderingContext2D) => {
    const { paddle, activePowerUps } = gameStateRef.current;

    // Laser cannons
    if (activePowerUps.laser) {
      ctx.fillStyle = "#ef4444";
      ctx.fillRect(paddle.x - 5, paddle.y, 4, paddle.height);
      ctx.fillRect(paddle.x + paddle.width + 1, paddle.y, 4, paddle.height);
    }

    // Main paddle
    ctx.fillStyle = activePowerUps.wide ? "#3b82f6" : "#10b981";
    ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);

    // Highlight
    ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
    ctx.fillRect(paddle.x + 4, paddle.y + 2, paddle.width - 8, 4);

    // Shadow
    ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
    ctx.fillRect(paddle.x + 4, paddle.y + paddle.height - 3, paddle.width - 8, 2);
  };

  const drawBall = (ctx: CanvasRenderingContext2D, ball: Ball) => {
    const { activePowerUps } = gameStateRef.current;

    // Main ball
    ctx.fillStyle = activePowerUps.slow ? "#3b82f6" : "#f59e0b";
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fill();

    // Shine
    ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
    ctx.beginPath();
    ctx.arc(ball.x - 2, ball.y - 2, ball.radius / 2, 0, Math.PI * 2);
    ctx.fill();
  };

  const drawPowerUp = (ctx: CanvasRenderingContext2D, powerUp: PowerUp) => {
    let color = "#22c55e";
    let letter = "?";

    if (powerUp.type === "multiball") {
      color = "#a855f7";
      letter = "M";
    } else if (powerUp.type === "wide") {
      color = "#3b82f6";
      letter = "W";
    } else if (powerUp.type === "laser") {
      color = "#ef4444";
      letter = "L";
    } else if (powerUp.type === "slow") {
      color = "#06b6d4";
      letter = "S";
    }

    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(powerUp.x, powerUp.y, 8, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#000";
    ctx.font = "bold 12px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(letter, powerUp.x, powerUp.y);
  };

  const drawLaser = (ctx: CanvasRenderingContext2D, laser: Laser) => {
    ctx.fillStyle = "#ef4444";
    ctx.fillRect(laser.x, laser.y, 3, 12);
  };

  const spawnPowerUp = (x: number, y: number) => {
    if (Math.random() < POWERUP_DROP_CHANCE) {
      const types: PowerUpType[] = ["multiball", "wide", "laser", "slow"];
      const type = types[Math.floor(Math.random() * types.length)];
      gameStateRef.current.powerUps.push({ x, y, type, active: true });
    }
  };

  const activatePowerUp = (type: PowerUpType) => {
    const state = gameStateRef.current;

    if (type === "multiball") {
      // Split each ball into 3
      const newBalls: Ball[] = [];
      state.balls.forEach(ball => {
        if (ball.launched) {
          const speed = Math.sqrt(ball.velocityX ** 2 + ball.velocityY ** 2);
          newBalls.push({
            ...ball,
            velocityX: speed * 0.7,
            velocityY: -speed * 0.7,
          });
          newBalls.push({
            ...ball,
            velocityX: -speed * 0.7,
            velocityY: -speed * 0.7,
          });
        }
      });
      state.balls.push(...newBalls);
    } else if (type === "wide") {
      // Widen paddle temporarily
      clearTimeout(state.powerUpTimers.wide);
      state.activePowerUps.wide = true;
      state.paddle.width = state.paddle.baseWidth * 1.5;
      state.powerUpTimers.wide = window.setTimeout(() => {
        state.activePowerUps.wide = false;
        state.paddle.width = state.paddle.baseWidth;
      }, POWERUP_DURATION);
    } else if (type === "laser") {
      // Enable laser shooting
      clearTimeout(state.powerUpTimers.laser);
      state.activePowerUps.laser = true;
      state.powerUpTimers.laser = window.setTimeout(() => {
        state.activePowerUps.laser = false;
      }, POWERUP_DURATION);
    } else if (type === "slow") {
      // Slow down all balls
      clearTimeout(state.powerUpTimers.slow);
      state.activePowerUps.slow = true;
      state.balls.forEach(ball => {
        ball.velocityX *= 0.6;
        ball.velocityY *= 0.6;
      });
      state.powerUpTimers.slow = window.setTimeout(() => {
        state.activePowerUps.slow = false;
        state.balls.forEach(ball => {
          ball.velocityX *= 1.67;
          ball.velocityY *= 1.67;
        });
      }, POWERUP_DURATION);
    }
  };

  const destroyBrick = (brick: Brick, fromExplosion = false) => {
    const state = gameStateRef.current;
    brick.visible = false;

    if (!fromExplosion) {
      // Update combo
      const now = Date.now();
      if (now - state.lastHitTime < 1000) {
        state.combo++;
      } else {
        state.combo = 1;
      }
      state.lastHitTime = now;
      state.maxCombo = Math.max(state.maxCombo, state.combo);

      // Add score with combo multiplier
      const multiplier = Math.min(state.combo, 10);
      state.score += brick.points * multiplier;
      setDisplayScore(state.score);
      setDisplayCombo(state.combo);

      // Spawn power-up
      spawnPowerUp(brick.x + BRICK_WIDTH / 2, brick.y + BRICK_HEIGHT / 2);
    }

    // Explosive bricks destroy neighbors
    if (brick.type === "explosive") {
      state.bricks.forEach(other => {
        if (other.visible && other !== brick) {
          const dx = Math.abs(other.x - brick.x);
          const dy = Math.abs(other.y - brick.y);
          if (dx <= BRICK_WIDTH + BRICK_PADDING && dy <= BRICK_HEIGHT + BRICK_PADDING) {
            other.hp = 0;
            destroyBrick(other, true);
            state.score += other.points;
            setDisplayScore(state.score);
          }
        }
      });
    }
  };

  const checkBallCollision = (ball: Ball) => {
    const state = gameStateRef.current;
    const { paddle, bricks } = state;

    // Wall collisions
    if (ball.x - ball.radius < 0 || ball.x + ball.radius > CANVAS_WIDTH) {
      ball.velocityX = -ball.velocityX;
      ball.x = Math.max(ball.radius, Math.min(CANVAS_WIDTH - ball.radius, ball.x));
    }

    if (ball.y - ball.radius < 0) {
      ball.velocityY = -ball.velocityY;
      ball.y = ball.radius;
    }

    // Paddle collision
    if (
      ball.y + ball.radius > paddle.y &&
      ball.y - ball.radius < paddle.y + paddle.height &&
      ball.x > paddle.x &&
      ball.x < paddle.x + paddle.width
    ) {
      // Reset combo on paddle hit
      state.combo = 0;
      setDisplayCombo(0);

      // Bounce with angle based on hit position
      const hitPos = (ball.x - paddle.x) / paddle.width;
      const angle = (hitPos - 0.5) * Math.PI * 0.6;
      const speed = Math.sqrt(ball.velocityX ** 2 + ball.velocityY ** 2);
      ball.velocityX = speed * Math.sin(angle);
      ball.velocityY = -Math.abs(speed * Math.cos(angle));
      ball.y = paddle.y - ball.radius;
    }

    // Brick collision
    for (const brick of bricks) {
      if (!brick.visible) continue;

      if (
        ball.x + ball.radius > brick.x &&
        ball.x - ball.radius < brick.x + BRICK_WIDTH &&
        ball.y + ball.radius > brick.y &&
        ball.y - ball.radius < brick.y + BRICK_HEIGHT
      ) {
        brick.hp--;
        if (brick.hp <= 0) {
          destroyBrick(brick);
        } else {
          // Just damaged, still give some points
          state.score += 10;
          setDisplayScore(state.score);
        }

        // Determine bounce direction
        const ballCenterX = ball.x;
        const ballCenterY = ball.y;
        const brickCenterX = brick.x + BRICK_WIDTH / 2;
        const brickCenterY = brick.y + BRICK_HEIGHT / 2;

        const dx = ballCenterX - brickCenterX;
        const dy = ballCenterY - brickCenterY;

        if (Math.abs(dx / (BRICK_WIDTH / 2)) > Math.abs(dy / (BRICK_HEIGHT / 2))) {
          ball.velocityX = -ball.velocityX;
        } else {
          ball.velocityY = -ball.velocityY;
        }

        break;
      }
    }

    // Ball fell off bottom
    if (ball.y - ball.radius > CANVAS_HEIGHT) {
      return true; // Ball is lost
    }

    return false;
  };

  const checkLaserCollision = (laser: Laser) => {
    const state = gameStateRef.current;

    for (const brick of state.bricks) {
      if (!brick.visible) continue;

      if (
        laser.x >= brick.x &&
        laser.x <= brick.x + BRICK_WIDTH &&
        laser.y >= brick.y &&
        laser.y <= brick.y + BRICK_HEIGHT
      ) {
        brick.hp--;
        if (brick.hp <= 0) {
          destroyBrick(brick);
        } else {
          state.score += 10;
          setDisplayScore(state.score);
        }
        return true; // Laser hit
      }
    }

    return false;
  };

  const gameLoop = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const state = gameStateRef.current;
    if (!state.isRunning || state.gameOver) return;

    // Clear canvas
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = "#0f172a";
    ctx.fillRect(0, 0, RENDER_WIDTH, RENDER_HEIGHT);
    ctx.scale(SCALE, SCALE);

    // Update paddle
    const { paddle, keys, touchX } = state;
    if (touchX !== null) {
      paddle.x = touchX - paddle.width / 2;
    } else if (keys.left) {
      paddle.x -= paddle.speed;
    } else if (keys.right) {
      paddle.x += paddle.speed;
    }

    paddle.x = Math.max(0, Math.min(CANVAS_WIDTH - paddle.width, paddle.x));

    // Update balls
    const lostBalls: number[] = [];
    state.balls.forEach((ball, index) => {
      if (!ball.launched) {
        ball.x = paddle.x + paddle.width / 2;
        ball.y = paddle.y - 10;
      } else {
        ball.x += ball.velocityX;
        ball.y += ball.velocityY;
        if (checkBallCollision(ball)) {
          lostBalls.push(index);
        }
      }
    });

    // Remove lost balls
    lostBalls.reverse().forEach(index => {
      state.balls.splice(index, 1);
    });

    // Check if all balls lost
    if (state.balls.length === 0) {
      state.lives--;
      setDisplayLives(state.lives);
      state.combo = 0;
      setDisplayCombo(0);

      if (state.lives <= 0) {
        state.gameOver = true;
        state.isRunning = false;
        setGameOver(true);

        if (state.score > state.bestScore) {
          state.bestScore = state.score;
          setDisplayBest(state.score);
          localStorage.setItem("pb-breakout", state.score.toString());
        }
      } else {
        // Reset ball
        const config = LEVEL_CONFIGS[Math.min(state.level - 1, LEVEL_CONFIGS.length - 1)];
        state.balls.push({
          x: paddle.x + paddle.width / 2,
          y: paddle.y - 10,
          radius: 6,
          velocityX: config.ballSpeed,
          velocityY: -config.ballSpeed,
          launched: false,
        });
      }
    }

    // Update power-ups
    state.powerUps = state.powerUps.filter(powerUp => {
      if (!powerUp.active) return false;

      powerUp.y += POWERUP_FALL_SPEED;

      // Check collision with paddle
      if (
        powerUp.x >= paddle.x - 8 &&
        powerUp.x <= paddle.x + paddle.width + 8 &&
        powerUp.y >= paddle.y - 8 &&
        powerUp.y <= paddle.y + paddle.height + 8
      ) {
        activatePowerUp(powerUp.type);
        return false;
      }

      return powerUp.y < CANVAS_HEIGHT;
    });

    // Update lasers
    if (state.activePowerUps.laser) {
      state.lasers.forEach(laser => {
        laser.y -= LASER_SPEED;
      });

      state.lasers = state.lasers.filter(laser => {
        if (laser.y < 0) return false;
        return !checkLaserCollision(laser);
      });
    } else {
      state.lasers = [];
    }

    // Check level complete
    const remainingBricks = state.bricks.filter(b => b.visible).length;
    if (remainingBricks === 0) {
      // Advance level
      if (state.level < 10) {
        state.level++;
        setDisplayLevel(state.level);
        setLevelUpFlash(120); // 2 seconds at 60fps
      } else {
        // Endless mode after level 10
        state.level++;
        setDisplayLevel(state.level);
        setLevelUpFlash(120);
      }

      const config = LEVEL_CONFIGS[Math.min(state.level - 1, LEVEL_CONFIGS.length - 1)];
      state.bricks = createBricks(state.level);
      state.balls = [{
        x: paddle.x + paddle.width / 2,
        y: paddle.y - 10,
        radius: 6,
        velocityX: config.ballSpeed,
        velocityY: -config.ballSpeed,
        launched: false,
      }];
      state.combo = 0;
      setDisplayCombo(0);
    }

    // Draw everything
    state.bricks.forEach(brick => drawBrick(ctx, brick));
    drawPaddle(ctx);
    state.balls.forEach(ball => drawBall(ctx, ball));
    state.powerUps.forEach(powerUp => drawPowerUp(ctx, powerUp));
    state.lasers.forEach(laser => drawLaser(ctx, laser));

    // Draw UI
    ctx.fillStyle = "#f1f5f9";
    ctx.font = "20px monospace";
    ctx.textAlign = "left";
    ctx.fillText(`Score: ${state.score}`, 20, 35);
    ctx.fillText(`Lives: ${state.lives}`, 280, 35);
    ctx.fillText(`Level: ${state.level}`, 500, 35);

    if (state.combo > 1) {
      ctx.fillStyle = "#eab308";
      ctx.font = "bold 16px monospace";
      ctx.fillText(`x${state.combo} Combo!`, 650, 35);
    }

    // Launch hint
    if (state.balls.length > 0 && !state.balls[0].launched) {
      ctx.font = "16px monospace";
      ctx.textAlign = "center";
      ctx.fillStyle = "#94a3b8";
      ctx.fillText("Press SPACE or tap to launch", CANVAS_WIDTH / 2, CANVAS_HEIGHT - 30);
    }

    // Level-up flash
    if (levelUpFlash > 0) {
      setLevelUpFlash(levelUpFlash - 1);
      const alpha = Math.min(1, levelUpFlash / 40);
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.font = "bold 48px monospace";
      ctx.textAlign = "center";
      ctx.fillStyle = "#22c55e";
      const config = LEVEL_CONFIGS[Math.min(state.level - 1, LEVEL_CONFIGS.length - 1)];
      ctx.fillText(`LEVEL ${state.level}`, 400, 280);
      ctx.font = "20px monospace";
      ctx.fillStyle = "#86efac";
      ctx.fillText(config.name, 400, 320);
      ctx.restore();
    }

    rafRef.current = requestAnimationFrame(gameLoop);
  }, [levelUpFlash]);

  const launchBall = () => {
    const state = gameStateRef.current;
    if (state.isRunning) {
      state.balls.forEach(ball => {
        if (!ball.launched) {
          ball.launched = true;
        }
      });
    }
  };

  const shootLaser = () => {
    const state = gameStateRef.current;
    if (state.isRunning && state.activePowerUps.laser) {
      const { paddle } = state;
      state.lasers.push(
        { x: paddle.x - 3, y: paddle.y },
        { x: paddle.x + paddle.width + 1, y: paddle.y }
      );
    }
  };

  const startGame = () => {
    const state = gameStateRef.current;
    const config = LEVEL_CONFIGS[0];

    state.isRunning = true;
    state.gameOver = false;
    state.score = 0;
    state.lives = 3;
    state.level = 1;
    state.combo = 0;
    state.maxCombo = 0;
    state.paddle.x = 350;
    state.paddle.width = state.paddle.baseWidth;
    state.balls = [{
      x: 400,
      y: 500,
      radius: 6,
      velocityX: config.ballSpeed,
      velocityY: -config.ballSpeed,
      launched: false,
    }];
    state.bricks = createBricks(1);
    state.powerUps = [];
    state.lasers = [];
    state.activePowerUps = { wide: false, laser: false, slow: false };

    setDisplayScore(0);
    setDisplayLives(3);
    setDisplayLevel(1);
    setDisplayCombo(0);
    setGameOver(false);
    setStarted(true);
    setLevelUpFlash(0);

    rafRef.current = requestAnimationFrame(gameLoop);
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    const state = gameStateRef.current;

    if (!state.isRunning && !state.gameOver) {
      if (e.code === "Space" || e.code === "Enter") {
        e.preventDefault();
        startGame();
      }
      return;
    }

    if (!state.isRunning) return;

    if (e.code === "ArrowLeft" || e.code === "KeyA") {
      e.preventDefault();
      state.keys.left = true;
    } else if (e.code === "ArrowRight" || e.code === "KeyD") {
      e.preventDefault();
      state.keys.right = true;
    } else if (e.code === "Space") {
      e.preventDefault();
      launchBall();
      shootLaser();
    }
  };

  const handleKeyUp = (e: KeyboardEvent) => {
    const state = gameStateRef.current;
    if (e.code === "ArrowLeft" || e.code === "KeyA") {
      e.preventDefault();
      state.keys.left = false;
    } else if (e.code === "ArrowRight" || e.code === "KeyD") {
      e.preventDefault();
      state.keys.right = false;
    }
  };

  const handleCanvasClick = () => {
    const state = gameStateRef.current;
    if (!state.isRunning && !state.gameOver) {
      startGame();
    } else if (state.isRunning) {
      launchBall();
      shootLaser();
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const onTouchStart = (e: TouchEvent) => {
      e.preventDefault();
      const state = gameStateRef.current;

      if (!state.isRunning && !state.gameOver) {
        startGame();
        return;
      }

      if (!state.isRunning) return;

      const rect = canvas.getBoundingClientRect();
      const touch = e.touches[0];
      const x = ((touch.clientX - rect.left) / rect.width) * CANVAS_WIDTH;
      state.touchX = x;

      launchBall();
      shootLaser();
    };

    const onTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      const state = gameStateRef.current;
      if (!state.isRunning) return;

      const rect = canvas.getBoundingClientRect();
      const touch = e.touches[0];
      const x = ((touch.clientX - rect.left) / rect.width) * CANVAS_WIDTH;
      state.touchX = x;
    };

    const onTouchEnd = (e: TouchEvent) => {
      e.preventDefault();
      const state = gameStateRef.current;
      state.touchX = null;
    };

    canvas.addEventListener("touchstart", onTouchStart, { passive: false });
    canvas.addEventListener("touchmove", onTouchMove, { passive: false });
    canvas.addEventListener("touchend", onTouchEnd, { passive: false });

    return () => {
      canvas.removeEventListener("touchstart", onTouchStart);
      canvas.removeEventListener("touchmove", onTouchMove);
      canvas.removeEventListener("touchend", onTouchEnd);
    };
  }, [gameLoop]);

  const shareScore = async () => {
    const text = `I scored ${displayScore} points and reached level ${displayLevel} in Breakout! Max combo: x${gameStateRef.current.maxCombo}. Can you beat my score? Play now: https://playmini.fun/breakout`;

    if (navigator.share) {
      try {
        await navigator.share({ text });
      } catch (err) {
        // User cancelled
      }
    } else {
      try {
        await navigator.clipboard.writeText(text);
        alert("Score copied to clipboard!");
      } catch (err) {
        alert("Failed to copy score");
      }
    }
  };

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);

      // Cleanup timers
      const state = gameStateRef.current;
      clearTimeout(state.powerUpTimers.wide);
      clearTimeout(state.powerUpTimers.laser);
      clearTimeout(state.powerUpTimers.slow);
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Score Display */}
      <div className="flex gap-6 text-lg font-mono">
        <div>
          Score: <span className="font-bold text-blue-400">{displayScore}</span>
        </div>
        <div>
          Lives: <span className="font-bold text-red-400">{displayLives}</span>
        </div>
        <div>
          Level: <span className="font-bold text-green-400">{displayLevel}</span>
        </div>
        {displayCombo > 1 && (
          <div>
            Combo: <span className="font-bold text-yellow-400">x{displayCombo}</span>
          </div>
        )}
        <div>
          Best: <span className="font-bold text-yellow-400">{displayBest}</span>
        </div>
      </div>

      {/* Canvas */}
      <div className="relative">
        <canvas
          ref={canvasRef}
          width={RENDER_WIDTH}
          height={RENDER_HEIGHT}
          className="border-2 border-gray-700 rounded-lg w-full cursor-pointer"
          onClick={handleCanvasClick}
          style={{ touchAction: "none", maxWidth: "800px" }}
        />

        {/* Start Overlay */}
        {!started && !gameOver && (
          <div
            className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-60 rounded-lg cursor-pointer"
            onClick={startGame}
            onTouchEnd={(e) => {
              e.preventDefault();
              startGame();
            }}
          >
            <div className="text-center text-white pointer-events-none">
              <p className="text-xl font-bold mb-2">Press Space or Tap to Start</p>
              <p className="text-sm text-gray-300">
                10 Levels | Power-Ups | Brick Types
              </p>
              <p className="text-xs text-gray-400 mt-2">
                ←/→ or A/D: Move Paddle | Space: Launch/Laser
              </p>
            </div>
          </div>
        )}

        {/* Game Over Overlay */}
        {gameOver && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-80 rounded-lg">
            <div className="text-center text-white">
              <p className="text-2xl font-bold mb-2">Game Over!</p>
              <p className="text-lg mb-1">Final Score: {displayScore}</p>
              <p className="text-lg mb-1">Level Reached: {displayLevel}</p>
              <p className="text-md mb-1">Max Combo: x{gameStateRef.current.maxCombo}</p>
              <p className="text-sm text-yellow-400 mb-4">Best Score: {displayBest}</p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={startGame}
                  className="px-6 py-2 bg-green-600 hover:bg-green-500 rounded-lg font-bold transition-colors"
                >
                  Play Again
                </button>
                <button
                  onClick={shareScore}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg font-bold transition-colors"
                >
                  Share
                </button>
                <DownloadButton
                  canvasRef={canvasRef}
                  filename="breakout-score"
                  label="Save"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Controls hint */}
      <div className="text-sm text-gray-400 text-center">
        <p className="font-semibold mb-1">Controls:</p>
        <p>
          Desktop: Arrow Keys or A/D to move, Space to launch/laser | Mobile: Drag paddle, Tap to launch/laser
        </p>
      </div>

      {/* Power-up Legend */}
      <div className="text-xs text-gray-500 text-center max-w-2xl">
        <p className="font-semibold mb-1">Power-Ups:</p>
        <p>
          <span className="text-purple-400">M</span> = Multi-Ball (3 balls) |
          <span className="text-blue-400"> W</span> = Wide Paddle |
          <span className="text-red-400"> L</span> = Laser Cannons |
          <span className="text-cyan-400"> S</span> = Slow Ball
        </p>
      </div>
    </div>
  );
}
