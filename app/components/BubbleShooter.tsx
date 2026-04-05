"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import DownloadButton from "./DownloadButton";

type BubbleType = "normal" | "stone" | "bomb";
type Bubble = {
  x: number;
  y: number;
  color: string;
  row: number;
  col: number;
  type: BubbleType;
  stoneHealth?: number; // 2 hits needed for stone bubbles
};

type PowerUpType = "fireball" | "rainbow" | "precision";
type PowerUp = {
  x: number;
  y: number;
  type: PowerUpType;
  active: boolean;
};

const CANVAS_WIDTH = 500;
const CANVAS_HEIGHT = 600;
const BUBBLE_RADIUS = 20;
const COLORS = ["#ef4444", "#f59e0b", "#22c55e", "#3b82f6", "#a855f7", "#ec4899"];
const POWER_UP_SPAWN_CHANCE = 0.2; // 20% chance per match

// Level configurations
const LEVEL_CONFIGS = [
  { level: 1, name: "Bubble Start", rows: 5, colors: 4, dropSpeed: 0, stoneChance: 0, bombChance: 0 },
  { level: 2, name: "Easy Pop", rows: 6, colors: 4, dropSpeed: 0, stoneChance: 0, bombChance: 0 },
  { level: 3, name: "Color Rush", rows: 7, colors: 5, dropSpeed: 0, stoneChance: 0, bombChance: 0 },
  { level: 4, name: "Stone Wall", rows: 7, colors: 5, dropSpeed: 1, stoneChance: 0.1, bombChance: 0 },
  { level: 5, name: "Pop Frenzy", rows: 8, colors: 6, dropSpeed: 1, stoneChance: 0.1, bombChance: 0.05 },
  { level: 6, name: "Falling Sky", rows: 8, colors: 6, dropSpeed: 2, stoneChance: 0.15, bombChance: 0.05 },
  { level: 7, name: "Bomb Squad", rows: 9, colors: 6, dropSpeed: 2, stoneChance: 0.15, bombChance: 0.1 },
  { level: 8, name: "Speed Pop", rows: 9, colors: 6, dropSpeed: 3, stoneChance: 0.2, bombChance: 0.1 },
  { level: 9, name: "Final Push", rows: 10, colors: 6, dropSpeed: 3, stoneChance: 0.2, bombChance: 0.15 },
  { level: 10, name: "Master Shooter", rows: 10, colors: 6, dropSpeed: 4, stoneChance: 0.25, bombChance: 0.15 },
];

