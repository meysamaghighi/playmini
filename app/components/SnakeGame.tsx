"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import DownloadButton from "./DownloadButton";

type Direction = "UP" | "DOWN" | "LEFT" | "RIGHT";
type Position = { x: number; y: number };
type PowerUpType = "speed" | "slow" | "ghost" | "double";
type PowerUp = {
  x: number;
  y: number;
  type: PowerUpType;
  active: boolean;
};
type FoodType = "normal" | "gold" | "diamond";
type Food = {
  x: number;
  y: number;
  type: FoodType;
  points: number;
};
type Obstacle = {
  x: number;
  y: number;
  moving?: boolean;
  dx?: number;
  dy?: number;
};

const GRID_SIZE = 20;
const BASE_SPEED = 140;
const POWER_UP_DURATION = 10000; // 10 seconds
const POWER_UP_SPAWN_CHANCE = 0.15; // 15% chance per food

// Level configurations
const LEVEL_CONFIGS = [
  { level: 1, name: "Garden Start", targetScore: 5, baseSpeed: 140, obstacleType: "none" },
  { level: 2, name: "Easy Slither", targetScore: 10, baseSpeed: 130, obstacleType: "none" },
  { level: 3, name: "First Challenge", targetScore: 15, baseSpeed: 120, obstacleType: "none" },
  { level: 4, name: "Wall Maze", targetScore: 25, baseSpeed: 110, obstacleType: "static" },
  { level: 5, name: "Narrow Paths", targetScore: 35, baseSpeed: 105, obstacleType: "static" },
  { level: 6, name: "Toxic Garden", targetScore: 50, baseSpeed: 100, obstacleType: "poison" },
  { level: 7, name: "Moving Walls", targetScore: 65, baseSpeed: 95, obstacleType: "moving" },
  { level: 8, name: "Speed Run", targetScore: 85, baseSpeed: 85, obstacleType: "moving" },
  { level: 9, name: "Danger Zone", targetScore: 110, baseSpeed: 80, obstacleType: "all" },
  { level: 10, name: "Final Trial", targetScore: 150, baseSpeed: 75, obstacleType: "all" },
];

