"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useGameLoop } from "./useGameLoop";

const W = 480;
const H = 480;
const TAU = Math.PI * 2;

interface Vec { x: number; y: number; }
interface Asteroid { pos: Vec; vel: Vec; radius: number; angle: number; spin: number; verts: Vec[]; }
interface Bullet { pos: Vec; vel: Vec; life: number; }
interface Particle { pos: Vec; vel: Vec; life: number; maxLife: number; }

function randVerts(r: number): Vec[] {
  const n = 8 + Math.floor(Math.random() * 5);
  return Array.from({ length: n }, (_, i) => {
    const a = (i / n) * TAU;
    const d = r * (0.7 + Math.random() * 0.3);
    return { x: Math.cos(a) * d, y: Math.sin(a) * d };
  });
}

function spawnAsteroid(level: number, avoidPos?: Vec): Asteroid {
  const r = 30 + Math.random() * 20;
  let pos: Vec;
  do {
    pos = { x: Math.random() * W, y: Math.random() * H };
  } while (avoidPos && Math.hypot(pos.x - avoidPos.x, pos.y - avoidPos.y) < 120);
  const speed = (0.5 + Math.random() * 0.8) * (1 + (level - 1) * 0.15);
  const a = Math.random() * TAU;
  return { pos, vel: { x: Math.cos(a) * speed, y: Math.sin(a) * speed }, radius: r, angle: Math.random() * TAU, spin: (Math.random() - 0.5) * 0.04, verts: randVerts(r) };
}

function splitAsteroid(a: Asteroid): Asteroid[] {
  if (a.radius < 14) return [];
  return Array.from({ length: 2 }, () => {
    const r = a.radius * 0.52;
    const speed = Math.hypot(a.vel.x, a.vel.y) * 1.4;
    const ang = Math.random() * TAU;
    return { pos: { ...a.pos }, vel: { x: Math.cos(ang) * speed, y: Math.sin(ang) * speed }, radius: r, angle: Math.random() * TAU, spin: (Math.random() - 0.5) * 0.07, verts: randVerts(r) };
  });
}

function wrap(v: Vec) {
  if (v.x < 0) v.x += W; if (v.x > W) v.x -= W;
  if (v.y < 0) v.y += H; if (v.y > H) v.y -= H;
}

function circlesCollide(a: Vec, ra: number, b: Vec, rb: number) {
  return Math.hypot(a.x - b.x, a.y - b.y) < ra + rb;
}

