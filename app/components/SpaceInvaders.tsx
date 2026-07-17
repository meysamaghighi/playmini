"use client";

import { useEffect, useRef, useState, useCallback } from "react";

type AlienType = "normal" | "tough" | "elite";

type Alien = {
  x: number;
  y: number;
  alive: boolean;
  type: AlienType;
  hp: number;
  maxHp: number;
};

type Bullet = {
  x: number;
  y: number;
  angle?: number;
};

type PowerUpType = "shield" | "rapid" | "spread";

type PowerUp = {
  x: number;
  y: number;
  type: PowerUpType;
};

const CANVAS_WIDTH = 600;
const CANVAS_HEIGHT = 600;
const PLAYER_WIDTH = 40;
const PLAYER_HEIGHT = 30;
const ALIEN_WIDTH = 30;
const ALIEN_HEIGHT = 25;
const ALIEN_SPACING = 50;
const BULLET_SPEED = 8;
const PLAYER_SPEED = 6;
const POWERUP_FALL_SPEED = 2;
const POWERUP_DURATION = 5000;
const POWERUP_DROP_CHANCE = 0.1;

type LevelConfig = {
  rows: number;
  cols: number;
  startSpeed: number;
  alienShootInterval: number;
};

function getLevelConfig(level: number): LevelConfig {
  if (level === 1) return { rows: 3, cols: 8, startSpeed: 1, alienShootInterval: 1200 };
  if (level === 2) return { rows: 4, cols: 9, startSpeed: 1, alienShootInterval: 1100 };
  if (level === 3) return { rows: 5, cols: 10, startSpeed: 2, alienShootInterval: 1000 };
  if (level === 4) return { rows: 5, cols: 11, startSpeed: 3, alienShootInterval: 900 };
  if (level === 5) return { rows: 5, cols: 11, startSpeed: 4, alienShootInterval: 800 };
  if (level === 6) return { rows: 6, cols: 11, startSpeed: 5, alienShootInterval: 750 };
  if (level === 7) return { rows: 5, cols: 11, startSpeed: 6, alienShootInterval: 700 };
  if (level === 8) return { rows: 6, cols: 11, startSpeed: 7, alienShootInterval: 650 };
  if (level === 9) return { rows: 5, cols: 11, startSpeed: 8, alienShootInterval: 600 };
  if (level === 10) return { rows: 7, cols: 11, startSpeed: 10, alienShootInterval: 500 };

  // Endless scaling for level 11+
  const rows = Math.min(8, 7 + Math.floor((level - 10) / 3));
  const startSpeed = Math.min(25, 10 + (level - 10));
  const alienShootInterval = Math.max(300, 500 - 20 * (level - 10));
  return { rows, cols: 11, startSpeed, alienShootInterval };
}

