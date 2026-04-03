"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import DownloadButton from "./DownloadButton";

type ObstacleType = "car" | "truck" | "motorcycle";
type ObstacleCar = { x: number; y: number; lane: number; color: string; type: ObstacleType; width: number; height: number };
type Coin = { x: number; y: number; collected: boolean; lane: number };
type Ramp = { x: number; y: number; lane: number };
type OilSlick = { x: number; y: number; lane: number };
type Roadwork = { x: number; y: number; lane: number; active: boolean };
type PowerUpType = "shield" | "speed" | "magnet";
type PowerUp = { x: number; y: number; lane: number; type: PowerUpType; collected: boolean };
type Vehicle = "car" | "motorcycle" | "truck" | "lambo" | "junker" | "bus";

const CW = 400;
const CH = 600;
const LANES = 3;
const ROAD_W = 280;
const GRASS_W = (CW - ROAD_W) / 2;
const LANE_W = ROAD_W / LANES;
const PLAYER_Y = CH - 100;
const OBS_COLORS = ["#ef4444", "#3b82f6", "#eab308", "#8b5cf6", "#ec4899", "#14b8a6"];

const VEHICLE_STATS: Record<Vehicle, { w: number; h: number; label: string; emoji: string; baseSpeed: number }> = {
  lambo:      { w: 34, h: 58, label: "Lambo",      emoji: "🏎️", baseSpeed: 4.5 },
  car:        { w: 36, h: 60, label: "Car",         emoji: "🚗", baseSpeed: 3 },
  motorcycle: { w: 22, h: 48, label: "Motorcycle",  emoji: "🏍️", baseSpeed: 3.5 },
  junker:     { w: 38, h: 62, label: "Junker",      emoji: "🚙", baseSpeed: 2 },
  truck:      { w: 44, h: 72, label: "Truck",       emoji: "🚛", baseSpeed: 2.5 },
  bus:        { w: 46, h: 84, label: "Bus",          emoji: "🚌", baseSpeed: 2 },
};

const BASE_SPEED = 3;
const MAX_SPEED = 14;
const SPEED_INC = 0.0005;
const BOOST_AMOUNT = 0.15;
const BRAKE_AMOUNT = 0.2;

// Level configuration (10 handcrafted + endless)
const LEVEL_CONFIGS = [
  { level: 1, name: "Highway Easy", targetDist: 1000, spawnRate: 0.008, coinRate: 0.012, speedMultiplier: 1.0, traffic: "light", obstacles: false },
  { level: 2, name: "Morning Commute", targetDist: 1500, spawnRate: 0.010, coinRate: 0.011, speedMultiplier: 1.05, traffic: "light", obstacles: false },
  { level: 3, name: "Rush Hour Start", targetDist: 2000, spawnRate: 0.012, coinRate: 0.010, speedMultiplier: 1.1, traffic: "medium", obstacles: true },
  { level: 4, name: "City Traffic", targetDist: 2500, spawnRate: 0.014, coinRate: 0.009, speedMultiplier: 1.15, traffic: "medium", obstacles: true },
  { level: 5, name: "Peak Hour", targetDist: 3000, spawnRate: 0.016, coinRate: 0.008, speedMultiplier: 1.2, traffic: "medium", obstacles: true },
  { level: 6, name: "Heavy Traffic", targetDist: 3500, spawnRate: 0.018, coinRate: 0.008, speedMultiplier: 1.25, traffic: "heavy", obstacles: true },
  { level: 7, name: "Construction Zone", targetDist: 4000, spawnRate: 0.020, coinRate: 0.007, speedMultiplier: 1.3, traffic: "heavy", obstacles: true },
  { level: 8, name: "Gridlock", targetDist: 4500, spawnRate: 0.022, coinRate: 0.007, speedMultiplier: 1.35, traffic: "heavy", obstacles: true },
  { level: 9, name: "Chaos Highway", targetDist: 5000, spawnRate: 0.024, coinRate: 0.006, speedMultiplier: 1.4, traffic: "heavy", obstacles: true },
  { level: 10, name: "Final Mile", targetDist: 6000, spawnRate: 0.028, coinRate: 0.006, speedMultiplier: 1.5, traffic: "boss", obstacles: true },
];

const OBSTACLE_TYPES = {
  car: { width: 36, height: 60 },
  truck: { width: 48, height: 80 },
  motorcycle: { width: 24, height: 50 },
};