export default function BubbleShooter() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameState, setGameState] = useState<"start" | "playing" | "gameover">("start");
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [lives, setLives] = useState(3);
  const [bestScore, setBestScore] = useState(0);
  const [scoreFlash, setScoreFlash] = useState(false);

  const bubblesRef = useRef<Bubble[]>([]);
  const shooterRef = useRef({ x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT - 60, angle: -Math.PI / 2 });
  const currentBubbleRef = useRef({ color: COLORS[0], x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT - 60, special: "" as PowerUpType | "" });
  const nextBubbleRef = useRef({ color: COLORS[1] });
  const projectileRef = useRef<{ x: number; y: number; vx: number; vy: number; color: string; special: PowerUpType | "" } | null>(null);
  const powerUpsRef = useRef<PowerUp[]>([]);
  const gameLoopRef = useRef<number | null>(null);
  const scoreRef = useRef(0);
  const levelRef = useRef(1);
  const livesRef = useRef(3);
  const bestScoreRef = useRef(0);
  const mouseXRef = useRef(CANVAS_WIDTH / 2);
  const mouseYRef = useRef(CANVAS_HEIGHT / 2);
  const gameStateRef = useRef<"start" | "playing" | "gameover">("start");
  const shotCountRef = useRef(0); // Track shots for ceiling drop
  const levelUpFlashRef = useRef(0);

  useEffect(() => {
    const saved = localStorage.getItem("pb-bubble-shooter");
    if (saved) {
      const val = parseInt(saved, 10);
      setBestScore(val);
      bestScoreRef.current = val;
    }
  }, []);

  const initBubbles = useCallback(() => {
    const bubbles: Bubble[] = [];
    const config = LEVEL_CONFIGS[Math.min(levelRef.current - 1, 9)];
    const rows = config.rows;
    const availableColors = COLORS.slice(0, config.colors);

    for (let row = 0; row < rows; row++) {
      const cols = row % 2 === 0 ? 10 : 9;
      const offsetX = row % 2 === 0 ? BUBBLE_RADIUS : BUBBLE_RADIUS * 2;
      for (let col = 0; col < cols; col++) {
        const rand = Math.random();
        let type: BubbleType = "normal";
        let stoneHealth = undefined;

        if (rand < config.stoneChance) {
          type = "stone";
          stoneHealth = 2;
        } else if (rand < config.stoneChance + config.bombChance) {
          type = "bomb";
        }

        bubbles.push({
          x: offsetX + col * BUBBLE_RADIUS * 2,
          y: 40 + row * BUBBLE_RADIUS * 1.8,
          color: availableColors[Math.floor(Math.random() * availableColors.length)],
          row,
          col,
          type,
          stoneHealth,
        });
      }
    }
    return bubbles;
  }, []);

  const getNextColor = useCallback(() => {
    const config = LEVEL_CONFIGS[Math.min(levelRef.current - 1, 9)];
    const availableColors = COLORS.slice(0, config.colors);
    return availableColors[Math.floor(Math.random() * availableColors.length)];
  }, []);

  const spawnPowerUp = () => {
    if (Math.random() > POWER_UP_SPAWN_CHANCE) return;

    const types: PowerUpType[] = ["fireball", "rainbow", "precision"];
    const type = types[Math.floor(Math.random() * types.length)];

    // Position near the bottom for easy pickup
    const x = BUBBLE_RADIUS + Math.random() * (CANVAS_WIDTH - BUBBLE_RADIUS * 2);
    const y = CANVAS_HEIGHT - 140 - Math.random() * 100;

    powerUpsRef.current.push({ x, y, type, active: true });
  };

  const draw = useCallback((timestamp?: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const t = timestamp || 0;

    // Background
    ctx.fillStyle = "#1a1a2e";
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Grid bubbles
    bubblesRef.current.forEach((bubble) => {
      ctx.beginPath();
      ctx.arc(bubble.x, bubble.y, BUBBLE_RADIUS, 0, Math.PI * 2);

      if (bubble.type === "stone") {
        // Stone bubble - gray with cracks
        ctx.fillStyle = "#6b7280";
        ctx.fill();
        ctx.strokeStyle = "#374151";
        ctx.lineWidth = 3;
        ctx.stroke();
        if (bubble.stoneHealth === 1) {
          // Show crack
          ctx.strokeStyle = "#fff";
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(bubble.x - 10, bubble.y - 5);
          ctx.lineTo(bubble.x + 8, bubble.y + 10);
          ctx.stroke();
        }
      } else if (bubble.type === "bomb") {
        // Bomb bubble - black with fuse
        ctx.fillStyle = "#1f2937";
        ctx.fill();
        ctx.strokeStyle = "#ef4444";
        ctx.lineWidth = 2;
        ctx.stroke();
        // Fuse
        ctx.strokeStyle = "#fbbf24";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(bubble.x + 10, bubble.y - 15);
        ctx.lineTo(bubble.x + 15, bubble.y - 20);
        ctx.stroke();
        // Spark
        const sparkPulse = Math.sin(t * 0.01) * 0.5 + 0.5;
        ctx.fillStyle = `rgba(251, 191, 36, ${sparkPulse})`;
        ctx.beginPath();
        ctx.arc(bubble.x + 15, bubble.y - 20, 3, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Normal bubble
        ctx.fillStyle = bubble.color;
        ctx.fill();
        ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    });

    // Power-ups with pulsing effect
    powerUpsRef.current.forEach((powerUp) => {
      if (!powerUp.active) return;
      const pulse = 1 + 0.3 * Math.sin(t * 0.008);

      ctx.save();
      ctx.translate(powerUp.x, powerUp.y);
      ctx.scale(pulse, pulse);

      // Draw star shape
      let color = "#f97316"; // fireball (orange)
      let icon = "🔥";
      if (powerUp.type === "rainbow") {
        color = "#a855f7"; // rainbow (purple)
        icon = "🌈";
      } else if (powerUp.type === "precision") {
        color = "#06b6d4"; // precision (cyan)
        icon = "🎯";
      }

      ctx.fillStyle = color;
      ctx.beginPath();
      for (let i = 0; i < 5; i++) {
        const angle = (i * 4 * Math.PI) / 5 - Math.PI / 2;
        const r = i % 2 === 0 ? 12 : 6;
        ctx.lineTo(r * Math.cos(angle), r * Math.sin(angle));
      }
      ctx.closePath();
      ctx.fill();

      // Icon
      ctx.font = "bold 12px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(icon, 0, 0);

      ctx.restore();
    });

    // Projectile
    if (projectileRef.current) {
      const p = projectileRef.current;
      ctx.beginPath();
      ctx.arc(p.x, p.y, BUBBLE_RADIUS, 0, Math.PI * 2);

      if (p.special === "fireball") {
        // Fireball effect - orange with trail
        const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, BUBBLE_RADIUS);
        gradient.addColorStop(0, "#fbbf24");
        gradient.addColorStop(0.5, "#f97316");
        gradient.addColorStop(1, "#dc2626");
        ctx.fillStyle = gradient;
        ctx.fill();
        // Flame trail
        ctx.fillStyle = "rgba(251, 146, 60, 0.5)";
        ctx.beginPath();
        ctx.arc(p.x - p.vx * 2, p.y - p.vy * 2, BUBBLE_RADIUS * 0.7, 0, Math.PI * 2);
        ctx.fill();
      } else if (p.special === "rainbow") {
        // Rainbow bomb effect
        const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, BUBBLE_RADIUS);
        gradient.addColorStop(0, "#fff");
        gradient.addColorStop(0.3, "#a855f7");
        gradient.addColorStop(0.6, "#ec4899");
        gradient.addColorStop(1, "#8b5cf6");
        ctx.fillStyle = gradient;
        ctx.fill();
      } else {
        ctx.fillStyle = p.color;
        ctx.fill();
      }

      ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    // Shooter
    const s = shooterRef.current;
    ctx.save();
    ctx.translate(s.x, s.y);
    ctx.rotate(s.angle);
    ctx.fillStyle = "#6b7280";
    ctx.fillRect(-10, -30, 20, 40);
    ctx.restore();

    // Current bubble at shooter
    if (!projectileRef.current) {
      const c = currentBubbleRef.current;
      ctx.beginPath();
      ctx.arc(c.x, c.y, BUBBLE_RADIUS, 0, Math.PI * 2);

      if (c.special === "fireball") {
        const gradient = ctx.createRadialGradient(c.x, c.y, 0, c.x, c.y, BUBBLE_RADIUS);
        gradient.addColorStop(0, "#fbbf24");
        gradient.addColorStop(0.5, "#f97316");
        gradient.addColorStop(1, "#dc2626");
        ctx.fillStyle = gradient;
      } else if (c.special === "rainbow") {
        const gradient = ctx.createRadialGradient(c.x, c.y, 0, c.x, c.y, BUBBLE_RADIUS);
        gradient.addColorStop(0, "#fff");
        gradient.addColorStop(0.3, "#a855f7");
        gradient.addColorStop(0.6, "#ec4899");
        gradient.addColorStop(1, "#8b5cf6");
        ctx.fillStyle = gradient;
      } else {
        ctx.fillStyle = c.color;
      }

      ctx.fill();
      ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    // Next bubble indicator
    ctx.fillStyle = "rgba(255, 255, 255, 0.1)";
    ctx.fillRect(10, CANVAS_HEIGHT - 100, 60, 80);
    ctx.fillStyle = "#9ca3af";
    ctx.font = "10px sans-serif";
    ctx.fillText("NEXT", 20, CANVAS_HEIGHT - 85);
    ctx.beginPath();
    ctx.arc(40, CANVAS_HEIGHT - 60, 15, 0, Math.PI * 2);
    ctx.fillStyle = nextBubbleRef.current.color;
    ctx.fill();
    ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Aim line (extended if precision mode)
    if (!projectileRef.current) {
      const lineLength = currentBubbleRef.current.special === "precision" ? 500 : 300;
      ctx.strokeStyle = currentBubbleRef.current.special === "precision"
        ? "rgba(6, 182, 212, 0.6)"
        : "rgba(255, 255, 255, 0.3)";
      ctx.lineWidth = currentBubbleRef.current.special === "precision" ? 2 : 1;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(s.x, s.y);
      ctx.lineTo(s.x + Math.cos(s.angle) * lineLength, s.y + Math.sin(s.angle) * lineLength);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Level-up flash notification
    if (levelUpFlashRef.current > 0) {
      levelUpFlashRef.current--;
      const alpha = Math.min(1, levelUpFlashRef.current / 40);
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.font = "bold 32px monospace";
      ctx.textAlign = "center";
      ctx.fillStyle = "#a855f7";
      const config = LEVEL_CONFIGS[Math.min(levelRef.current - 1, 9)];
      ctx.fillText(`LEVEL ${levelRef.current}`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 10);
      ctx.font = "16px monospace";
      ctx.fillStyle = "#c084fc";
      if (levelRef.current <= 10) {
        ctx.fillText(config.name, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 20);
      } else {
        ctx.fillText("Endless Mode!", CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 20);
      }
      ctx.restore();
    }
  }, []);

  const findMatches = useCallback((bubbles: Bubble[], newBubble: Bubble): Bubble[] => {
    const matches: Bubble[] = [newBubble];
    const queue = [newBubble];
    const visited = new Set<Bubble>();
    visited.add(newBubble);

    while (queue.length > 0) {
      const current = queue.shift()!;
      for (const bubble of bubbles) {
        if (visited.has(bubble)) continue;
        if (bubble.color !== newBubble.color) continue;
        const dx = bubble.x - current.x;
        const dy = bubble.y - current.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < BUBBLE_RADIUS * 2.2) {
          visited.add(bubble);
          matches.push(bubble);
          queue.push(bubble);
        }
      }
    }
    return matches;
  }, []);

  const removeFloating = useCallback((bubbles: Bubble[]): Bubble[] => {
    const connected = new Set<Bubble>();
    const queue: Bubble[] = [];

    // Start with top row
    bubbles.forEach((b) => {
      if (b.row === 0) {
        connected.add(b);
        queue.push(b);
      }
    });

    while (queue.length > 0) {
      const current = queue.shift()!;
      for (const bubble of bubbles) {
        if (connected.has(bubble)) continue;
        const dx = bubble.x - current.x;
        const dy = bubble.y - current.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < BUBBLE_RADIUS * 2.2) {
          connected.add(bubble);
          queue.push(bubble);
        }
      }
    }

    return Array.from(connected);
  }, []);

  const gameLoop = useCallback((timestamp: number) => {
    if (gameStateRef.current !== "playing") {
      gameLoopRef.current = null;
      return;
    }

    // Update aim angle
    const s = shooterRef.current;
    const dx = mouseXRef.current - s.x;
    const dy = mouseYRef.current - s.y;
    s.angle = Math.atan2(dy, dx);

    // Move projectile
    if (projectileRef.current) {
      const p = projectileRef.current;
      p.x += p.vx;
      p.y += p.vy;

      // Wall bounce
      if (p.x - BUBBLE_RADIUS <= 0 || p.x + BUBBLE_RADIUS >= CANVAS_WIDTH) {
        p.vx *= -1;
      }

      // Check collision with power-ups
      powerUpsRef.current.forEach((powerUp) => {
        if (!powerUp.active) return;
        const dx = p.x - powerUp.x;
        const dy = p.y - powerUp.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < BUBBLE_RADIUS + 15) {
          powerUp.active = false;
          currentBubbleRef.current.special = powerUp.type;
          p.special = powerUp.type;
        }
      });
      powerUpsRef.current = powerUpsRef.current.filter((pu) => pu.active);

      // Check collision with bubbles
      let collided = false;
      let hitBubble: Bubble | null = null;
      for (const bubble of bubblesRef.current) {
        const dx = p.x - bubble.x;
        const dy = p.y - bubble.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < BUBBLE_RADIUS * 2) {
          collided = true;
          hitBubble = bubble;
          break;
        }
      }

      // Check top
      if (p.y - BUBBLE_RADIUS <= 20) {
        collided = true;
      }

      if (collided) {
        // Handle special projectiles
        if (p.special === "fireball") {
          // Fireball pops through multiple bubbles
          const toRemove: Bubble[] = [];
          for (const bubble of bubblesRef.current) {
            const dx = p.x - bubble.x;
            const dy = p.y - bubble.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < BUBBLE_RADIUS * 5) {
              // Large radius
              toRemove.push(bubble);
            }
          }
          bubblesRef.current = bubblesRef.current.filter((b) => !toRemove.includes(b));
          scoreRef.current += toRemove.length * 20;
          setScore(scoreRef.current);
          setScoreFlash(true);
          setTimeout(() => setScoreFlash(false), 300);
          bubblesRef.current = removeFloating(bubblesRef.current);
          projectileRef.current = null;
          currentBubbleRef.current.color = nextBubbleRef.current.color;
          currentBubbleRef.current.special = "";
          nextBubbleRef.current.color = getNextColor();
        } else if (p.special === "rainbow") {
          // Rainbow bomb pops all of one color
          if (hitBubble) {
            const targetColor = hitBubble.color;
            const toRemove = bubblesRef.current.filter((b) => b.color === targetColor);
            bubblesRef.current = bubblesRef.current.filter((b) => b.color !== targetColor);
            scoreRef.current += toRemove.length * 15;
            setScore(scoreRef.current);
            setScoreFlash(true);
            setTimeout(() => setScoreFlash(false), 300);
            bubblesRef.current = removeFloating(bubblesRef.current);
          }
          projectileRef.current = null;
          currentBubbleRef.current.color = nextBubbleRef.current.color;
          currentBubbleRef.current.special = "";
          nextBubbleRef.current.color = getNextColor();
        } else {
          // Normal collision
          // Snap to grid
          const row = Math.round((p.y - 40) / (BUBBLE_RADIUS * 1.8));
          const isEvenRow = row % 2 === 0;
          const offsetX = isEvenRow ? BUBBLE_RADIUS : BUBBLE_RADIUS * 2;
          const col = Math.round((p.x - offsetX) / (BUBBLE_RADIUS * 2));
          const snappedX = offsetX + col * BUBBLE_RADIUS * 2;
          const snappedY = 40 + row * BUBBLE_RADIUS * 1.8;

          // Check if hit a stone bubble
          if (hitBubble && hitBubble.type === "stone") {
            hitBubble.stoneHealth! -= 1;
            if (hitBubble.stoneHealth! <= 0) {
              bubblesRef.current = bubblesRef.current.filter((b) => b !== hitBubble);
              scoreRef.current += 30;
              setScore(scoreRef.current);
              bubblesRef.current = removeFloating(bubblesRef.current);
            }
            projectileRef.current = null;
            currentBubbleRef.current.color = nextBubbleRef.current.color;
            currentBubbleRef.current.special = "";
            nextBubbleRef.current.color = getNextColor();
          } else if (hitBubble && hitBubble.type === "bomb") {
            // Bomb explodes neighbors
            const toRemove = [hitBubble];
            for (const bubble of bubblesRef.current) {
              if (bubble === hitBubble) continue;
              const dx = bubble.x - hitBubble.x;
              const dy = bubble.y - hitBubble.y;
              const dist = Math.sqrt(dx * dx + dy * dy);
              if (dist < BUBBLE_RADIUS * 4) {
                toRemove.push(bubble);
              }
            }
            bubblesRef.current = bubblesRef.current.filter((b) => !toRemove.includes(b));
            scoreRef.current += toRemove.length * 25;
            setScore(scoreRef.current);
            setScoreFlash(true);
            setTimeout(() => setScoreFlash(false), 300);
            bubblesRef.current = removeFloating(bubblesRef.current);
            projectileRef.current = null;
            currentBubbleRef.current.color = nextBubbleRef.current.color;
            currentBubbleRef.current.special = "";
            nextBubbleRef.current.color = getNextColor();
          } else {
            // Normal bubble
            const newBubble: Bubble = {
              x: Math.max(BUBBLE_RADIUS, Math.min(CANVAS_WIDTH - BUBBLE_RADIUS, snappedX)),
              y: Math.max(40, snappedY),
              color: p.color,
              row,
              col,
              type: "normal",
            };
            bubblesRef.current.push(newBubble);

            // Check matches
            const matches = findMatches(bubblesRef.current, newBubble);
            if (matches.length >= 3) {
              bubblesRef.current = bubblesRef.current.filter((b) => !matches.includes(b));
              scoreRef.current += matches.length * 10;
              setScore(scoreRef.current);
              setScoreFlash(true);
              setTimeout(() => setScoreFlash(false), 300);

              // Remove floating
              bubblesRef.current = removeFloating(bubblesRef.current);

              // Spawn power-up
              spawnPowerUp();
            }

            projectileRef.current = null;
            currentBubbleRef.current.color = nextBubbleRef.current.color;
            currentBubbleRef.current.special = "";
            nextBubbleRef.current.color = getNextColor();
          }
        }

        // Increment shot count and drop ceiling if needed
        shotCountRef.current++;
        const config = LEVEL_CONFIGS[Math.min(levelRef.current - 1, 9)];
        const shotsBeforeDrop = Math.max(5, 15 - config.dropSpeed * 2);
        if (shotCountRef.current >= shotsBeforeDrop) {
          shotCountRef.current = 0;
          // Drop ceiling by one row
          bubblesRef.current.forEach((b) => {
            b.y += BUBBLE_RADIUS * 1.8;
            b.row += 1;
          });
        }

        // Update high score
        if (scoreRef.current > bestScoreRef.current) {
          bestScoreRef.current = scoreRef.current;
          setBestScore(scoreRef.current);
          localStorage.setItem("pb-bubble-shooter", scoreRef.current.toString());
        }

        // Check win
        if (bubblesRef.current.length === 0) {
          if (levelRef.current < 10) {
            levelRef.current++;
            setLevel(levelRef.current);
            levelUpFlashRef.current = 120;
            bubblesRef.current = initBubbles();
            shotCountRef.current = 0;
            powerUpsRef.current = [];
            scoreRef.current += 100;
            setScore(scoreRef.current);
          } else {
            // Endless mode
            levelRef.current++;
            setLevel(levelRef.current);
            levelUpFlashRef.current = 120;
            bubblesRef.current = initBubbles();
            shotCountRef.current = 0;
            scoreRef.current += 200;
            setScore(scoreRef.current);
          }
        }

        // Check loss
        for (const bubble of bubblesRef.current) {
          if (bubble.y + BUBBLE_RADIUS >= CANVAS_HEIGHT - 100) {
            livesRef.current--;
            setLives(livesRef.current);
            if (livesRef.current <= 0) {
              gameStateRef.current = "gameover";
              setGameState("gameover");
              gameLoopRef.current = null;
              draw(timestamp);
              return;
            } else {
              // Lost a life, reset level
              bubblesRef.current = initBubbles();
              shotCountRef.current = 0;
              powerUpsRef.current = [];
              currentBubbleRef.current.special = "";
              draw(timestamp);
              gameLoopRef.current = requestAnimationFrame(gameLoop);
              return;
            }
          }
        }
      }

      // Remove if out of bounds
      if (p.y < -BUBBLE_RADIUS) {
        projectileRef.current = null;
        currentBubbleRef.current.color = nextBubbleRef.current.color;
        currentBubbleRef.current.special = "";
        nextBubbleRef.current.color = getNextColor();
      }
    }

    draw(timestamp);
    gameLoopRef.current = requestAnimationFrame(gameLoop);
  }, [draw, findMatches, removeFloating, getNextColor, initBubbles]);

  const shoot = useCallback(() => {
    if (projectileRef.current || gameStateRef.current !== "playing") return;
    const s = shooterRef.current;
    const speed = 10;
    projectileRef.current = {
      x: s.x,
      y: s.y - 30,
      vx: Math.cos(s.angle) * speed,
      vy: Math.sin(s.angle) * speed,
      color: currentBubbleRef.current.color,
      special: currentBubbleRef.current.special,
    };
  }, []);

  const startGame = useCallback(() => {
    bubblesRef.current = initBubbles();
    shooterRef.current = { x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT - 60, angle: -Math.PI / 2 };
    currentBubbleRef.current = { color: getNextColor(), x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT - 60, special: "" };
    nextBubbleRef.current = { color: getNextColor() };
    projectileRef.current = null;
    powerUpsRef.current = [];
    scoreRef.current = 0;
    levelRef.current = 1;
    livesRef.current = 3;
    shotCountRef.current = 0;
    levelUpFlashRef.current = 0;
    setScore(0);
    setLevel(1);
    setLives(3);
    gameStateRef.current = "playing";
    setGameState("playing");
    if (gameLoopRef.current === null) {
      gameLoopRef.current = requestAnimationFrame(gameLoop);
    }
  }, [initBubbles, getNextColor, gameLoop]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseXRef.current = (e.clientX - rect.left) * (CANVAS_WIDTH / rect.width);
      mouseYRef.current = (e.clientY - rect.top) * (CANVAS_HEIGHT / rect.height);
    };

    const handleClick = () => shoot();

    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      const rect = canvas.getBoundingClientRect();
      const touch = e.touches[0];
      mouseXRef.current = (touch.clientX - rect.left) * (CANVAS_WIDTH / rect.width);
      mouseYRef.current = (touch.clientY - rect.top) * (CANVAS_HEIGHT / rect.height);
    };

    const handleTouchEnd = (e: TouchEvent) => {
      e.preventDefault();
      shoot();
    };

    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("click", handleClick);
    canvas.addEventListener("touchmove", handleTouchMove, { passive: false });
    canvas.addEventListener("touchend", handleTouchEnd, { passive: false });

    return () => {
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("click", handleClick);
      canvas.removeEventListener("touchmove", handleTouchMove);
      canvas.removeEventListener("touchend", handleTouchEnd);
    };
  }, [shoot]);

  useEffect(() => {
    draw();
  }, [draw]);

  const handleShare = async () => {
    const levelText = levelRef.current <= 10 ? `reached level ${levelRef.current}` : "conquered all 10 levels";
    const text = `I scored ${scoreRef.current} and ${levelText} in Bubble Shooter! Can you beat me? https://playmini.fun/bubble-shooter`;
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
          <div className="text-3xl font-black text-purple-400 tabular-nums">
            {level <= 10 ? level : "∞"}
          </div>
        </div>
        <div>
          <div className="text-xs text-gray-500 uppercase tracking-wider">Score</div>
          <div
            className={`text-3xl font-black tabular-nums transition-all duration-150 ${
              scoreFlash ? "text-yellow-400 scale-125" : "text-blue-400"
            }`}
          >
            {score}
          </div>
        </div>
        <div>
          <div className="text-xs text-gray-500 uppercase tracking-wider">Best</div>
          <div className="text-3xl font-black text-amber-400 tabular-nums">{bestScore}</div>
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

      <div className="relative">
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          className="rounded-2xl max-w-full h-auto border border-gray-800 cursor-crosshair"
        />

        {gameState === "start" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/85 rounded-2xl backdrop-blur-sm">
            <div className="text-6xl mb-3">🔵</div>
            <h2 className="text-3xl font-black text-purple-400 mb-2">Bubble Shooter</h2>
            <p className="text-gray-400 mb-2 text-sm">Aim and shoot to match 3+ bubbles</p>
            <p className="text-gray-500 mb-6 text-xs">10 levels + endless mode • Power-ups</p>
            {bestScore > 0 && (
              <p className="text-yellow-400 mb-4 text-sm font-bold">
                High Score: {bestScore}
              </p>
            )}
            <button
              onClick={startGame}
              className="px-10 py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-2xl transition-all hover:scale-105 active:scale-95"
            >
              Play
            </button>
          </div>
        )}

        {gameState === "gameover" && (
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
                className="px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl transition-all hover:scale-105 active:scale-95"
              >
                Play Again
              </button>
              <button
                onClick={handleShare}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all hover:scale-105 active:scale-95"
              >
                Share
              </button>
              <DownloadButton canvasRef={canvasRef} filename="bubble-shooter-score" label="Save" />
            </div>
          </div>
        )}
      </div>

      <div className="text-center text-xs text-gray-600 max-w-md">
        {gameState === "playing" && (
          <>
            <p>Click or tap to shoot • Match 3+ bubbles of same color</p>
            <p className="mt-1 text-gray-500">
              Power-ups: 🔥 Fireball • 🌈 Rainbow Bomb • 🎯 Precision Aim
            </p>
          </>
        )}
        {gameState === "start" && (
          <>
            <p className="text-gray-500 mt-2">Stone bubbles need 2 hits • Bomb bubbles explode neighbors</p>
            <p className="text-gray-500 mt-1">Collect power-ups for special shots!</p>
          </>
        )}
      </div>
    </div>
  );
}