export default function SpaceInvaders() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [gameState, setGameState] = useState<"start" | "playing" | "gameover">("start");
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [level, setLevel] = useState(1);
  const [highScore, setHighScore] = useState(0);

  const playerXRef = useRef(CANVAS_WIDTH / 2 - PLAYER_WIDTH / 2);
  const aliensRef = useRef<Alien[]>([]);
  const bulletsRef = useRef<Bullet[]>([]);
  const alienBulletsRef = useRef<Bullet[]>([]);
  const powerUpsRef = useRef<PowerUp[]>([]);
  const alienDirectionRef = useRef(1);
  const alienSpeedRef = useRef(1);
  const alienMoveCountRef = useRef(0);
  const keysRef = useRef<Record<string, boolean>>({});
  const gameLoopRef = useRef<number | null>(null);
  const scoreRef = useRef(0);
  const livesRef = useRef(3);
  const levelRef = useRef(1);
  const highScoreRef = useRef(0);
  const lastShotTimeRef = useRef(0);
  const lastAlienShotRef = useRef(0);
  const gameStateRef = useRef<"start" | "playing" | "gameover">("start");
  const touchLeftRef = useRef(false);
  const touchRightRef = useRef(false);
  const autoShootIntervalRef = useRef<number | null>(null);
  const activePowerUpRef = useRef<PowerUpType | null>(null);
  const powerUpTimerRef = useRef<number | null>(null);
  const alienShootIntervalRef = useRef(1000);
  const levelUpFlashRef = useRef(0);

  const initAliens = useCallback((lvl: number) => {
    const config = getLevelConfig(lvl);
    const aliens: Alien[] = [];
    const startX = (CANVAS_WIDTH - (config.cols * ALIEN_SPACING)) / 2;

    for (let row = 0; row < config.rows; row++) {
      for (let col = 0; col < config.cols; col++) {
        let type: AlienType = "normal";
        let hp = 1;

        // Level 5+: top row tough
        if (lvl >= 5 && row === 0 && lvl < 7) {
          type = "tough";
          hp = 2;
        }
        // Level 7+: top row elite
        else if (lvl >= 7 && row === 0 && lvl < 9) {
          type = "elite";
          hp = 3;
        }
        // Level 9: top 2 rows tough, row 0 elite
        else if (lvl === 9) {
          if (row === 0) {
            type = "elite";
            hp = 3;
          } else if (row === 1) {
            type = "tough";
            hp = 2;
          }
        }
        // Level 10+: all tough, top row elite
        else if (lvl >= 10) {
          if (row === 0) {
            type = "elite";
            hp = 3;
          } else {
            type = "tough";
            hp = 2;
          }
        }

        aliens.push({
          x: startX + col * ALIEN_SPACING,
          y: 60 + row * ALIEN_SPACING,
          alive: true,
          type,
          hp,
          maxHp: hp,
        });
      }
    }
    return aliens;
  }, []);

  const spawnPowerUp = useCallback((x: number, y: number) => {
    if (Math.random() < POWERUP_DROP_CHANCE) {
      const types: PowerUpType[] = ["shield", "rapid", "spread"];
      const type = types[Math.floor(Math.random() * types.length)];
      powerUpsRef.current.push({ x, y, type });
    }
  }, []);

  const activatePowerUp = useCallback((type: PowerUpType) => {
    // Clear existing power-up
    if (powerUpTimerRef.current !== null) {
      clearTimeout(powerUpTimerRef.current);
    }

    // Shield is instant, others are timed
    if (type === "shield") {
      activePowerUpRef.current = "shield";
      // Shield stays until absorbed
    } else {
      activePowerUpRef.current = type;

      // Update auto-shoot interval for rapid fire
      if (type === "rapid") {
        if (autoShootIntervalRef.current !== null) {
          clearInterval(autoShootIntervalRef.current);
        }
        autoShootIntervalRef.current = window.setInterval(() => {
          if (gameStateRef.current === "playing") {
            const angle = activePowerUpRef.current === "spread" ? 0 : undefined;
            bulletsRef.current.push({
              x: playerXRef.current + PLAYER_WIDTH / 2 - 2,
              y: CANVAS_HEIGHT - 70,
              angle,
            });

            if (activePowerUpRef.current === "spread") {
              bulletsRef.current.push({
                x: playerXRef.current + PLAYER_WIDTH / 2 - 2,
                y: CANVAS_HEIGHT - 70,
                angle: -15,
              });
              bulletsRef.current.push({
                x: playerXRef.current + PLAYER_WIDTH / 2 - 2,
                y: CANVAS_HEIGHT - 70,
                angle: 15,
              });
            }
          }
        }, 150);
      }

      powerUpTimerRef.current = window.setTimeout(() => {
        activePowerUpRef.current = null;
        powerUpTimerRef.current = null;

        // Restore normal auto-shoot interval
        if (autoShootIntervalRef.current !== null) {
          clearInterval(autoShootIntervalRef.current);
        }
        autoShootIntervalRef.current = window.setInterval(() => {
          if (gameStateRef.current === "playing") {
            const angle = activePowerUpRef.current === "spread" ? 0 : undefined;
            bulletsRef.current.push({
              x: playerXRef.current + PLAYER_WIDTH / 2 - 2,
              y: CANVAS_HEIGHT - 70,
              angle,
            });

            if (activePowerUpRef.current === "spread") {
              bulletsRef.current.push({
                x: playerXRef.current + PLAYER_WIDTH / 2 - 2,
                y: CANVAS_HEIGHT - 70,
                angle: -15,
              });
              bulletsRef.current.push({
                x: playerXRef.current + PLAYER_WIDTH / 2 - 2,
                y: CANVAS_HEIGHT - 70,
                angle: 15,
              });
            }
          }
        }, 350);
      }, POWERUP_DURATION);
    }
  }, []);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Background
    ctx.fillStyle = "#0a0a1f";
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Stars
    ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
    for (let i = 0; i < 50; i++) {
      const x = (i * 137) % CANVAS_WIDTH;
      const y = (i * 211) % CANVAS_HEIGHT;
      ctx.fillRect(x, y, 2, 2);
    }

    // Player
    const px = playerXRef.current;
    const py = CANVAS_HEIGHT - 60;

    // Shield glow
    if (activePowerUpRef.current === "shield") {
      ctx.strokeStyle = "#eab308";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(px + PLAYER_WIDTH / 2, py + PLAYER_HEIGHT / 2, PLAYER_WIDTH / 2 + 8, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.fillStyle = "#22c55e";
    ctx.fillRect(px, py, PLAYER_WIDTH, PLAYER_HEIGHT);
    // Cockpit
    ctx.fillStyle = "#4ade80";
    ctx.fillRect(px + 10, py + 5, 20, 10);

    // Aliens
    aliensRef.current.forEach((alien) => {
      if (!alien.alive) return;

      // Set color based on type
      let bodyColor = "#ef4444"; // normal
      let eyeColor = "#fff";
      if (alien.type === "tough") {
        bodyColor = "#3b82f6"; // blue
      } else if (alien.type === "elite") {
        bodyColor = "#eab308"; // gold
        eyeColor = "#fef3c7";
      }

      // Dim if damaged
      const opacity = alien.hp < alien.maxHp ? 0.6 : 1.0;
      ctx.globalAlpha = opacity;

      ctx.fillStyle = bodyColor;
      ctx.fillRect(alien.x, alien.y, ALIEN_WIDTH, ALIEN_HEIGHT);

      // Special features
      if (alien.type === "tough") {
        // Antenna
        ctx.fillStyle = bodyColor;
        ctx.fillRect(alien.x + 13, alien.y - 4, 4, 5);
      } else if (alien.type === "elite") {
        // Crown-like top
        ctx.fillStyle = "#fbbf24";
        ctx.fillRect(alien.x + 5, alien.y - 3, 4, 4);
        ctx.fillRect(alien.x + 13, alien.y - 5, 4, 6);
        ctx.fillRect(alien.x + 21, alien.y - 3, 4, 4);
      }

      // Eyes
      ctx.fillStyle = eyeColor;
      ctx.fillRect(alien.x + 5, alien.y + 8, 6, 6);
      ctx.fillRect(alien.x + 19, alien.y + 8, 6, 6);

      if (alien.type === "elite") {
        ctx.fillStyle = "#dc2626";
      } else {
        ctx.fillStyle = "#000";
      }
      ctx.fillRect(alien.x + 7, alien.y + 10, 3, 3);
      ctx.fillRect(alien.x + 21, alien.y + 10, 3, 3);

      // Damage cracks
      if (alien.hp < alien.maxHp) {
        ctx.strokeStyle = "#000";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(alien.x + 10, alien.y + 5);
        ctx.lineTo(alien.x + 15, alien.y + 15);
        ctx.stroke();
      }

      ctx.globalAlpha = 1.0;
    });

    // Player bullets
    ctx.fillStyle = "#22c55e";
    bulletsRef.current.forEach((bullet) => {
      ctx.fillRect(bullet.x, bullet.y, 4, 12);
    });

    // Alien bullets
    ctx.fillStyle = "#ef4444";
    alienBulletsRef.current.forEach((bullet) => {
      ctx.fillRect(bullet.x, bullet.y, 4, 12);
    });

    // Power-ups
    powerUpsRef.current.forEach((powerUp) => {
      let color = "#eab308"; // shield
      let letter = "S";
      if (powerUp.type === "rapid") {
        color = "#06b6d4";
        letter = "R";
      } else if (powerUp.type === "spread") {
        color = "#c026d3";
        letter = "F";
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
    });

    // Level-up flash notification
    if (levelUpFlashRef.current > 0) {
      levelUpFlashRef.current--;
      const alpha = Math.min(1, levelUpFlashRef.current / 40); // fade out in last ~0.7s
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.font = "bold 32px monospace";
      ctx.textAlign = "center";
      ctx.fillStyle = "#22c55e";
      ctx.fillText(`LEVEL ${levelRef.current}`, 300, 300);
      ctx.font = "16px monospace";
      ctx.fillStyle = "#86efac";
      ctx.fillText("Get ready!", 300, 330);
      ctx.restore();
    }
  }, []);

  const gameLoop: () => void = useCallback(() => {
    if (gameStateRef.current !== "playing") {
      gameLoopRef.current = null;
      return;
    }

    // Move player (keyboard or touch)
    if (keysRef.current["arrowleft"] || keysRef.current["a"] || touchLeftRef.current) {
      playerXRef.current = Math.max(0, playerXRef.current - PLAYER_SPEED);
    }
    if (keysRef.current["arrowright"] || keysRef.current["d"] || touchRightRef.current) {
      playerXRef.current = Math.min(CANVAS_WIDTH - PLAYER_WIDTH, playerXRef.current + PLAYER_SPEED);
    }

    const now = Date.now();

    // Move bullets
    bulletsRef.current = bulletsRef.current.filter((bullet) => {
      if (bullet.angle !== undefined) {
        // Angled bullet (spread shot)
        const radians = (bullet.angle * Math.PI) / 180;
        bullet.x += Math.sin(radians) * 4;
        bullet.y -= Math.cos(radians) * BULLET_SPEED;
      } else {
        bullet.y -= BULLET_SPEED;
      }
      return bullet.y > 0 && bullet.x >= 0 && bullet.x <= CANVAS_WIDTH;
    });

    // Move alien bullets
    alienBulletsRef.current = alienBulletsRef.current.filter((bullet) => {
      bullet.y += BULLET_SPEED - 2;
      return bullet.y < CANVAS_HEIGHT;
    });

    // Move power-ups
    powerUpsRef.current = powerUpsRef.current.filter((powerUp) => {
      powerUp.y += POWERUP_FALL_SPEED;

      // Check collision with player
      const px = playerXRef.current;
      const py = CANVAS_HEIGHT - 60;
      if (
        powerUp.x >= px - 8 &&
        powerUp.x <= px + PLAYER_WIDTH + 8 &&
        powerUp.y >= py - 8 &&
        powerUp.y <= py + PLAYER_HEIGHT + 8
      ) {
        activatePowerUp(powerUp.type);
        return false;
      }

      return powerUp.y < CANVAS_HEIGHT;
    });

    // Move aliens
    alienMoveCountRef.current++;
    if (alienMoveCountRef.current % Math.max(10, 30 - alienSpeedRef.current) === 0) {
      const aliens = aliensRef.current;
      let hitEdge = false;

      for (const alien of aliens) {
        if (!alien.alive) continue;
        alien.x += alienDirectionRef.current * 10;
        if (alien.x <= 0 || alien.x >= CANVAS_WIDTH - ALIEN_WIDTH) {
          hitEdge = true;
        }
      }

      if (hitEdge) {
        alienDirectionRef.current *= -1;
        for (const alien of aliens) {
          if (alien.alive) alien.y += 20;
        }
      }
    }

    // Alien shooting
    if (now - lastAlienShotRef.current > alienShootIntervalRef.current) {
      const aliveAliens = aliensRef.current.filter((a) => a.alive);
      if (aliveAliens.length > 0) {
        const shooter = aliveAliens[Math.floor(Math.random() * aliveAliens.length)];
        alienBulletsRef.current.push({
          x: shooter.x + ALIEN_WIDTH / 2 - 2,
          y: shooter.y + ALIEN_HEIGHT,
        });
        lastAlienShotRef.current = now;
      }
    }

    // Collision: bullets vs aliens
    bulletsRef.current = bulletsRef.current.filter((bullet) => {
      for (const alien of aliensRef.current) {
        if (
          alien.alive &&
          bullet.x >= alien.x &&
          bullet.x <= alien.x + ALIEN_WIDTH &&
          bullet.y >= alien.y &&
          bullet.y <= alien.y + ALIEN_HEIGHT
        ) {
          alien.hp--;
          if (alien.hp <= 0) {
            alien.alive = false;
            let points = 10;
            if (alien.type === "tough") points = 20;
            else if (alien.type === "elite") points = 30;

            scoreRef.current += points;
            setScore(scoreRef.current);
            alienSpeedRef.current = Math.min(20, alienSpeedRef.current + 0.3);

            // Spawn power-up
            spawnPowerUp(alien.x + ALIEN_WIDTH / 2, alien.y + ALIEN_HEIGHT / 2);
          }
          return false;
        }
      }
      return true;
    });

    // Collision: alien bullets vs player
    const px = playerXRef.current;
    const py = CANVAS_HEIGHT - 60;
    for (const bullet of alienBulletsRef.current) {
      if (
        bullet.x >= px &&
        bullet.x <= px + PLAYER_WIDTH &&
        bullet.y >= py &&
        bullet.y <= py + PLAYER_HEIGHT
      ) {
        // Shield absorbs hit
        if (activePowerUpRef.current === "shield") {
          activePowerUpRef.current = null;
          alienBulletsRef.current = [];
        } else {
          livesRef.current--;
          setLives(livesRef.current);
          alienBulletsRef.current = [];
          if (livesRef.current <= 0) {
            gameStateRef.current = "gameover";
            setGameState("gameover");

            // Save high score
            if (scoreRef.current > highScoreRef.current) {
              highScoreRef.current = scoreRef.current;
              setHighScore(scoreRef.current);
              localStorage.setItem("pb-space-invaders", scoreRef.current.toString());
            }

            gameLoopRef.current = null;
            draw();
            return;
          }
        }
        break;
      }
    }

    // Check level complete
    const anyAlive = aliensRef.current.some((a) => a.alive);
    if (!anyAlive) {
      levelRef.current++;
      setLevel(levelRef.current);

      // Bonus life every 5 levels (cap at 5)
      if (levelRef.current % 5 === 0 && livesRef.current < 5) {
        livesRef.current++;
        setLives(livesRef.current);
      }

      // Setup next level
      const config = getLevelConfig(levelRef.current);
      aliensRef.current = initAliens(levelRef.current);
      bulletsRef.current = [];
      alienBulletsRef.current = [];
      powerUpsRef.current = [];
      alienDirectionRef.current = 1;
      alienSpeedRef.current = config.startSpeed;
      alienMoveCountRef.current = 0;
      alienShootIntervalRef.current = config.alienShootInterval;
      lastAlienShotRef.current = 0;

      // Clear active power-ups
      activePowerUpRef.current = null;
      if (powerUpTimerRef.current !== null) {
        clearTimeout(powerUpTimerRef.current);
        powerUpTimerRef.current = null;
      }

      levelUpFlashRef.current = 120; // ~2 seconds at 60fps
    }

    // Check loss (aliens reached bottom)
    for (const alien of aliensRef.current) {
      if (alien.alive && alien.y + ALIEN_HEIGHT >= CANVAS_HEIGHT - 80) {
        gameStateRef.current = "gameover";
        setGameState("gameover");

        // Save high score
        if (scoreRef.current > highScoreRef.current) {
          highScoreRef.current = scoreRef.current;
          setHighScore(scoreRef.current);
          localStorage.setItem("pb-space-invaders", scoreRef.current.toString());
        }

        gameLoopRef.current = null;
        draw();
        return;
      }
    }

    draw();
    gameLoopRef.current = requestAnimationFrame(gameLoop);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draw, initAliens, spawnPowerUp, activatePowerUp]);

  const startGame = useCallback(() => {
    playerXRef.current = CANVAS_WIDTH / 2 - PLAYER_WIDTH / 2;
    levelRef.current = 1;
    setLevel(1);

    const config = getLevelConfig(1);
    aliensRef.current = initAliens(1);
    bulletsRef.current = [];
    alienBulletsRef.current = [];
    powerUpsRef.current = [];
    alienDirectionRef.current = 1;
    alienSpeedRef.current = config.startSpeed;
    alienMoveCountRef.current = 0;
    alienShootIntervalRef.current = config.alienShootInterval;
    scoreRef.current = 0;
    livesRef.current = 3;
    lastShotTimeRef.current = 0;
    lastAlienShotRef.current = 0;
    activePowerUpRef.current = null;
    levelUpFlashRef.current = 0;

    setScore(0);
    setLives(3);
    gameStateRef.current = "playing";
    setGameState("playing");

    // Clear any existing timers
    if (autoShootIntervalRef.current !== null) {
      clearInterval(autoShootIntervalRef.current);
    }
    if (powerUpTimerRef.current !== null) {
      clearTimeout(powerUpTimerRef.current);
      powerUpTimerRef.current = null;
    }

    // Start auto-shooting
    autoShootIntervalRef.current = window.setInterval(() => {
      if (gameStateRef.current === "playing") {
        const angle = activePowerUpRef.current === "spread" ? 0 : undefined;
        bulletsRef.current.push({
          x: playerXRef.current + PLAYER_WIDTH / 2 - 2,
          y: CANVAS_HEIGHT - 70,
          angle,
        });

        if (activePowerUpRef.current === "spread") {
          bulletsRef.current.push({
            x: playerXRef.current + PLAYER_WIDTH / 2 - 2,
            y: CANVAS_HEIGHT - 70,
            angle: -15,
          });
          bulletsRef.current.push({
            x: playerXRef.current + PLAYER_WIDTH / 2 - 2,
            y: CANVAS_HEIGHT - 70,
            angle: 15,
          });
        }
      }
    }, 350);

    if (gameLoopRef.current === null) {
      gameLoopRef.current = requestAnimationFrame(gameLoop);
    }
  }, [initAliens, gameLoop]);

  useEffect(() => {
    // Load high score
    const saved = localStorage.getItem("pb-space-invaders");
    if (saved) {
      const savedScore = parseInt(saved, 10);
      highScoreRef.current = savedScore;
      setHighScore(savedScore);
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (["arrowleft", "arrowright", "a", "d"].includes(key)) {
        e.preventDefault();
        keysRef.current[key] = true;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      keysRef.current[key] = false;
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);

      // Cleanup intervals, timeouts, and animation frame
      if (autoShootIntervalRef.current !== null) {
        clearInterval(autoShootIntervalRef.current);
      }
      if (powerUpTimerRef.current !== null) {
        clearTimeout(powerUpTimerRef.current);
      }
      if (gameLoopRef.current !== null) {
        cancelAnimationFrame(gameLoopRef.current);
        gameLoopRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    draw();
  }, [draw]);

  const handleTouchStart = (direction: "left" | "right") => (e: React.PointerEvent) => {
    e.preventDefault();
    if (direction === "left") touchLeftRef.current = true;
    else if (direction === "right") touchRightRef.current = true;
  };

  const handleTouchEnd = (direction: "left" | "right") => (e: React.PointerEvent) => {
    e.preventDefault();
    if (direction === "left") touchLeftRef.current = false;
    else if (direction === "right") touchRightRef.current = false;
  };

  return (
    <div ref={containerRef} className="flex flex-col items-center gap-4">
      <div className="flex gap-6 text-center">
        <div>
          <div className="text-xs text-ink-3 uppercase tracking-wider">Level</div>
          <div className="text-2xl font-black text-blue-400 tabular-nums">{level}</div>
        </div>
        <div>
          <div className="text-xs text-ink-3 uppercase tracking-wider">Score</div>
          <div className="text-2xl font-black text-green-400 tabular-nums">{score}</div>
        </div>
        <div>
          <div className="text-xs text-ink-3 uppercase tracking-wider">Best</div>
          <div className="text-2xl font-black text-yellow-400 tabular-nums">{highScore}</div>
        </div>
        <div>
          <div className="text-xs text-ink-3 uppercase tracking-wider">Lives</div>
          <div className="text-2xl font-black text-red-400 tabular-nums">{lives}</div>
        </div>
      </div>

      <div className="relative">
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          className="rounded-2xl max-w-full h-auto border border-line"
          style={{ touchAction: "none" }}
        />

        {gameState === "start" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/85 rounded-2xl backdrop-blur-sm">
            <div className="text-6xl mb-3">👾</div>
            <h2 className="text-3xl font-black text-red-400 mb-2">Space Invaders</h2>
            <p className="text-ink-2 mb-2 text-sm">Arrow keys to move, auto-shooting enabled</p>
            <p className="text-ink-3 mb-6 text-xs">10 levels + endless mode</p>
            {highScore > 0 && (
              <p className="text-yellow-400 mb-4 text-sm font-bold">High Score: {highScore}</p>
            )}
            <button
              onClick={startGame}
              className="px-10 py-3 bg-red-600 hover:bg-red-500 text-ink font-bold rounded-2xl transition-all hover:scale-105 active:scale-95"
            >
              Play
            </button>
          </div>
        )}

        {gameState === "gameover" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/85 rounded-2xl backdrop-blur-sm">
            <h2 className="text-3xl font-black text-red-400 mb-4">Game Over</h2>
            <div className="bg-slate-900/80 rounded-xl px-6 py-3 mb-6">
              <p className="text-ink text-lg font-bold">Score: {score}</p>
              <p className="text-ink text-md">Level Reached: {level}</p>
              <p className="text-yellow-400 text-md font-bold">Best: {highScore}</p>
              {score === highScore && score > 0 && (
                <p className="text-green-400 text-sm mt-2">New High Score!</p>
              )}
            </div>
            <div className="flex gap-3">
              <button
                onClick={startGame}
                className="px-6 py-3 bg-red-600 hover:bg-red-500 text-ink font-bold rounded-xl transition-all hover:scale-105 active:scale-95"
              >
                Play Again
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Touch Controls */}
      <div className="flex gap-3 w-full max-w-md justify-center items-center px-4">
        <button
          onPointerDown={handleTouchStart("left")}
          onPointerUp={handleTouchEnd("left")}
          className="flex-1 h-16 bg-paper-2/50 hover:bg-paper-2/50 active:bg-gray-600/50 text-ink font-bold rounded-xl transition-colors select-none flex items-center justify-center text-2xl border border-line"
          style={{ touchAction: "none" }}
        >
          ←
        </button>
        <button
          onPointerDown={handleTouchStart("right")}
          onPointerUp={handleTouchEnd("right")}
          className="flex-1 h-16 bg-paper-2/50 hover:bg-paper-2/50 active:bg-gray-600/50 text-ink font-bold rounded-xl transition-colors select-none flex items-center justify-center text-2xl border border-line"
          style={{ touchAction: "none" }}
        >
          →
        </button>
      </div>

      <div className="text-center text-xs text-ink-3">
        <p>Arrow keys or A/D to move • Auto-shooting enabled</p>
        <p className="mt-1">Use touch controls on mobile</p>
        <p className="mt-1 text-ink-3">Collect power-ups: Shield (S), Rapid Fire (R), Spread Shot (F)</p>
      </div>
    </div>
  );
}