export default function CarRacer() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [displayState, setDisplayState] = useState<"START" | "PLAYING" | "GAME_OVER">("START");
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const [scoreFlash, setScoreFlash] = useState(false);
  const [vehicle, setVehicle] = useState<Vehicle>("car");
  const [displaySpeed, setDisplaySpeed] = useState(0);
  const [currentLevel, setCurrentLevel] = useState(1);
  const [lives, setLives] = useState(3);

  const vehicleRef = useRef<Vehicle>("car");
  const playerLaneRef = useRef(1);
  const roadOffRef = useRef(0);
  const speedRef = useRef(BASE_SPEED);
  const baseSpeedRef = useRef(BASE_SPEED);
  const boostRef = useRef(0); // player speed adjustment
  const obsRef = useRef<ObstacleCar[]>([]);
  const coinsRef = useRef<Coin[]>([]);
  const rampsRef = useRef<Ramp[]>([]);
  const oilSlicksRef = useRef<OilSlick[]>([]);
  const roadworksRef = useRef<Roadwork[]>([]);
  const powerUpsRef = useRef<PowerUp[]>([]);
  const jumpingRef = useRef(false);
  const jumpProgressRef = useRef(0); // 0 to 1
  const scoreRef = useRef(0);
  const distRef = useRef(0);
  const levelDistRef = useRef(0); // distance in current level
  const bestRef = useRef(0);
  const stateRef = useRef<"START" | "PLAYING" | "GAME_OVER">("START");
  const loopRef = useRef<number | null>(null);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const keysRef = useRef({ left: false, right: false, up: false, down: false });
  const levelRef = useRef(1);
  const livesRef = useRef(3);
  const activePowerUpRef = useRef<{ type: PowerUpType; timeLeft: number } | null>(null);
  const oilSlowRef = useRef(0); // frames of oil slow remaining
  const levelUpFlashRef = useRef(0); // countdown frames for level-up flash text

  useEffect(() => {
    const saved = localStorage.getItem("pb-car-racer");
    if (saved) { const v = parseInt(saved, 10); setBestScore(v); bestRef.current = v; }
  }, []);

  const laneX = (lane: number) => GRASS_W + lane * LANE_W + LANE_W / 2;

  // ---- Drawing ----
  const drawObstacleVehicle = (ctx: CanvasRenderingContext2D, obs: ObstacleCar) => {
    const { x, y, color, type, width, height } = obs;
    const bx = x - width / 2, by = y - height / 2;

    if (type === "motorcycle") {
      // Smaller, faster bike
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.roundRect(bx + 2, by, width - 4, height, 6);
      ctx.fill();
      ctx.fillStyle = "#1f2937";
      ctx.fillRect(bx + 4, by + height * 0.4, width - 8, height * 0.15);
      // Wheels
      ctx.fillStyle = "#111";
      ctx.beginPath(); ctx.arc(x, by + 5, 5, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(x, by + height - 5, 5, 0, Math.PI * 2); ctx.fill();
      // Tail light
      ctx.fillStyle = "#991b1b";
      ctx.fillRect(bx + 4, by + height - 5, width - 8, 3);
    } else if (type === "truck") {
      // Wider, slower, harder to pass
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.roundRect(bx, by, width, height, 4);
      ctx.fill();
      // Cargo
      ctx.fillStyle = "#374151";
      ctx.fillRect(bx + 2, by + height * 0.45, width - 4, height * 0.45);
      ctx.strokeStyle = "#00000040";
      ctx.lineWidth = 1;
      ctx.strokeRect(bx + 2, by + height * 0.45, width - 4, height * 0.45);
      // Windshield
      ctx.fillStyle = "rgba(100,150,200,0.7)";
      ctx.fillRect(bx + 5, by + 8, width - 10, 16);
      // Tail lights
      ctx.fillStyle = "#991b1b";
      ctx.fillRect(bx + 3, by + height - 8, 10, 6);
      ctx.fillRect(bx + width - 13, by + height - 8, 10, 6);
    } else {
      // Normal car (default)
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.roundRect(bx, by, width, height, 6);
      ctx.fill();
      // Windshield
      ctx.fillStyle = "rgba(100,150,200,0.7)";
      ctx.fillRect(bx + 4, by + 10, width - 8, 18);
      // Tail lights
      ctx.fillStyle = "#991b1b";
      ctx.fillRect(bx + 4, by + height - 8, 10, 6);
      ctx.fillRect(bx + width - 14, by + height - 8, 10, 6);
    }
  };

  const drawPowerUp = (ctx: CanvasRenderingContext2D, p: PowerUp) => {
    if (p.collected) return;
    const pulse = Math.sin(Date.now() / 200) * 0.15 + 1;
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.scale(pulse, pulse);

    // Draw star outline
    ctx.fillStyle = p.type === "shield" ? "#3b82f6" : p.type === "speed" ? "#ef4444" : "#fbbf24";
    ctx.beginPath();
    for (let i = 0; i < 5; i++) {
      const angle = (i * 4 * Math.PI) / 5 - Math.PI / 2;
      const r = i % 2 === 0 ? 15 : 7;
      ctx.lineTo(r * Math.cos(angle), r * Math.sin(angle));
    }
    ctx.closePath();
    ctx.fill();

    // Icon in center
    ctx.fillStyle = "#fff";
    ctx.font = "bold 14px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    const icon = p.type === "shield" ? "🛡️" : p.type === "speed" ? "⚡" : "🧲";
    ctx.fillText(icon, 0, 0);
    ctx.restore();
  };

  const drawOilSlick = (ctx: CanvasRenderingContext2D, oil: OilSlick) => {
    ctx.fillStyle = "rgba(50,50,50,0.7)";
    ctx.beginPath();
    ctx.ellipse(oil.x, oil.y, 35, 20, 0, 0, Math.PI * 2);
    ctx.fill();
    // Shimmer effect
    ctx.fillStyle = "rgba(100,100,150,0.3)";
    ctx.beginPath();
    ctx.ellipse(oil.x - 5, oil.y - 3, 15, 8, 0, 0, Math.PI * 2);
    ctx.fill();
  };

  const drawRoadwork = (ctx: CanvasRenderingContext2D, rw: Roadwork) => {
    if (!rw.active) return;
    // Draw barrier
    ctx.fillStyle = "#f59e0b";
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 2;
    for (let i = 0; i < 3; i++) {
      const barY = rw.y - 20 + i * 15;
      ctx.fillRect(rw.x - 30, barY, 60, 12);
      ctx.strokeRect(rw.x - 30, barY, 60, 12);
      // Black stripes
      ctx.fillStyle = "#000";
      for (let j = 0; j < 5; j++) {
        ctx.fillRect(rw.x - 30 + j * 15, barY, 7, 12);
      }
      ctx.fillStyle = "#f59e0b";
    }
  };
  const drawVehicle = (ctx: CanvasRenderingContext2D, x: number, y: number, v: Vehicle, color: string, isPlayer: boolean) => {
    const { w, h } = VEHICLE_STATS[v];
    const bx = x - w / 2, by = y - h / 2;

    if (v === "motorcycle") {
      // Body
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.roundRect(bx + 2, by, w - 4, h, 8);
      ctx.fill();
      // Seat
      ctx.fillStyle = "#1f2937";
      ctx.fillRect(bx + 4, by + h * 0.35, w - 8, h * 0.2);
      // Wheels
      ctx.fillStyle = "#111";
      ctx.beginPath(); ctx.arc(x, by + 6, 6, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(x, by + h - 6, 6, 0, Math.PI * 2); ctx.fill();
      // Headlight
      if (isPlayer) {
        ctx.fillStyle = "#fef08a";
        ctx.beginPath(); ctx.arc(x, by + 3, 3, 0, Math.PI * 2); ctx.fill();
      } else {
        ctx.fillStyle = "#991b1b";
        ctx.fillRect(bx + 4, by + h - 6, w - 8, 4);
      }
    } else if (v === "truck") {
      // Cab
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.roundRect(bx, by, w, h, 4);
      ctx.fill();
      // Cargo area
      ctx.fillStyle = isPlayer ? "#065f46" : "#374151";
      ctx.fillRect(bx + 2, by + (isPlayer ? 0 : h * 0.45), w - 4, h * 0.45);
      ctx.strokeStyle = "#00000040";
      ctx.lineWidth = 1;
      ctx.strokeRect(bx + 2, by + (isPlayer ? 0 : h * 0.45), w - 4, h * 0.45);
      // Windshield
      ctx.fillStyle = "rgba(100,150,200,0.7)";
      ctx.fillRect(bx + 5, by + (isPlayer ? h - 28 : 8), w - 10, 18);
      // Lights
      if (isPlayer) {
        ctx.fillStyle = "#fef08a";
        ctx.fillRect(bx + 3, by + 3, 10, 8);
        ctx.fillRect(bx + w - 13, by + 3, 10, 8);
      } else {
        ctx.fillStyle = "#991b1b";
        ctx.fillRect(bx + 3, by + h - 8, 12, 6);
        ctx.fillRect(bx + w - 15, by + h - 8, 12, 6);
      }
    } else if (v === "lambo") {
      // Sleek wedge body
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.moveTo(bx + 4, by + h);
      ctx.lineTo(bx, by + h * 0.6);
      ctx.lineTo(bx + 4, by + 4);
      ctx.quadraticCurveTo(x, by, bx + w - 4, by + 4);
      ctx.lineTo(bx + w, by + h * 0.6);
      ctx.lineTo(bx + w - 4, by + h);
      ctx.closePath();
      ctx.fill();
      // Racing stripe
      ctx.fillStyle = "rgba(0,0,0,0.25)";
      ctx.fillRect(x - 3, by + 2, 6, h - 4);
      // Windshield (low, aggressive)
      ctx.fillStyle = "rgba(60,120,200,0.8)";
      ctx.fillRect(bx + 5, by + (isPlayer ? h - 24 : 6), w - 10, 16);
      // Side intakes
      ctx.fillStyle = "rgba(0,0,0,0.4)";
      ctx.fillRect(bx + 1, by + h * 0.45, 5, 10);
      ctx.fillRect(bx + w - 6, by + h * 0.45, 5, 10);
      if (isPlayer) {
        // Sharp LED headlights
        ctx.fillStyle = "#fef08a";
        ctx.fillRect(bx + 3, by + 5, 8, 4);
        ctx.fillRect(bx + w - 11, by + 5, 8, 4);
      } else {
        ctx.fillStyle = "#991b1b";
        ctx.fillRect(bx + 3, by + h - 6, 10, 4);
        ctx.fillRect(bx + w - 13, by + h - 6, 10, 4);
      }
    } else if (v === "junker") {
      // Dented, rusty old car
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.roundRect(bx, by, w, h, 4);
      ctx.fill();
      // Rust patches
      ctx.fillStyle = "#92400e";
      ctx.beginPath(); ctx.arc(bx + 8, by + 15, 5, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(bx + w - 6, by + h - 18, 6, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#78350f";
      ctx.beginPath(); ctx.arc(bx + w - 10, by + 25, 4, 0, Math.PI * 2); ctx.fill();
      // Dent marks (dark scratches)
      ctx.strokeStyle = "rgba(0,0,0,0.5)";
      ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(bx + 5, by + h * 0.3); ctx.lineTo(bx + 15, by + h * 0.35); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(bx + w - 5, by + h * 0.6); ctx.lineTo(bx + w - 15, by + h * 0.55); ctx.stroke();
      // Cracked windshield
      ctx.fillStyle = "rgba(100,140,160,0.5)";
      ctx.fillRect(bx + 5, by + (isPlayer ? h - 28 : 8), w - 10, 18);
      ctx.strokeStyle = "rgba(255,255,255,0.3)";
      ctx.lineWidth = 1;
      const wy = by + (isPlayer ? h - 28 : 8);
      ctx.beginPath(); ctx.moveTo(bx + 8, wy + 3); ctx.lineTo(bx + w / 2, wy + 10); ctx.lineTo(bx + w - 10, wy + 5); ctx.stroke();
      // Mismatched headlights (one dim, one broken)
      if (isPlayer) {
        ctx.fillStyle = "#fef08a80";
        ctx.fillRect(bx + 4, by + 4, 8, 6);
        ctx.fillStyle = "#44403c";
        ctx.fillRect(bx + w - 12, by + 4, 8, 6);
      } else {
        ctx.fillStyle = "#991b1b80";
        ctx.fillRect(bx + 4, by + h - 8, 8, 5);
        ctx.fillStyle = "#44403c";
        ctx.fillRect(bx + w - 12, by + h - 8, 8, 5);
      }
      // Exhaust smoke (player only)
      if (isPlayer) {
        ctx.fillStyle = "rgba(120,120,120,0.3)";
        ctx.beginPath(); ctx.arc(bx + w - 4, by + h + 6, 4, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(bx + w - 8, by + h + 12, 5, 0, Math.PI * 2); ctx.fill();
      }
    } else if (v === "bus") {
      // Long rectangular bus body
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.roundRect(bx, by, w, h, 4);
      ctx.fill();
      // Window row (3 windows each side)
      ctx.fillStyle = "rgba(150,200,240,0.7)";
      const winH = 10, winW = 10, winGap = 4;
      for (let i = 0; i < 3; i++) {
        const wy = by + 14 + i * (winH + winGap);
        ctx.fillRect(bx + 3, wy, winW, winH);
        ctx.fillRect(bx + w - winW - 3, wy, winW, winH);
      }
      // Door (side stripe)
      ctx.fillStyle = "rgba(0,0,0,0.2)";
      ctx.fillRect(bx + w / 2 - 4, by + 10, 8, h - 20);
      // Destination sign (front)
      if (isPlayer) {
        ctx.fillStyle = "#fbbf24";
        ctx.fillRect(bx + 6, by + 3, w - 12, 8);
        ctx.fillStyle = "#111";
        ctx.font = "bold 6px sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("EXPRESS", x, by + 7);
      }
      // Headlights / taillights
      if (isPlayer) {
        ctx.fillStyle = "#fef08a";
        ctx.fillRect(bx + 3, by + 2, 10, 6);
        ctx.fillRect(bx + w - 13, by + 2, 10, 6);
      } else {
        ctx.fillStyle = "#991b1b";
        ctx.fillRect(bx + 3, by + h - 8, 12, 6);
        ctx.fillRect(bx + w - 15, by + h - 8, 12, 6);
      }
      // Wheels (visible on the side)
      ctx.fillStyle = "#111";
      ctx.beginPath(); ctx.arc(bx + 8, by + h - 4, 5, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(bx + w - 8, by + h - 4, 5, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(bx + 8, by + 12, 5, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(bx + w - 8, by + 12, 5, 0, Math.PI * 2); ctx.fill();
    } else {
      // Car (default)
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.roundRect(bx, by, w, h, 6);
      ctx.fill();
      // Windshield
      ctx.fillStyle = "rgba(100,150,200,0.7)";
      ctx.fillRect(bx + 4, by + (isPlayer ? h - 30 : 10), w - 8, 20);
      if (isPlayer) {
        ctx.fillStyle = "#fef08a";
        ctx.fillRect(bx + 4, by + 4, 10, 8);
        ctx.fillRect(bx + w - 14, by + 4, 10, 8);
      } else {
        ctx.fillStyle = "#991b1b";
        ctx.fillRect(bx + 4, by + h - 8, 10, 6);
        ctx.fillRect(bx + w - 14, by + h - 8, 10, 6);
      }
    }
  };

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Grass
    ctx.fillStyle = "#16a34a";
    ctx.fillRect(0, 0, GRASS_W, CH);
    ctx.fillRect(CW - GRASS_W, 0, GRASS_W, CH);

    // Road
    ctx.fillStyle = "#374151";
    ctx.fillRect(GRASS_W, 0, ROAD_W, CH);

    // Lane dashes
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 3;
    ctx.setLineDash([20, 20]);
    ctx.lineDashOffset = -(roadOffRef.current % 40);
    for (let i = 1; i < LANES; i++) {
      const x = GRASS_W + i * LANE_W;
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, CH); ctx.stroke();
    }
    ctx.setLineDash([]);
    ctx.lineDashOffset = 0;

    // Ramps
    rampsRef.current.forEach((r) => {
      // Draw wedge shape (triangle)
      ctx.fillStyle = "#f59e0b"; // orange
      ctx.beginPath();
      ctx.moveTo(r.x - 30, r.y + 15); // bottom left
      ctx.lineTo(r.x + 30, r.y + 15); // bottom right
      ctx.lineTo(r.x, r.y - 15); // top center
      ctx.closePath();
      ctx.fill();
      // Darker outline
      ctx.strokeStyle = "#ea580c";
      ctx.lineWidth = 2;
      ctx.stroke();
      // Stripes for visibility
      ctx.strokeStyle = "#fbbf24";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(r.x - 15, r.y + 5);
      ctx.lineTo(r.x, r.y - 10);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(r.x + 15, r.y + 5);
      ctx.lineTo(r.x, r.y - 10);
      ctx.stroke();
      // Hint text
      ctx.fillStyle = "#fbbf24";
      ctx.font = "bold 14px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      const pulse = Math.sin(Date.now() / 200) * 0.3 + 1; // pulsing effect
      ctx.save();
      ctx.translate(r.x, r.y - 35);
      ctx.scale(pulse, pulse);
      ctx.fillText("Hit ramp to jump!", 0, 0);
      ctx.restore();
    });

    // Oil slicks
    oilSlicksRef.current.forEach((oil) => drawOilSlick(ctx, oil));

    // Roadwork barriers
    roadworksRef.current.forEach((rw) => drawRoadwork(ctx, rw));

    // Coins
    coinsRef.current.forEach((c) => {
      if (c.collected) return;
      ctx.fillStyle = "#fbbf24";
      ctx.beginPath(); ctx.arc(c.x, c.y, 12, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = "#f59e0b"; ctx.lineWidth = 2; ctx.stroke();
      // $ symbol
      ctx.fillStyle = "#92400e";
      ctx.font = "bold 12px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("$", c.x, c.y);
    });

    // Power-ups
    powerUpsRef.current.forEach((p) => drawPowerUp(ctx, p));

    // Obstacles (varied types)
    obsRef.current.forEach((obs) => drawObstacleVehicle(ctx, obs));

    // Player (with jump elevation and shield)
    const v = vehicleRef.current;
    const playerColors: Record<Vehicle, string> = {
      car: "#10b981", motorcycle: "#f59e0b", truck: "#10b981",
      lambo: "#ef4444", junker: "#8b7355", bus: "#f59e0b",
    };
    let playerY = PLAYER_Y;
    let shadowOffset = 0;
    if (jumpingRef.current) {
      // Parabolic arc: goes up then down
      const t = jumpProgressRef.current;
      const jumpHeight = 100; // max height (increased for more dramatic jump)
      const arc = Math.sin(t * Math.PI); // 0 to 1 to 0
      playerY = PLAYER_Y - jumpHeight * arc;
      shadowOffset = jumpHeight * arc;
    }
    // Draw shadow if jumping
    if (jumpingRef.current && shadowOffset > 10) {
      ctx.fillStyle = "rgba(0,0,0,0.3)";
      ctx.beginPath();
      const shadowSize = 40 + shadowOffset * 0.3;
      ctx.ellipse(laneX(playerLaneRef.current), PLAYER_Y + 10, shadowSize, 15, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    // Draw shield if active
    if (activePowerUpRef.current?.type === "shield") {
      ctx.strokeStyle = "#3b82f6";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(laneX(playerLaneRef.current), playerY, 40, 0, Math.PI * 2);
      ctx.stroke();
      ctx.strokeStyle = "#60a5fa";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(laneX(playerLaneRef.current), playerY, 36, 0, Math.PI * 2);
      ctx.stroke();
    }
    drawVehicle(ctx, laneX(playerLaneRef.current), playerY, v, playerColors[v], true);

    // HUD (top-left)
    if (stateRef.current === "PLAYING") {
      // Level indicator
      ctx.fillStyle = "rgba(0,0,0,0.6)";
      ctx.fillRect(10, 10, 120, 30);
      ctx.fillStyle = "#60a5fa";
      ctx.font = "bold 14px sans-serif";
      ctx.textAlign = "left";
      ctx.textBaseline = "middle";
      const levelText = levelRef.current <= 10 ? `Level ${levelRef.current}` : "Endless";
      ctx.fillText(levelText, 18, 25);

      // Lives (hearts)
      const heartX = 140;
      for (let i = 0; i < 3; i++) {
        ctx.font = "20px sans-serif";
        ctx.fillText(i < livesRef.current ? "❤️" : "🖤", heartX + i * 28, 25);
      }

      // Active power-up indicator (top-right)
      if (activePowerUpRef.current) {
        const pw = 80, ph = 30;
        const px = CW - pw - 10, py = 10;
        ctx.fillStyle = "rgba(0,0,0,0.6)";
        ctx.fillRect(px, py, pw, ph);
        const icon = activePowerUpRef.current.type === "shield" ? "🛡️" : activePowerUpRef.current.type === "speed" ? "⚡" : "🧲";
        ctx.font = "18px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(icon, px + 20, py + ph / 2 + 2);
        // Timer bar
        const timeBarW = 45;
        const timePct = Math.max(0, activePowerUpRef.current.timeLeft / 300); // 5s = 300 frames at 60fps
        ctx.fillStyle = "#374151";
        ctx.fillRect(px + 30, py + 10, timeBarW, 10);
        ctx.fillStyle = activePowerUpRef.current.type === "shield" ? "#3b82f6" : activePowerUpRef.current.type === "speed" ? "#ef4444" : "#fbbf24";
        ctx.fillRect(px + 30, py + 10, timeBarW * timePct, 10);
      }

      // Speed bar (bottom-right)
      const spd = speedRef.current;
      const pct = Math.min(1, (spd - 1) / (MAX_SPEED - 1));
      const barH = 120, barW = 12, bx = CW - 22, by = CH - barH - 20;
      ctx.fillStyle = "rgba(0,0,0,0.4)";
      ctx.fillRect(bx - 2, by - 2, barW + 4, barH + 4);
      const grad = ctx.createLinearGradient(0, by + barH, 0, by);
      grad.addColorStop(0, "#22c55e");
      grad.addColorStop(0.6, "#eab308");
      grad.addColorStop(1, "#ef4444");
      ctx.fillStyle = grad;
      ctx.fillRect(bx, by + barH * (1 - pct), barW, barH * pct);
      ctx.fillStyle = "#fff";
      ctx.font = "bold 9px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(Math.round(spd * 20) + "", bx + barW / 2, by - 6);
      ctx.fillText("km/h", bx + barW / 2, by + barH + 14);
    }

    // Level-up flash notification
    if (levelUpFlashRef.current > 0) {
      levelUpFlashRef.current--;
      const alpha = Math.min(1, levelUpFlashRef.current / 30); // fade out in last 0.5s
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.font = "bold 36px monospace";
      ctx.textAlign = "center";
      ctx.fillStyle = "#22c55e"; // green-500
      ctx.fillText(`LEVEL ${levelRef.current}`, CW / 2, CH / 2 - 10);
      ctx.font = "18px monospace";
      ctx.fillStyle = "#a3e635"; // lime-400
      const config = levelRef.current <= 10 ? LEVEL_CONFIGS[levelRef.current - 1] : null;
      if (config) ctx.fillText(config.name, CW / 2, CH / 2 + 20);
      ctx.restore();
    }
  }, []);

  const spawnObstacle = () => {
    const level = levelRef.current;
    const config = level <= 10 ? LEVEL_CONFIGS[level - 1] : null;

    const dangerZone = 70 * 2.5;
    const blocked = new Set<number>();
    for (const o of obsRef.current) if (o.y < dangerZone) blocked.add(o.lane);
    const avail = [0, 1, 2].filter(l => !blocked.has(l));
    if (avail.length <= 1) return;

    const lane = avail[Math.floor(Math.random() * avail.length)];
    const would = new Set(blocked); would.add(lane);
    if (would.size >= LANES) return;

    // Determine obstacle type based on level
    let obsType: ObstacleType = "car";
    const rand = Math.random();
    if (level >= 3) {
      if (rand < 0.15) obsType = "motorcycle"; // fast, narrow
      else if (rand < 0.35) obsType = "truck"; // slow, wide
      else obsType = "car";
    }

    const { width, height } = OBSTACLE_TYPES[obsType];
    const carY = -height / 2;
    obsRef.current.push({
      x: laneX(lane), y: carY, lane,
      color: OBS_COLORS[Math.floor(Math.random() * OBS_COLORS.length)],
      type: obsType,
      width,
      height,
    });

    // 20% chance to spawn a ramp directly before this obstacle (level 2+)
    if (level >= 2 && Math.random() < 0.20) {
      const rampY = carY - 150;
      rampsRef.current.push({
        x: laneX(lane),
        y: rampY,
        lane,
      });
    }
  };

  const spawnObstacleItem = () => {
    const level = levelRef.current;
    if (level < 3 || !LEVEL_CONFIGS[Math.min(level - 1, 9)]?.obstacles) return;

    const rand = Math.random();
    const lane = Math.floor(Math.random() * LANES);
    const itemY = -30;

    // Oil slick (15% chance, level 3+)
    if (rand < 0.15 && level >= 3) {
      oilSlicksRef.current.push({ x: laneX(lane), y: itemY, lane });
    }
    // Roadwork barrier (10% chance, level 5+, blocks lane for 2 seconds)
    else if (rand < 0.10 && level >= 5) {
      roadworksRef.current.push({ x: laneX(lane), y: itemY, lane, active: true });
    }
  };

  const spawnCoin = () => {
    const lane = Math.floor(Math.random() * LANES);
    const cx = laneX(lane);
    // Don't spawn if an obstacle is nearby in the same lane
    for (const o of obsRef.current) {
      if (o.lane === lane && Math.abs(o.y - (-20)) < 80) return;
    }
    coinsRef.current.push({ x: cx, y: -20, collected: false, lane });

    // 10% chance to spawn power-up instead of regular coin (level 2+)
    if (levelRef.current >= 2 && Math.random() < 0.10) {
      const types: PowerUpType[] = ["shield", "speed", "magnet"];
      const type = types[Math.floor(Math.random() * types.length)];
      powerUpsRef.current.push({ x: cx, y: -20, lane, type, collected: false });
    }
  };

  const checkCollision = useCallback(() => {
    const px = laneX(playerLaneRef.current);
    const v = vehicleRef.current;
    const { w: pw, h: ph } = VEHICLE_STATS[v];

    // Check ramp collision (trigger jump)
    for (let i = rampsRef.current.length - 1; i >= 0; i--) {
      const r = rampsRef.current[i];
      const dx = Math.abs(px - r.x);
      const dy = Math.abs(PLAYER_Y - r.y);
      if (dx < 35 && dy < 30 && !jumpingRef.current) {
        jumpingRef.current = true;
        jumpProgressRef.current = 0;
        rampsRef.current.splice(i, 1);
      }
    }

    // Check oil slick collision (slow down)
    for (let i = oilSlicksRef.current.length - 1; i >= 0; i--) {
      const oil = oilSlicksRef.current[i];
      const dx = Math.abs(px - oil.x);
      const dy = Math.abs(PLAYER_Y - oil.y);
      if (dx < 35 && dy < 25) {
        oilSlowRef.current = 120; // 2 seconds at 60fps
        oilSlicksRef.current.splice(i, 1);
      }
    }

    // Check roadwork collision (treat as obstacle)
    if (!jumpingRef.current) {
      for (const rw of roadworksRef.current) {
        if (!rw.active) continue;
        const dx = Math.abs(px - rw.x);
        const dy = Math.abs(PLAYER_Y - rw.y);
        if (dx < 40 && dy < 30) {
          return true; // collision
        }
      }
    }

    // Check obstacle collision (skip if jumping or has shield)
    if (!jumpingRef.current) {
      for (const o of obsRef.current) {
        const dx = Math.abs(px - o.x);
        const dy = Math.abs(PLAYER_Y - o.y);
        const hitboxW = (pw / 2 + o.width / 2) * 0.75;
        const hitboxH = (ph / 2 + o.height / 2) * 0.75;
        if (dx < hitboxW && dy < hitboxH) {
          // Check shield
          if (activePowerUpRef.current?.type === "shield") {
            activePowerUpRef.current = null; // consume shield
            return false;
          }
          return true; // collision
        }
      }
    }

    // Collect coins
    for (const c of coinsRef.current) {
      if (!c.collected) {
        const collectRadius = activePowerUpRef.current?.type === "magnet" ? 80 : 30;
        if (Math.abs(px - c.x) < collectRadius && Math.abs(PLAYER_Y - c.y) < collectRadius) {
          c.collected = true;
          scoreRef.current += 10;
          setScore(scoreRef.current);
          setScoreFlash(true);
          setTimeout(() => setScoreFlash(false), 200);
          if (scoreRef.current > bestRef.current) {
            bestRef.current = scoreRef.current;
            setBestScore(scoreRef.current);
            localStorage.setItem("pb-car-racer", scoreRef.current.toString());
          }
        }
      }
    }

    // Collect power-ups
    for (const p of powerUpsRef.current) {
      if (!p.collected) {
        if (Math.abs(px - p.x) < 30 && Math.abs(PLAYER_Y - p.y) < 30) {
          p.collected = true;
          activePowerUpRef.current = { type: p.type, timeLeft: 300 }; // 5 seconds
          scoreRef.current += 20; // bonus points for power-up
          setScore(scoreRef.current);
        }
      }
    }

    return false;
  }, []);

  const gameLoop = useCallback(() => {
    if (stateRef.current !== "PLAYING") { loopRef.current = null; return; }

    const level = levelRef.current;
    const config = level <= 10 ? LEVEL_CONFIGS[level - 1] : null;

    // Base speed increases over distance (starting from vehicle's own base speed)
    const vBase = VEHICLE_STATS[vehicleRef.current].baseSpeed;
    const levelSpeedMult = config?.speedMultiplier || 1.0 + (level - 10) * 0.05; // endless scaling
    baseSpeedRef.current = Math.min(MAX_SPEED * 0.7, vBase * levelSpeedMult + distRef.current * SPEED_INC);

    // Apply oil slick slow
    if (oilSlowRef.current > 0) {
      baseSpeedRef.current *= 0.5; // half speed
      oilSlowRef.current--;
    }

    // Apply power-up effects
    if (activePowerUpRef.current) {
      activePowerUpRef.current.timeLeft--;
      if (activePowerUpRef.current.timeLeft <= 0) {
        activePowerUpRef.current = null;
      } else if (activePowerUpRef.current.type === "speed") {
        baseSpeedRef.current *= 1.5; // 50% speed boost
      }
    }

    // Apply player boost/brake
    if (keysRef.current.up) boostRef.current = Math.min(4, boostRef.current + BOOST_AMOUNT);
    else if (keysRef.current.down) boostRef.current = Math.max(-2, boostRef.current - BRAKE_AMOUNT);
    else boostRef.current *= 0.95; // decay toward 0

    speedRef.current = Math.max(1.5, Math.min(MAX_SPEED, baseSpeedRef.current + boostRef.current));
    setDisplaySpeed(Math.round(speedRef.current * 20));

    roadOffRef.current += speedRef.current;
    distRef.current += speedRef.current;
    levelDistRef.current += speedRef.current;

    const newScore = Math.floor(distRef.current / 10);
    if (newScore > scoreRef.current) {
      scoreRef.current = newScore;
      setScore(scoreRef.current);
      if (scoreRef.current > bestRef.current) {
        bestRef.current = scoreRef.current;
        setBestScore(scoreRef.current);
        localStorage.setItem("pb-car-racer", scoreRef.current.toString());
      }
    }

    // Check level completion
    if (config && levelDistRef.current >= config.targetDist) {
      levelRef.current++;
      setCurrentLevel(levelRef.current);
      // Bonus life every 5 levels (cap at 5)
      if (levelRef.current % 5 === 1 && livesRef.current < 5) {
        livesRef.current++;
        setLives(livesRef.current);
      }
      levelDistRef.current = 0;
      obsRef.current = [];
      coinsRef.current = [];
      rampsRef.current = [];
      oilSlicksRef.current = [];
      roadworksRef.current = [];
      powerUpsRef.current = [];
      levelUpFlashRef.current = 90; // ~1.5 seconds at 60fps
    }

    // Lane changes
    if (keysRef.current.left && playerLaneRef.current > 0) {
      playerLaneRef.current--; keysRef.current.left = false;
    }
    if (keysRef.current.right && playerLaneRef.current < LANES - 1) {
      playerLaneRef.current++; keysRef.current.right = false;
    }

    // Spawn rates from level config
    const spawnRate = config?.spawnRate || 0.012 + (level - 10) * 0.002;
    const coinRate = config?.coinRate || 0.008;
    if (Math.random() < spawnRate) spawnObstacle();
    if (Math.random() < coinRate) spawnCoin();
    if (config?.obstacles && Math.random() < 0.005) spawnObstacleItem();

    // Update jump progress
    if (jumpingRef.current) {
      jumpProgressRef.current += 0.03;
      if (jumpProgressRef.current >= 1) {
        jumpingRef.current = false;
        jumpProgressRef.current = 0;
      }
    }

    // Update positions
    obsRef.current.forEach(o => { o.y += speedRef.current; });
    coinsRef.current.forEach(c => { c.y += speedRef.current; });
    rampsRef.current.forEach(r => { r.y += speedRef.current; });
    oilSlicksRef.current.forEach(oil => { oil.y += speedRef.current; });
    roadworksRef.current.forEach(rw => { rw.y += speedRef.current; });
    powerUpsRef.current.forEach(p => { p.y += speedRef.current; });

    // Filter out off-screen
    obsRef.current = obsRef.current.filter(o => o.y < CH + 50);
    coinsRef.current = coinsRef.current.filter(c => c.y < CH + 50);
    rampsRef.current = rampsRef.current.filter(r => r.y < CH + 50);
    oilSlicksRef.current = oilSlicksRef.current.filter(oil => oil.y < CH + 50);
    roadworksRef.current = roadworksRef.current.filter(rw => rw.y < CH + 50);
    powerUpsRef.current = powerUpsRef.current.filter(p => p.y < CH + 50);

    // Check collision
    if (checkCollision()) {
      livesRef.current--;
      setLives(livesRef.current);

      if (livesRef.current <= 0) {
        stateRef.current = "GAME_OVER";
        setDisplayState("GAME_OVER");
        loopRef.current = null;
        draw();
        return;
      } else {
        // Lost a life, respawn with brief invincibility
        playerLaneRef.current = 1;
        activePowerUpRef.current = { type: "shield", timeLeft: 180 }; // 3s shield
        obsRef.current = obsRef.current.filter(o => o.y > PLAYER_Y - 150); // clear nearby obstacles
      }
    }

    draw();
    loopRef.current = requestAnimationFrame(gameLoop);
  }, [draw, checkCollision]);

  const startGame = useCallback(() => {
    vehicleRef.current = vehicle;
    playerLaneRef.current = 1;
    roadOffRef.current = 0;
    const vSpeed = VEHICLE_STATS[vehicle].baseSpeed;
    speedRef.current = vSpeed;
    baseSpeedRef.current = vSpeed;
    boostRef.current = 0;
    obsRef.current = [];
    coinsRef.current = [];
    rampsRef.current = [];
    oilSlicksRef.current = [];
    roadworksRef.current = [];
    powerUpsRef.current = [];
    jumpingRef.current = false;
    jumpProgressRef.current = 0;
    scoreRef.current = 0;
    distRef.current = 0;
    levelDistRef.current = 0;
    levelRef.current = 1;
    livesRef.current = 3;
    activePowerUpRef.current = null;
    oilSlowRef.current = 0;
    levelUpFlashRef.current = 0;
    setScore(0);
    setCurrentLevel(1);
    setLives(3);
    setDisplaySpeed(Math.round(vSpeed * 20));
    keysRef.current = { left: false, right: false, up: false, down: false };
    stateRef.current = "PLAYING";
    setDisplayState("PLAYING");
    draw();
    loopRef.current = requestAnimationFrame(gameLoop);
  }, [draw, gameLoop, vehicle]);

  // Keyboard
  useEffect(() => {
    const onDown = (e: KeyboardEvent) => {
      if (stateRef.current !== "PLAYING") return;
      if (e.key === "ArrowLeft" || e.key === "a") { e.preventDefault(); keysRef.current.left = true; }
      else if (e.key === "ArrowRight" || e.key === "d") { e.preventDefault(); keysRef.current.right = true; }
      else if (e.key === "ArrowUp" || e.key === "w") { e.preventDefault(); keysRef.current.up = true; }
      else if (e.key === "ArrowDown" || e.key === "s") { e.preventDefault(); keysRef.current.down = true; }
    };
    const onUp = (e: KeyboardEvent) => {
      if (e.key === "ArrowUp" || e.key === "w") keysRef.current.up = false;
      if (e.key === "ArrowDown" || e.key === "s") keysRef.current.down = false;
    };
    window.addEventListener("keydown", onDown);
    window.addEventListener("keyup", onUp);
    return () => { window.removeEventListener("keydown", onDown); window.removeEventListener("keyup", onUp); };
  }, []);

  // Touch controls
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onStart = (e: TouchEvent) => {
      if (stateRef.current !== "PLAYING") return;
      e.preventDefault();
      touchStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    };
    const onMove = (e: TouchEvent) => { if (stateRef.current === "PLAYING") e.preventDefault(); };
    const onEnd = (e: TouchEvent) => {
      if (!touchStartRef.current || stateRef.current !== "PLAYING") return;
      e.preventDefault();
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const tx = e.changedTouches[0].clientX;
      const ty = e.changedTouches[0].clientY;
      const dx = tx - touchStartRef.current.x;
      const dy = ty - touchStartRef.current.y;

      if (Math.abs(dy) > Math.abs(dx) && Math.abs(dy) > 30) {
        // Vertical swipe: boost / brake
        if (dy < 0) boostRef.current = Math.min(4, boostRef.current + 2);
        else boostRef.current = Math.max(-2, boostRef.current - 2);
      } else if (Math.abs(dx) > 30) {
        if (dx > 0 && playerLaneRef.current < LANES - 1) playerLaneRef.current++;
        else if (dx < 0 && playerLaneRef.current > 0) playerLaneRef.current--;
      } else {
        const relX = tx - rect.left;
        const center = rect.width / 2;
        if (relX < center && playerLaneRef.current > 0) playerLaneRef.current--;
        else if (relX > center && playerLaneRef.current < LANES - 1) playerLaneRef.current++;
      }
      touchStartRef.current = null;
    };
    el.addEventListener("touchstart", onStart, { passive: false });
    el.addEventListener("touchmove", onMove, { passive: false });
    el.addEventListener("touchend", onEnd, { passive: false });
    return () => {
      el.removeEventListener("touchstart", onStart);
      el.removeEventListener("touchmove", onMove);
      el.removeEventListener("touchend", onEnd);
    };
  }, []);

  useEffect(() => { draw(); }, [draw]);

  const handleShare = async () => {
    const levelText = levelRef.current <= 10 ? `reached level ${levelRef.current}` : "conquered all 10 levels";
    const text = `I scored ${scoreRef.current} and ${levelText} in Car Racer driving a ${VEHICLE_STATS[vehicleRef.current].label}! https://playmini.fun/car-racer`;
    if (navigator.share) { try { await navigator.share({ text }); } catch {} }
    else { try { await navigator.clipboard.writeText(text); alert("Copied!"); } catch {} }
  };

  return (
    <div ref={containerRef} className="flex flex-col items-center gap-4" style={{ touchAction: "none" }}>
      {/* Score & Level Info */}
      <div className="flex gap-6 text-center">
        <div>
          <div className="text-xs text-gray-500 uppercase tracking-wider">Level</div>
          <div className="text-3xl font-black text-purple-400 tabular-nums">{currentLevel <= 10 ? currentLevel : "∞"}</div>
        </div>
        <div>
          <div className="text-xs text-gray-500 uppercase tracking-wider">Score</div>
          <div className={`text-3xl font-black tabular-nums transition-all duration-150 ${scoreFlash ? "text-yellow-400 scale-125" : "text-blue-400"}`}>{score}</div>
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
        <canvas ref={canvasRef} width={CW} height={CH} className="rounded-2xl max-w-full h-auto" style={{ touchAction: "none" }} />

        {displayState === "START" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/85 rounded-2xl backdrop-blur-sm">
            <div className="text-5xl mb-3">🏎️</div>
            <h2 className="text-3xl font-black text-blue-400 mb-4">Car Racer</h2>

            {/* Vehicle selector */}
            <div className="flex flex-wrap gap-2 mb-4 justify-center max-w-[360px]">
              {(["lambo", "car", "motorcycle", "junker", "truck", "bus"] as Vehicle[]).map((v) => {
                const s = VEHICLE_STATS[v];
                const speedLabel = s.baseSpeed >= 4 ? "Fast" : s.baseSpeed >= 3 ? "Med" : "Slow";
                const speedColor = s.baseSpeed >= 4 ? "text-red-400" : s.baseSpeed >= 3 ? "text-yellow-400" : "text-green-400";
                return (
                  <button
                    key={v}
                    onClick={() => setVehicle(v)}
                    className={`px-3 py-2 rounded-xl font-bold text-sm transition-all flex flex-col items-center min-w-[70px] ${
                      vehicle === v
                        ? "bg-blue-600 text-white ring-2 ring-blue-400 scale-105"
                        : "bg-slate-800 text-gray-300 hover:bg-slate-700"
                    }`}
                  >
                    <span className="text-lg">{s.emoji}</span>
                    <span className="text-xs">{s.label}</span>
                    <span className={`text-[10px] ${vehicle === v ? "text-blue-200" : speedColor}`}>{speedLabel}</span>
                  </button>
                );
              })}
            </div>

            <p className="text-gray-400 mb-1 text-xs">Left/Right: steer | Up/Down: speed</p>
            <p className="text-gray-500 mb-4 text-xs">Mobile: swipe to steer, swipe up/down for speed</p>
            <button
              onClick={startGame}
              className="px-10 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-2xl transition-all hover:scale-105 active:scale-95"
            >
              Play
            </button>
          </div>
        )}

        {displayState === "GAME_OVER" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/85 rounded-2xl backdrop-blur-sm">
            <h2 className="text-3xl font-black text-red-400 mb-4">Game Over</h2>
            <div className="bg-slate-900/80 rounded-xl px-6 py-3 mb-6">
              <p className="text-white text-lg font-bold">Level Reached: {currentLevel}</p>
              <p className="text-white text-lg font-bold">Score: {score}</p>
              {score >= bestScore && score > 0 && (
                <p className="text-yellow-400 text-sm font-bold mt-1">New Best!</p>
              )}
            </div>
            <div className="flex gap-3">
              <button onClick={startGame} className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all hover:scale-105 active:scale-95">
                Play Again
              </button>
              <button onClick={handleShare} className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-all hover:scale-105 active:scale-95">
                Share
              </button>
              <DownloadButton canvasRef={canvasRef} filename="car-racer-score" label="Save" />
            </div>
          </div>
        )}
      </div>

      {displayState === "PLAYING" && (
        <div className="text-center text-xs text-gray-500 max-w-md">
          <p>Collect coins (+10) and power-ups! Watch for oil slicks and roadwork. Jump ramps to avoid obstacles!</p>
          <p className="mt-1">Power-ups: 🛡️ Shield | ⚡ Speed Boost | 🧲 Coin Magnet</p>
        </div>
      )}
    </div>
  );
}