export default function SnakeGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [displayState, setDisplayState] = useState<"START" | "PLAYING" | "PAUSED" | "GAME_OVER">("START");
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [lives, setLives] = useState(3);
  const [bestScore, setBestScore] = useState(0);
  const [scoreFlash, setScoreFlash] = useState(false);

  const snakeRef = useRef<Position[]>([{ x: 10, y: 10 }]);
  const directionRef = useRef<Direction>("RIGHT");
  const nextDirectionRef = useRef<Direction>("RIGHT");
  const foodRef = useRef<Food>({ x: 15, y: 10, type: "normal", points: 1 });
  const obstaclesRef = useRef<Obstacle[]>([]);
  const powerUpsRef = useRef<PowerUp[]>([]);
  const activePowerUpRef = useRef<{ type: PowerUpType; timeLeft: number } | null>(null);
  const speedRef = useRef(BASE_SPEED);
  const lastMoveTimeRef = useRef(0);
  const gameLoopRef = useRef<number | null>(null);
  const scoreRef = useRef(0);
  const levelRef = useRef(1);
  const livesRef = useRef(3);
  const bestScoreRef = useRef(0);
  const gameStateRef = useRef<"START" | "PLAYING" | "PAUSED" | "GAME_OVER">("START");
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const levelUpFlashRef = useRef(0);
  const pointsMultiplierRef = useRef(1);
  const invincibleFramesRef = useRef(0); // brief invincibility after losing a life

  useEffect(() => {
    const saved = localStorage.getItem("pb-snake");
    if (saved) {
      const val = parseInt(saved, 10);
      setBestScore(val);
      bestScoreRef.current = val;
    }
  }, []);

  const isValidPosition = (pos: Position, snake: Position[]): boolean => {
    // Check bounds
    if (pos.x < 0 || pos.x >= GRID_SIZE || pos.y < 0 || pos.y >= GRID_SIZE) return false;
    // Check snake body
    if (snake.some((s) => s.x === pos.x && s.y === pos.y)) return false;
    // Check obstacles (unless ghost mode)
    if (!activePowerUpRef.current || activePowerUpRef.current.type !== "ghost") {
      if (obstaclesRef.current.some((o) => o.x === pos.x && o.y === pos.y)) return false;
    }
    return true;
  };

  const generateFood = (snake: Position[]): Food => {
    let newFood: Position;
    let attempts = 0;
    do {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      };
      attempts++;
    } while (
      (snake.some((s) => s.x === newFood.x && s.y === newFood.y) ||
        obstaclesRef.current.some((o) => o.x === newFood.x && o.y === newFood.y)) &&
      attempts < 100
    );

    // Food types: 80% normal (green), 15% gold (3 points), 5% diamond (5 points)
    const rand = Math.random();
    let type: FoodType = "normal";
    let points = 1;
    if (rand < 0.05) {
      type = "diamond";
      points = 5;
    } else if (rand < 0.20) {
      type = "gold";
      points = 3;
    }

    return { x: newFood.x, y: newFood.y, type, points };
  };

  const generateObstacles = (level: number) => {
    const config = LEVEL_CONFIGS[Math.min(level - 1, 9)];
    const obstacles: Obstacle[] = [];

    if (config.obstacleType === "none") return obstacles;

    const snake = snakeRef.current;

    if (config.obstacleType === "static" || config.obstacleType === "all") {
      // Create wall patterns based on level
      if (level === 4) {
        // Simple cross pattern
        for (let i = 5; i < 15; i++) {
          if (i !== 10) {
            obstacles.push({ x: 10, y: i });
            obstacles.push({ x: i, y: 10 });
          }
        }
      } else if (level === 5 || level >= 9) {
        // Corner blocks
        for (let i = 3; i < 7; i++) {
          for (let j = 3; j < 7; j++) {
            obstacles.push({ x: i, y: j });
            obstacles.push({ x: GRID_SIZE - 1 - i, y: j });
            obstacles.push({ x: i, y: GRID_SIZE - 1 - j });
            obstacles.push({ x: GRID_SIZE - 1 - i, y: GRID_SIZE - 1 - j });
          }
        }
      }
    }

    if (config.obstacleType === "moving" || config.obstacleType === "all") {
      // Add 3-5 moving obstacles
      const count = level >= 9 ? 5 : 3;
      for (let i = 0; i < count; i++) {
        let pos: Position;
        let attempts = 0;
        do {
          pos = {
            x: Math.floor(Math.random() * GRID_SIZE),
            y: Math.floor(Math.random() * GRID_SIZE),
          };
          attempts++;
        } while (
          (snake.some((s) => s.x === pos.x && s.y === pos.y) ||
            obstacles.some((o) => o.x === pos.x && o.y === pos.y)) &&
          attempts < 50
        );
        obstacles.push({
          x: pos.x,
          y: pos.y,
          moving: true,
          dx: Math.random() < 0.5 ? 1 : -1,
          dy: Math.random() < 0.5 ? 1 : -1,
        });
      }
    }

    return obstacles;
  };

  const spawnPowerUp = () => {
    if (Math.random() > POWER_UP_SPAWN_CHANCE) return;

    const snake = snakeRef.current;
    let pos: Position;
    let attempts = 0;
    do {
      pos = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      };
      attempts++;
    } while (
      (snake.some((s) => s.x === pos.x && s.y === pos.y) ||
        obstaclesRef.current.some((o) => o.x === pos.x && o.y === pos.y) ||
        powerUpsRef.current.some((p) => p.x === pos.x && p.y === pos.y)) &&
      attempts < 50
    );

    const types: PowerUpType[] = ["speed", "slow", "ghost", "double"];
    const type = types[Math.floor(Math.random() * types.length)];

    powerUpsRef.current.push({ x: pos.x, y: pos.y, type, active: true });
  };

  const activatePowerUp = (type: PowerUpType) => {
    activePowerUpRef.current = { type, timeLeft: POWER_UP_DURATION };
    if (type === "double") {
      pointsMultiplierRef.current = 2;
    }
  };

  const draw = useCallback((timestamp?: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const cell = canvas.width / GRID_SIZE;
    const t = timestamp || 0;

    // Background - checkerboard pattern
    for (let x = 0; x < GRID_SIZE; x++) {
      for (let y = 0; y < GRID_SIZE; y++) {
        ctx.fillStyle = (x + y) % 2 === 0 ? "#0f172a" : "#111d30";
        ctx.fillRect(x * cell, y * cell, cell, cell);
      }
    }

    // Obstacles
    obstaclesRef.current.forEach((obs) => {
      const ox = obs.x * cell;
      const oy = obs.y * cell;

      if (obs.moving) {
        // Moving obstacles - red pulsing
        const pulse = 0.8 + 0.2 * Math.sin(t * 0.005);
        ctx.globalAlpha = pulse;
        ctx.fillStyle = "#dc2626";
        ctx.beginPath();
        ctx.arc(ox + cell / 2, oy + cell / 2, cell / 2 - 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
        // Inner glow
        ctx.fillStyle = "#fca5a5";
        ctx.beginPath();
        ctx.arc(ox + cell / 2, oy + cell / 2, cell / 3, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Static walls - gray brick
        ctx.fillStyle = "#475569";
        ctx.fillRect(ox + 1, oy + 1, cell - 2, cell - 2);
        ctx.fillStyle = "#1e293b";
        ctx.fillRect(ox + 2, oy + 2, cell - 4, 1);
        ctx.fillRect(ox + 2, oy + cell / 2, cell - 4, 1);
      }
    });

    // Power-ups with pulsing effect
    powerUpsRef.current.forEach((powerUp) => {
      if (!powerUp.active) return;
      const px = powerUp.x * cell + cell / 2;
      const py = powerUp.y * cell + cell / 2;
      const pulse = 1 + 0.3 * Math.sin(t * 0.008);

      ctx.save();
      ctx.translate(px, py);
      ctx.scale(pulse, pulse);

      // Draw star shape
      let color = "#3b82f6"; // speed (blue)
      let icon = "⚡";
      if (powerUp.type === "slow") {
        color = "#8b5cf6"; // slow (purple)
        icon = "🐌";
      } else if (powerUp.type === "ghost") {
        color = "#a78bfa"; // ghost (light purple)
        icon = "👻";
      } else if (powerUp.type === "double") {
        color = "#fbbf24"; // double (gold)
        icon = "2×";
      }

      ctx.fillStyle = color;
      ctx.beginPath();
      for (let i = 0; i < 5; i++) {
        const angle = (i * 4 * Math.PI) / 5 - Math.PI / 2;
        const r = i % 2 === 0 ? 10 : 5;
        ctx.lineTo(r * Math.cos(angle), r * Math.sin(angle));
      }
      ctx.closePath();
      ctx.fill();

      // Icon
      ctx.fillStyle = "#fff";
      ctx.font = "bold 10px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(icon, 0, 0);

      ctx.restore();
    });

    // Food with different colors and pulsing glow
    const f = foodRef.current;
    const fx = f.x * cell + cell / 2;
    const fy = f.y * cell + cell / 2;
    const pulse = 1 + 0.15 * Math.sin(t * 0.005);
    const glowR = cell * 0.8 * pulse;

    let foodColor = "#ef4444"; // normal (red)
    let glowColor = "rgba(239, 68, 68, 0.4)";
    if (f.type === "gold") {
      foodColor = "#fbbf24";
      glowColor = "rgba(251, 191, 36, 0.5)";
    } else if (f.type === "diamond") {
      foodColor = "#06b6d4";
      glowColor = "rgba(6, 182, 212, 0.6)";
    }

    // Glow
    const glow = ctx.createRadialGradient(fx, fy, 0, fx, fy, glowR);
    glow.addColorStop(0, glowColor);
    glow.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(fx, fy, glowR, 0, Math.PI * 2);
    ctx.fill();

    // Food body
    if (f.type === "diamond") {
      // Diamond shape
      ctx.fillStyle = foodColor;
      ctx.beginPath();
      ctx.moveTo(fx, fy - cell / 3);
      ctx.lineTo(fx + cell / 3, fy);
      ctx.lineTo(fx, fy + cell / 3);
      ctx.lineTo(fx - cell / 3, fy);
      ctx.closePath();
      ctx.fill();
      // Inner sparkle
      ctx.fillStyle = "#e0f2fe";
      ctx.beginPath();
      ctx.moveTo(fx, fy - cell / 6);
      ctx.lineTo(fx + cell / 6, fy);
      ctx.lineTo(fx, fy + cell / 6);
      ctx.lineTo(fx - cell / 6, fy);
      ctx.closePath();
      ctx.fill();
    } else if (f.type === "gold") {
      // Gold coin
      ctx.fillStyle = foodColor;
      ctx.beginPath();
      ctx.arc(fx, fy, cell / 2 - 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#f59e0b";
      ctx.lineWidth = 2;
      ctx.stroke();
      // $ symbol
      ctx.fillStyle = "#92400e";
      ctx.font = "bold 12px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("$", fx, fy);
    } else {
      // Apple (normal)
      ctx.fillStyle = foodColor;
      ctx.beginPath();
      ctx.arc(fx, fy + 1, cell / 2 - 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#c53030";
      ctx.beginPath();
      ctx.arc(fx + 2, fy + 2, cell / 2 - 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = foodColor;
      ctx.beginPath();
      ctx.arc(fx - 1, fy, cell / 2 - 4, 0, Math.PI * 2);
      ctx.fill();
      // Highlight
      ctx.fillStyle = "rgba(255,255,255,0.35)";
      ctx.beginPath();
      ctx.arc(fx - 3, fy - 3, cell / 6, 0, Math.PI * 2);
      ctx.fill();
    }

    // Snake body with gradient
    const snake = snakeRef.current;
    const len = snake.length;

    // Draw body connections
    for (let i = 0; i < len - 1; i++) {
      const curr = snake[i];
      const next = snake[i + 1];
      const progress = i / Math.max(len - 1, 1);
      const r = Math.round(34 - progress * 12);
      const g = Math.round(197 - progress * 60);
      const b = Math.round(94 - progress * 30);
      ctx.fillStyle = `rgb(${r},${g},${b})`;

      const cx = curr.x * cell + cell / 2;
      const cy = curr.y * cell + cell / 2;
      const nx = next.x * cell + cell / 2;
      const ny = next.y * cell + cell / 2;
      const bodyW = cell - 6;

      if (curr.x !== next.x) {
        const minX = Math.min(cx, nx);
        ctx.fillRect(minX, cy - bodyW / 2, Math.abs(cx - nx), bodyW);
      } else {
        const minY = Math.min(cy, ny);
        ctx.fillRect(cx - bodyW / 2, minY, bodyW, Math.abs(cy - ny));
      }
    }

    // Draw circles for each segment
    for (let i = len - 1; i >= 0; i--) {
      const seg = snake[i];
      const progress = i / Math.max(len - 1, 1);
      const r = Math.round(34 - progress * 12);
      const g = Math.round(197 - progress * 60);
      const b = Math.round(94 - progress * 30);
      const segR = (cell - 6) / 2;
      const sx = seg.x * cell + cell / 2;
      const sy = seg.y * cell + cell / 2;

      // Ghost mode effect
      if (activePowerUpRef.current?.type === "ghost") {
        ctx.globalAlpha = 0.5;
      }

      ctx.fillStyle = `rgb(${r},${g},${b})`;
      ctx.beginPath();
      ctx.arc(sx, sy, segR, 0, Math.PI * 2);
      ctx.fill();

      ctx.globalAlpha = 1;
    }

    // Head with eyes
    if (len > 0) {
      const head = snake[0];
      const hx = head.x * cell + cell / 2;
      const hy = head.y * cell + cell / 2;
      const dir = directionRef.current;

      // Invincibility glow
      if (invincibleFramesRef.current > 0) {
        const glowPulse = Math.sin(t * 0.02) * 0.5 + 0.5;
        ctx.strokeStyle = `rgba(251, 191, 36, ${glowPulse})`;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(hx, hy, cell / 2 + 5, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Eye positions based on direction
      let e1x = 0,
        e1y = 0,
        e2x = 0,
        e2y = 0;
      const eyeOff = cell * 0.18;
      const eyeFwd = cell * 0.12;

      switch (dir) {
        case "RIGHT":
          e1x = eyeFwd;
          e1y = -eyeOff;
          e2x = eyeFwd;
          e2y = eyeOff;
          break;
        case "LEFT":
          e1x = -eyeFwd;
          e1y = -eyeOff;
          e2x = -eyeFwd;
          e2y = eyeOff;
          break;
        case "UP":
          e1x = -eyeOff;
          e1y = -eyeFwd;
          e2x = eyeOff;
          e2y = -eyeFwd;
          break;
        case "DOWN":
          e1x = -eyeOff;
          e1y = eyeFwd;
          e2x = eyeOff;
          e2y = eyeFwd;
          break;
      }

      // Eye whites
      ctx.fillStyle = "white";
      ctx.beginPath();
      ctx.arc(hx + e1x, hy + e1y, cell * 0.12, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(hx + e2x, hy + e2y, cell * 0.12, 0, Math.PI * 2);
      ctx.fill();

      // Pupils
      ctx.fillStyle = "#111";
      ctx.beginPath();
      ctx.arc(hx + e1x, hy + e1y, cell * 0.06, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(hx + e2x, hy + e2y, cell * 0.06, 0, Math.PI * 2);
      ctx.fill();
    }

    // Active power-up indicator (top-right)
    if (activePowerUpRef.current && gameStateRef.current === "PLAYING") {
      const pw = 90,
        ph = 30;
      const px = canvas.width - pw - 10,
        py = 10;
      ctx.fillStyle = "rgba(0,0,0,0.7)";
      ctx.fillRect(px, py, pw, ph);

      let icon = "⚡";
      let color = "#3b82f6";
      if (activePowerUpRef.current.type === "slow") {
        icon = "🐌";
        color = "#8b5cf6";
      } else if (activePowerUpRef.current.type === "ghost") {
        icon = "👻";
        color = "#a78bfa";
      } else if (activePowerUpRef.current.type === "double") {
        icon = "2×";
        color = "#fbbf24";
      }

      ctx.font = "18px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(icon, px + 20, py + ph / 2);

      // Timer bar
      const timeBarW = 55;
      const timePct = Math.max(0, activePowerUpRef.current.timeLeft / POWER_UP_DURATION);
      ctx.fillStyle = "#374151";
      ctx.fillRect(px + 30, py + 10, timeBarW, 10);
      ctx.fillStyle = color;
      ctx.fillRect(px + 30, py + 10, timeBarW * timePct, 10);
    }

    // Level-up flash notification
    if (levelUpFlashRef.current > 0) {
      levelUpFlashRef.current--;
      const alpha = Math.min(1, levelUpFlashRef.current / 40);
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.font = "bold 32px monospace";
      ctx.textAlign = "center";
      ctx.fillStyle = "#22c55e";
      const config = LEVEL_CONFIGS[Math.min(levelRef.current - 1, 9)];
      ctx.fillText(`LEVEL ${levelRef.current}`, canvas.width / 2, canvas.height / 2 - 10);
      ctx.font = "16px monospace";
      ctx.fillStyle = "#86efac";
      if (levelRef.current <= 10) {
        ctx.fillText(config.name, canvas.width / 2, canvas.height / 2 + 20);
      } else {
        ctx.fillText("Endless Mode!", canvas.width / 2, canvas.height / 2 + 20);
      }
      ctx.restore();
    }
  }, []);

  const gameLoop = useCallback(
    (timestamp: number) => {
      if (gameStateRef.current !== "PLAYING") {
        gameLoopRef.current = null;
        return;
      }

      // Update invincibility frames
      if (invincibleFramesRef.current > 0) {
        invincibleFramesRef.current--;
      }

      // Update active power-up timer
      if (activePowerUpRef.current) {
        activePowerUpRef.current.timeLeft -= 16; // ~16ms per frame at 60fps
        if (activePowerUpRef.current.timeLeft <= 0) {
          if (activePowerUpRef.current.type === "double") {
            pointsMultiplierRef.current = 1;
          }
          activePowerUpRef.current = null;
        }
      }

      // Calculate speed based on power-ups
      let currentSpeed = speedRef.current;
      if (activePowerUpRef.current?.type === "speed") {
        currentSpeed = currentSpeed * 0.6; // faster (lower delay)
      } else if (activePowerUpRef.current?.type === "slow") {
        currentSpeed = currentSpeed * 1.5; // slower (higher delay)
      }

      // Update moving obstacles (every 8 frames)
      if (Math.floor(timestamp / 100) % 8 === 0) {
        obstaclesRef.current = obstaclesRef.current.map((obs) => {
          if (!obs.moving) return obs;

          let newX = obs.x + (obs.dx || 0);
          let newY = obs.y + (obs.dy || 0);
          let newDx = obs.dx;
          let newDy = obs.dy;

          // Bounce off walls
          if (newX < 0 || newX >= GRID_SIZE) {
            newDx = -(obs.dx || 0);
            newX = obs.x;
          }
          if (newY < 0 || newY >= GRID_SIZE) {
            newDy = -(obs.dy || 0);
            newY = obs.y;
          }

          return { ...obs, x: newX, y: newY, dx: newDx, dy: newDy };
        });
      }

      if (timestamp - lastMoveTimeRef.current < currentSpeed) {
        draw(timestamp);
        gameLoopRef.current = requestAnimationFrame(gameLoop);
        return;
      }
      lastMoveTimeRef.current = timestamp;

      directionRef.current = nextDirectionRef.current;
      const snake = snakeRef.current;
      const head = snake[0];

      let newHead: Position;
      switch (directionRef.current) {
        case "UP":
          newHead = { x: head.x, y: head.y - 1 };
          break;
        case "DOWN":
          newHead = { x: head.x, y: head.y + 1 };
          break;
        case "LEFT":
          newHead = { x: head.x - 1, y: head.y };
          break;
        case "RIGHT":
          newHead = { x: head.x + 1, y: head.y };
          break;
      }

      // Check collision (walls, self, obstacles) - unless invincible or ghost mode
      const isGhost = activePowerUpRef.current?.type === "ghost";
      const isInvincible = invincibleFramesRef.current > 0;

      if (!isInvincible && !isGhost) {
        // Wall collision
        if (newHead.x < 0 || newHead.x >= GRID_SIZE || newHead.y < 0 || newHead.y >= GRID_SIZE) {
          livesRef.current--;
          setLives(livesRef.current);
          if (livesRef.current <= 0) {
            gameStateRef.current = "GAME_OVER";
            setDisplayState("GAME_OVER");
            gameLoopRef.current = null;
            draw(timestamp);
            return;
          } else {
            // Lost a life, respawn in center
            snakeRef.current = [{ x: 10, y: 10 }];
            directionRef.current = "RIGHT";
            nextDirectionRef.current = "RIGHT";
            invincibleFramesRef.current = 120; // 2 seconds at 60fps
            draw(timestamp);
            gameLoopRef.current = requestAnimationFrame(gameLoop);
            return;
          }
        }

        // Self collision
        if (snake.some((s) => s.x === newHead.x && s.y === newHead.y)) {
          livesRef.current--;
          setLives(livesRef.current);
          if (livesRef.current <= 0) {
            gameStateRef.current = "GAME_OVER";
            setDisplayState("GAME_OVER");
            gameLoopRef.current = null;
            draw(timestamp);
            return;
          } else {
            snakeRef.current = [{ x: 10, y: 10 }];
            directionRef.current = "RIGHT";
            nextDirectionRef.current = "RIGHT";
            invincibleFramesRef.current = 120;
            draw(timestamp);
            gameLoopRef.current = requestAnimationFrame(gameLoop);
            return;
          }
        }

        // Obstacle collision
        if (obstaclesRef.current.some((o) => o.x === newHead.x && o.y === newHead.y)) {
          livesRef.current--;
          setLives(livesRef.current);
          if (livesRef.current <= 0) {
            gameStateRef.current = "GAME_OVER";
            setDisplayState("GAME_OVER");
            gameLoopRef.current = null;
            draw(timestamp);
            return;
          } else {
            snakeRef.current = [{ x: 10, y: 10 }];
            directionRef.current = "RIGHT";
            nextDirectionRef.current = "RIGHT";
            invincibleFramesRef.current = 120;
            draw(timestamp);
            gameLoopRef.current = requestAnimationFrame(gameLoop);
            return;
          }
        }
      } else if (!isGhost) {
        // Invincible but not ghost - wrap around walls
        if (newHead.x < 0) newHead.x = GRID_SIZE - 1;
        if (newHead.x >= GRID_SIZE) newHead.x = 0;
        if (newHead.y < 0) newHead.y = GRID_SIZE - 1;
        if (newHead.y >= GRID_SIZE) newHead.y = 0;
      } else {
        // Ghost mode - wrap around walls
        if (newHead.x < 0) newHead.x = GRID_SIZE - 1;
        if (newHead.x >= GRID_SIZE) newHead.x = 0;
        if (newHead.y < 0) newHead.y = GRID_SIZE - 1;
        if (newHead.y >= GRID_SIZE) newHead.y = 0;
      }

      const newSnake = [newHead, ...snake];

      // Check food collision
      if (newHead.x === foodRef.current.x && newHead.y === foodRef.current.y) {
        snakeRef.current = newSnake;
        const points = foodRef.current.points * pointsMultiplierRef.current;
        scoreRef.current += points;
        setScore(scoreRef.current);
        setScoreFlash(true);
        setTimeout(() => setScoreFlash(false), 300);

        // Update high score
        if (scoreRef.current > bestScoreRef.current) {
          bestScoreRef.current = scoreRef.current;
          setBestScore(scoreRef.current);
          localStorage.setItem("pb-snake", scoreRef.current.toString());
        }

        // Check level completion
        const config = LEVEL_CONFIGS[Math.min(levelRef.current - 1, 9)];
        if (scoreRef.current >= config.targetScore && levelRef.current < 10) {
          levelRef.current++;
          setLevel(levelRef.current);
          levelUpFlashRef.current = 120;
          const newConfig = LEVEL_CONFIGS[levelRef.current - 1];
          speedRef.current = newConfig.baseSpeed;
          obstaclesRef.current = generateObstacles(levelRef.current);
          powerUpsRef.current = [];
          activePowerUpRef.current = null;
          pointsMultiplierRef.current = 1;
        } else if (levelRef.current === 10 && scoreRef.current >= config.targetScore) {
          // Enter endless mode
          levelRef.current++;
          setLevel(levelRef.current);
          levelUpFlashRef.current = 120;
          speedRef.current = Math.max(50, speedRef.current - 5); // keep getting faster
        } else if (levelRef.current > 10) {
          // Endless mode - gradually increase speed
          speedRef.current = Math.max(40, speedRef.current - 0.5);
        }

        foodRef.current = generateFood(newSnake);
        spawnPowerUp();
      } else {
        newSnake.pop();
        snakeRef.current = newSnake;
      }

      // Check power-up collision
      powerUpsRef.current.forEach((powerUp) => {
        if (
          powerUp.active &&
          powerUp.x === newHead.x &&
          powerUp.y === newHead.y
        ) {
          powerUp.active = false;
          activatePowerUp(powerUp.type);
        }
      });

      // Remove collected power-ups
      powerUpsRef.current = powerUpsRef.current.filter((p) => p.active);

      draw(timestamp);
      gameLoopRef.current = requestAnimationFrame(gameLoop);
    },
    [draw]
  );

  const startGame = useCallback(() => {
    snakeRef.current = [{ x: 10, y: 10 }];
    directionRef.current = "RIGHT";
    nextDirectionRef.current = "RIGHT";
    foodRef.current = generateFood([{ x: 10, y: 10 }]);
    obstaclesRef.current = generateObstacles(1);
    powerUpsRef.current = [];
    activePowerUpRef.current = null;
    pointsMultiplierRef.current = 1;
    speedRef.current = LEVEL_CONFIGS[0].baseSpeed;
    lastMoveTimeRef.current = 0;
    scoreRef.current = 0;
    levelRef.current = 1;
    livesRef.current = 3;
    invincibleFramesRef.current = 0;
    levelUpFlashRef.current = 0;
    setScore(0);
    setLevel(1);
    setLives(3);
    gameStateRef.current = "PLAYING";
    setDisplayState("PLAYING");
    draw(0);
    gameLoopRef.current = requestAnimationFrame(gameLoop);
  }, [draw, gameLoop]);

  const togglePause = useCallback(() => {
    if (gameStateRef.current === "PLAYING") {
      gameStateRef.current = "PAUSED";
      setDisplayState("PAUSED");
    } else if (gameStateRef.current === "PAUSED") {
      gameStateRef.current = "PLAYING";
      setDisplayState("PLAYING");
      lastMoveTimeRef.current = performance.now();
      gameLoopRef.current = requestAnimationFrame(gameLoop);
    }
  }, [gameLoop]);

  // Keyboard
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === " " || e.key === "Spacebar") {
        e.preventDefault();
        if (
          gameStateRef.current === "PLAYING" ||
          gameStateRef.current === "PAUSED"
        ) {
          togglePause();
        }
        return;
      }

      if (gameStateRef.current !== "PLAYING") return;
      const cur = directionRef.current;

      if (
        (e.key === "ArrowUp" || e.key === "w" || e.key === "W") &&
        cur !== "DOWN"
      ) {
        e.preventDefault();
        nextDirectionRef.current = "UP";
      } else if (
        (e.key === "ArrowDown" || e.key === "s" || e.key === "S") &&
        cur !== "UP"
      ) {
        e.preventDefault();
        nextDirectionRef.current = "DOWN";
      } else if (
        (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") &&
        cur !== "RIGHT"
      ) {
        e.preventDefault();
        nextDirectionRef.current = "LEFT";
      } else if (
        (e.key === "ArrowRight" || e.key === "d" || e.key === "D") &&
        cur !== "LEFT"
      ) {
        e.preventDefault();
        nextDirectionRef.current = "RIGHT";
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [togglePause]);

  // Touch controls
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const handleTouchStart = (e: TouchEvent) => {
      if (gameStateRef.current !== "PLAYING") return;
      e.preventDefault();
      touchStartRef.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
      };
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (gameStateRef.current === "PLAYING") e.preventDefault();
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (!touchStartRef.current || gameStateRef.current !== "PLAYING") return;
      const dx = e.changedTouches[0].clientX - touchStartRef.current.x;
      const dy = e.changedTouches[0].clientY - touchStartRef.current.y;
      if (Math.abs(dx) < 20 && Math.abs(dy) < 20) return;
      const cur = directionRef.current;
      if (Math.abs(dx) > Math.abs(dy)) {
        if (dx > 0 && cur !== "LEFT") nextDirectionRef.current = "RIGHT";
        else if (dx < 0 && cur !== "RIGHT") nextDirectionRef.current = "LEFT";
      } else {
        if (dy > 0 && cur !== "UP") nextDirectionRef.current = "DOWN";
        else if (dy < 0 && cur !== "DOWN") nextDirectionRef.current = "UP";
      }
      touchStartRef.current = null;
    };

    el.addEventListener("touchstart", handleTouchStart, { passive: false });
    el.addEventListener("touchmove", handleTouchMove, { passive: false });
    el.addEventListener("touchend", handleTouchEnd);
    return () => {
      el.removeEventListener("touchstart", handleTouchStart);
      el.removeEventListener("touchmove", handleTouchMove);
      el.removeEventListener("touchend", handleTouchEnd);
    };
  }, []);

  useEffect(() => {
    draw(0);
  }, [draw]);

  useEffect(() => {
    return () => {
      if (gameLoopRef.current !== null) cancelAnimationFrame(gameLoopRef.current);
    };
  }, []);

  const handleShare = async () => {
    const levelText = levelRef.current <= 10 ? `reached level ${levelRef.current}` : "conquered all 10 levels";
    const text = `I scored ${scoreRef.current} and ${levelText} in Snake! Can you beat me? https://playmini.fun/snake`;
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
    <div
      ref={containerRef}
      className="flex flex-col items-center gap-4"
      style={{ touchAction: "none" }}
    >
      {/* Score & Stats */}
      <div className="flex gap-6 text-center">
        <div>
          <div className="text-xs text-gray-500 uppercase tracking-wider">Level</div>
          <div className="text-3xl font-black text-purple-400 tabular-nums">
            {level <= 10 ? level : "∞"}
          </div>
        </div>
        <div>
          <div className="text-xs text-gray-500 uppercase tracking-wider">Score</div>
          <div
            className={`text-3xl font-black tabular-nums transition-all duration-150 ${
              scoreFlash ? "text-yellow-400 scale-125" : "text-green-400"
            }`}
          >
            {score}
          </div>
        </div>
        <div>
          <div className="text-xs text-gray-500 uppercase tracking-wider">Best</div>
          <div className="text-3xl font-black text-amber-400 tabular-nums">
            {bestScore}
          </div>
        </div>
        <div>
          <div className="text-xs text-gray-500 uppercase tracking-wider">Lives</div>
          <div className="text-2xl">
            {Array.from({ length: 3 }).map((_, i) => (
              <span key={i}>{i < lives ? "❤️" : "🖤"}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Canvas */}
      <div className="relative">
        <canvas
          ref={canvasRef}
          width={400}
          height={400}
          className="rounded-2xl max-w-full h-auto border border-gray-800"
          style={{ touchAction: "none" }}
        />

        {displayState === "START" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/85 rounded-2xl backdrop-blur-sm">
            <div className="text-6xl mb-3">🐍</div>
            <h2 className="text-3xl font-black text-green-400 mb-2">Snake</h2>
            <p className="text-gray-400 mb-2 text-sm">Arrow keys or swipe to move</p>
            <p className="text-gray-500 mb-6 text-xs">10 levels + endless mode</p>
            {bestScore > 0 && (
              <p className="text-yellow-400 mb-4 text-sm font-bold">
                High Score: {bestScore}
              </p>
            )}
            <button
              onClick={startGame}
              className="px-10 py-3 bg-green-600 hover:bg-green-500 text-white font-bold rounded-2xl transition-all hover:scale-105 active:scale-95"
            >
              Play
            </button>
          </div>
        )}

        {displayState === "PAUSED" && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-950/85 rounded-2xl backdrop-blur-sm">
            <div className="text-center">
              <h2 className="text-3xl font-black text-yellow-400 mb-2">Paused</h2>
              <p className="text-gray-400 text-sm">Press Space to resume</p>
            </div>
          </div>
        )}

        {displayState === "GAME_OVER" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/85 rounded-2xl backdrop-blur-sm">
            <h2 className="text-3xl font-black text-red-400 mb-4">Game Over</h2>
            <div className="bg-slate-900/80 rounded-xl px-6 py-3 mb-6">
              <p className="text-white text-lg font-bold">Level: {level}</p>
              <p className="text-white text-lg font-bold">Score: {score}</p>
              <p className="text-yellow-400 text-md font-bold">Best: {bestScore}</p>
              {score === bestScore && score > 0 && (
                <p className="text-green-400 text-sm mt-2">New High Score!</p>
              )}
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
              <DownloadButton
                canvasRef={canvasRef}
                filename="snake-score"
                label="Save"
              />
            </div>
          </div>
        )}
      </div>

      <div className="text-center text-xs text-gray-600 max-w-md">
        {displayState === "PLAYING" && (
          <>
            <p>Space to pause • Collect food to grow and score</p>
            <p className="mt-1 text-gray-500">
              Power-ups: ⚡ Speed Boost • 🐌 Slow Motion • 👻 Ghost Mode • 2× Double
              Points
            </p>
          </>
        )}
        {displayState === "START" && (
          <>
            <p className="text-gray-500 mt-2">Green apples = 1 pt • Gold coins = 3 pts • Diamonds = 5 pts</p>
            <p className="text-gray-500 mt-1">Watch out for walls and obstacles!</p>
          </>
        )}
      </div>
    </div>
  );
}