export default function AsteroidsGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const g = useRef({
    state: "start" as "start" | "playing" | "dead" | "gameover",
    ship: { pos: { x: W / 2, y: H / 2 }, vel: { x: 0, y: 0 }, angle: -Math.PI / 2, thrusting: false, invincible: 120 },
    asteroids: [] as Asteroid[],
    bullets: [] as Bullet[],
    particles: [] as Particle[],
    keys: {} as Record<string, boolean>,
    score: 0,
    lives: 3,
    level: 1,
    shootCooldown: 0,
    deathTimer: 0,
    frame: 0,
  });
  const [display, setDisplay] = useState({ score: 0, lives: 3, level: 1, state: "start" });

  const initLevel = useCallback((level: number) => {
    const count = 3 + level;
    g.current.asteroids = Array.from({ length: count }, () => spawnAsteroid(level, g.current.ship.pos));
    g.current.bullets = [];
    g.current.particles = [];
  }, []);

  const resetShip = useCallback(() => {
    g.current.ship = { pos: { x: W / 2, y: H / 2 }, vel: { x: 0, y: 0 }, angle: -Math.PI / 2, thrusting: false, invincible: 180 };
  }, []);

  const startGame = useCallback(() => {
    const gs = g.current;
    gs.score = 0; gs.lives = 3; gs.level = 1; gs.state = "playing";
    gs.frame = 0;
    resetShip();
    initLevel(1);
    setDisplay({ score: 0, lives: 3, level: 1, state: "playing" });
  }, [resetShip, initLevel]);

  const explode = useCallback((pos: Vec, count: number) => {
    for (let i = 0; i < count; i++) {
      const a = Math.random() * TAU;
      const spd = 0.5 + Math.random() * 2;
      g.current.particles.push({ pos: { ...pos }, vel: { x: Math.cos(a) * spd, y: Math.sin(a) * spd }, life: 40 + Math.random() * 40, maxLife: 80 });
    }
  }, []);

  const tick = useCallback(() => {
    const gs = g.current;
    if (gs.state === "start" || gs.state === "gameover") return;
    gs.frame++;

    if (gs.state === "dead") {
      gs.deathTimer--;
      gs.particles.forEach(p => { p.pos.x += p.vel.x; p.pos.y += p.vel.y; p.life--; });
      gs.particles = gs.particles.filter(p => p.life > 0);
      if (gs.deathTimer <= 0) {
        if (gs.lives <= 0) {
          gs.state = "gameover";
          setDisplay(d => ({ ...d, state: "gameover" }));
        } else {
          resetShip();
          gs.state = "playing";
          setDisplay(d => ({ ...d, state: "playing" }));
        }
      }
      return;
    }

    const ship = gs.ship;
    const TURN = 0.055, THRUST = 0.18, FRICTION = 0.97, BULLET_SPD = 7, MAX_SPD = 6;

    // Controls
    if (gs.keys["ArrowLeft"] || gs.keys["a"] || gs.keys["A"]) ship.angle -= TURN;
    if (gs.keys["ArrowRight"] || gs.keys["d"] || gs.keys["D"]) ship.angle += TURN;
    ship.thrusting = !!(gs.keys["ArrowUp"] || gs.keys["w"] || gs.keys["W"]);
    if (ship.thrusting) {
      ship.vel.x += Math.cos(ship.angle) * THRUST;
      ship.vel.y += Math.sin(ship.angle) * THRUST;
      const spd = Math.hypot(ship.vel.x, ship.vel.y);
      if (spd > MAX_SPD) { ship.vel.x *= MAX_SPD / spd; ship.vel.y *= MAX_SPD / spd; }
    }
    ship.vel.x *= FRICTION; ship.vel.y *= FRICTION;
    ship.pos.x += ship.vel.x; ship.pos.y += ship.vel.y;
    wrap(ship.pos);
    if (ship.invincible > 0) ship.invincible--;

    // Shoot
    if (gs.shootCooldown > 0) gs.shootCooldown--;
    if ((gs.keys[" "] || gs.keys["x"] || gs.keys["X"]) && gs.shootCooldown === 0) {
      gs.bullets.push({ pos: { x: ship.pos.x + Math.cos(ship.angle) * 14, y: ship.pos.y + Math.sin(ship.angle) * 14 }, vel: { x: Math.cos(ship.angle) * BULLET_SPD + ship.vel.x * 0.3, y: Math.sin(ship.angle) * BULLET_SPD + ship.vel.y * 0.3 }, life: 55 });
      gs.shootCooldown = 10;
    }

    // Update bullets
    gs.bullets.forEach(b => { b.pos.x += b.vel.x; b.pos.y += b.vel.y; wrap(b.pos); b.life--; });
    gs.bullets = gs.bullets.filter(b => b.life > 0);

    // Update asteroids
    gs.asteroids.forEach(a => { a.pos.x += a.vel.x; a.pos.y += a.vel.y; wrap(a.pos); a.angle += a.spin; });

    // Update particles
    gs.particles.forEach(p => { p.pos.x += p.vel.x; p.pos.y += p.vel.y; p.life--; });
    gs.particles = gs.particles.filter(p => p.life > 0);

    // Bullet-asteroid collisions
    const bulletsToRemove = new Set<number>();
    const asteroidsToRemove = new Set<number>();
    const newAsteroids: Asteroid[] = [];

    for (let bi = 0; bi < gs.bullets.length; bi++) {
      for (let ai = 0; ai < gs.asteroids.length; ai++) {
        if (asteroidsToRemove.has(ai)) continue;
        const b = gs.bullets[bi], a = gs.asteroids[ai];
        if (circlesCollide(b.pos, 3, a.pos, a.radius * 0.8)) {
          bulletsToRemove.add(bi);
          asteroidsToRemove.add(ai);
          const pts = a.radius > 25 ? 20 : a.radius > 14 ? 50 : 100;
          gs.score += pts;
          explode(a.pos, a.radius > 20 ? 12 : 7);
          newAsteroids.push(...splitAsteroid(a));
          setDisplay(d => ({ ...d, score: gs.score }));
          break;
        }
      }
    }
    gs.bullets = gs.bullets.filter((_, i) => !bulletsToRemove.has(i));
    gs.asteroids = gs.asteroids.filter((_, i) => !asteroidsToRemove.has(i));
    gs.asteroids.push(...newAsteroids);

    // Ship-asteroid collision
    if (ship.invincible === 0) {
      for (const a of gs.asteroids) {
        if (circlesCollide(ship.pos, 10, a.pos, a.radius * 0.75)) {
          gs.lives--;
          explode(ship.pos, 20);
          gs.state = "dead";
          gs.deathTimer = 100;
          setDisplay(d => ({ ...d, lives: gs.lives, state: "dead" }));
          return;
        }
      }
    }

    // Level clear
    if (gs.asteroids.length === 0) {
      gs.level++;
      initLevel(gs.level);
      resetShip();
      setDisplay(d => ({ ...d, level: gs.level }));
    }
  }, [explode, initLevel, resetShip]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const gs = g.current;

    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, W, H);

    // Stars (static, seeded by frame 0)
    ctx.fillStyle = "rgba(255,255,255,0.4)";
    for (let i = 0; i < 60; i++) {
      const sx = (i * 137.5 + 23) % W;
      const sy = (i * 97.3 + 41) % H;
      ctx.fillRect(sx, sy, 1, 1);
    }

    // Particles
    for (const p of gs.particles) {
      const alpha = p.life / p.maxLife;
      ctx.strokeStyle = `rgba(255,${Math.floor(150 * alpha + 100)},50,${alpha})`;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(p.pos.x, p.pos.y);
      ctx.lineTo(p.pos.x - p.vel.x * 3, p.pos.y - p.vel.y * 3);
      ctx.stroke();
    }

    // Asteroids
    ctx.strokeStyle = "#aaa";
    ctx.lineWidth = 1.5;
    for (const a of gs.asteroids) {
      ctx.save();
      ctx.translate(a.pos.x, a.pos.y);
      ctx.rotate(a.angle);
      ctx.beginPath();
      ctx.moveTo(a.verts[0].x, a.verts[0].y);
      for (let i = 1; i < a.verts.length; i++) ctx.lineTo(a.verts[i].x, a.verts[i].y);
      ctx.closePath();
      ctx.stroke();
      ctx.restore();
    }

    // Bullets
    ctx.fillStyle = "#0ff";
    for (const b of gs.bullets) {
      ctx.beginPath();
      ctx.arc(b.pos.x, b.pos.y, 2.5, 0, TAU);
      ctx.fill();
    }

    // Ship
    if (gs.state === "playing" && (gs.ship.invincible === 0 || Math.floor(gs.frame / 6) % 2 === 0)) {
      const ship = gs.ship;
      ctx.save();
      ctx.translate(ship.pos.x, ship.pos.y);
      ctx.rotate(ship.angle);
      ctx.strokeStyle = "#fff";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(16, 0);
      ctx.lineTo(-10, -8);
      ctx.lineTo(-6, 0);
      ctx.lineTo(-10, 8);
      ctx.closePath();
      ctx.stroke();
      // Thrust flame
      if (ship.thrusting && gs.frame % 4 < 3) {
        ctx.strokeStyle = `hsl(${20 + Math.random() * 40},100%,60%)`;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(-6, -4);
        ctx.lineTo(-16 - Math.random() * 8, 0);
        ctx.lineTo(-6, 4);
        ctx.stroke();
      }
      ctx.restore();
    }

    // Overlay
    if (gs.state === "start" || gs.state === "gameover") {
      ctx.fillStyle = "rgba(0,0,0,0.6)";
      ctx.fillRect(0, 0, W, H);
      ctx.textAlign = "center";
      ctx.fillStyle = "#0ff";
      ctx.font = "bold 32px monospace";
      ctx.fillText("ASTEROIDS", W / 2, H / 2 - 40);
      if (gs.state === "gameover") {
        ctx.fillStyle = "#fff";
        ctx.font = "20px monospace";
        ctx.fillText(`Score: ${gs.score}`, W / 2, H / 2);
      }
      ctx.fillStyle = "#fff";
      ctx.font = "14px monospace";
      ctx.fillText(gs.state === "start" ? "Arrow keys / WASD to move" : "", W / 2, H / 2 + (gs.state === "start" ? 10 : 40));
      ctx.fillText("Space / X to shoot", W / 2, H / 2 + (gs.state === "start" ? 34 : 64));
      ctx.fillStyle = "#0ff";
      ctx.font = "bold 16px monospace";
      ctx.fillText("Press Space to start", W / 2, H / 2 + (gs.state === "start" ? 70 : 100));
    }
  }, []);

  // Loop
  useGameLoop(useCallback(() => { tick(); draw(); }, [tick, draw]));

  // Keys
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      g.current.keys[e.key] = true;
      if (e.key === " ") {
        e.preventDefault();
        if (g.current.state === "start" || g.current.state === "gameover") startGame();
      }
    };
    const up = (e: KeyboardEvent) => { g.current.keys[e.key] = false; };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => { window.removeEventListener("keydown", down); window.removeEventListener("keyup", up); };
  }, [startGame]);

  // Touch virtual buttons
  const touchBtn = useCallback((key: string, active: boolean) => {
    g.current.keys[key] = active;
    if (active && key === " " && (g.current.state === "start" || g.current.state === "gameover")) startGame();
  }, [startGame]);

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex items-center justify-between w-full max-w-[480px] px-1">
        <div className="text-sm text-ink-2">Level <span className="font-bold text-ink">{display.level}</span></div>
        <div className="flex gap-1">
          {Array.from({ length: Math.max(0, display.lives) }).map((_, i) => (
            <svg key={i} width="18" height="18" viewBox="0 0 18 18">
              <polygon points="9,1 17,15 6,10 12,10 1,15" fill="none" stroke="#0ff" strokeWidth="1.5" />
            </svg>
          ))}
        </div>
        <div className="text-sm text-ink-2">Score <span className="font-bold text-ink">{display.score}</span></div>
      </div>

      <canvas
        ref={canvasRef}
        width={W}
        height={H}
        className="max-w-full h-auto rounded-lg border border-line touch-none"
        onClick={() => { if (g.current.state === "start" || g.current.state === "gameover") startGame(); }}
      />

      {/* Mobile controls */}
      <div className="flex gap-3 sm:hidden select-none">
        <button
          className="w-14 h-14 rounded-xl bg-paper-2 active:bg-gray-600 text-ink text-xl flex items-center justify-center"
          onTouchStart={() => touchBtn("ArrowLeft", true)} onTouchEnd={() => touchBtn("ArrowLeft", false)}
        >↺</button>
        <button
          className="w-14 h-14 rounded-xl bg-paper-2 active:bg-gray-600 text-ink text-lg flex items-center justify-center"
          onTouchStart={() => touchBtn("ArrowUp", true)} onTouchEnd={() => touchBtn("ArrowUp", false)}
        >▲</button>
        <button
          className="w-14 h-14 rounded-xl bg-paper-2 active:bg-gray-600 text-ink text-xl flex items-center justify-center"
          onTouchStart={() => touchBtn("ArrowRight", true)} onTouchEnd={() => touchBtn("ArrowRight", false)}
        >↻</button>
        <button
          className="w-14 h-14 rounded-xl bg-cyan-900 active:bg-cyan-700 text-cyan-300 font-bold text-sm flex items-center justify-center"
          onTouchStart={() => touchBtn(" ", true)} onTouchEnd={() => touchBtn(" ", false)}
        >FIRE</button>
      </div>

      <p className="text-xs text-ink-3 hidden sm:block">Arrow / WASD — rotate &amp; thrust &nbsp;|&nbsp; Space / X — fire</p>
    </div>
  );
}
