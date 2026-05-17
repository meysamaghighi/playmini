"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

const FONT = "'Caveat', 'Comic Sans MS', cursive";

// ──────────────────────────────────────────────────────────────────────────
// Types & constants
// ──────────────────────────────────────────────────────────────────────────

type GameState = "start" | "modeSelect" | "difficulty" | "playing" | "gameOver";
type Mode = "1p" | "2p";
type Difficulty = "easy" | "medium" | "hard";
type PlaneKind = "scout" | "fighter" | "bomber";
type Player = 1 | 2;

interface PlaneType {
  kind: PlaneKind;
  name: string;
  cost: number;
  speed: number;
  hp: number;
  damage: number;
  width: number;
  emoji: string;
}

const PLANE_TYPES: Record<PlaneKind, PlaneType> = {
  scout: { kind: "scout", name: "Scout", cost: 4, speed: 0.75, hp: 1, damage: 8, width: 7, emoji: "🛩️" },
  fighter: { kind: "fighter", name: "Fighter", cost: 9, speed: 0.5, hp: 3, damage: 16, width: 10, emoji: "✈️" },
  bomber: { kind: "bomber", name: "Bomber", cost: 18, speed: 0.32, hp: 5, damage: 32, width: 13, emoji: "🚀" },
};

const MAX_HP = 120;
const UPGRADE_COST = 30;
const COIN_INTERVAL_TICKS = 12; // at 30fps → +1 coin every 0.4s
const STARTING_COINS = 12;
const TICK_MS = 33;
const CANNON_RANGE = 38;
const CANNON_COOLDOWN_TICKS = 70;
const CANNON_DAMAGE = 4;
const CANNONBALL_SPEED = 1.2;

const DIFFICULTY_CONFIG: Record<Difficulty, { actionEveryTicks: [number, number]; upgradeChance: number; preferBomber: number }> = {
  easy: { actionEveryTicks: [90, 140], upgradeChance: 0.05, preferBomber: 0.0 },
  medium: { actionEveryTicks: [50, 80], upgradeChance: 0.12, preferBomber: 0.2 },
  hard: { actionEveryTicks: [25, 45], upgradeChance: 0.2, preferBomber: 0.35 },
};

let idCounter = 0;
const nextId = () => ++idCounter;

interface Plane {
  id: number;
  player: Player;
  kind: PlaneKind;
  x: number;
  y: number;
  baseY: number;
  hp: number;
  maxHp: number;
  damage: number;
  speed: number;
  wobbleSeed: number;
  level: number;
}

interface Cannonball {
  id: number;
  player: Player;
  x: number;
  y: number;
  vx: number;
  vy: number;
  age: number;
}

interface Explosion {
  id: number;
  x: number;
  y: number;
  age: number;
  size: number;
}

interface CoinPop {
  id: number;
  player: Player;
  age: number;
}

interface PlayerState {
  hp: number;
  coins: number;
  level: number;
  hpFlashAge: number;
  isAI: boolean;
}

interface SimState {
  planes: Plane[];
  cannonballs: Cannonball[];
  explosions: Explosion[];
  coinPops: CoinPop[];
  p1: PlayerState;
  p2: PlayerState;
  tick: number;
  aiNext: { 1: number; 2: number };
  cannonNext: { 1: number; 2: number };
  difficulty: Difficulty;
  winner: Player | null;
}

const makeInitialSim = (mode: Mode, difficulty: Difficulty): SimState => ({
  planes: [],
  cannonballs: [],
  explosions: [],
  coinPops: [],
  p1: { hp: MAX_HP, coins: STARTING_COINS, level: 1, hpFlashAge: 999, isAI: false },
  p2: { hp: MAX_HP, coins: STARTING_COINS, level: 1, hpFlashAge: 999, isAI: mode === "1p" },
  tick: 0,
  aiNext: { 1: 0, 2: 60 },
  cannonNext: { 1: 90, 2: 90 },
  difficulty,
  winner: null,
});

// ──────────────────────────────────────────────────────────────────────────
// Sound manager (Web Audio synth, no asset files)
// ──────────────────────────────────────────────────────────────────────────

class SoundManager {
  private ctx: AudioContext | null = null;
  enabled = false;
  muted = false;

  init() {
    if (this.ctx) return;
    try {
      const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AC();
      this.enabled = true;
    } catch {
      this.enabled = false;
    }
  }

  private tone(freq: number, dur: number, type: OscillatorType = "sine", gain = 0.08) {
    if (!this.enabled || !this.ctx || this.muted) return;
    const ctx = this.ctx;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    osc.connect(g);
    g.connect(ctx.destination);
    g.gain.setValueAtTime(gain, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + dur);
    osc.start();
    osc.stop(ctx.currentTime + dur);
  }

  private noise(dur: number, gain = 0.18) {
    if (!this.enabled || !this.ctx || this.muted) return;
    const ctx = this.ctx;
    const bufferSize = Math.floor(ctx.sampleRate * dur);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, 2);
    }
    const src = ctx.createBufferSource();
    src.buffer = buffer;
    const g = ctx.createGain();
    g.gain.value = gain;
    src.connect(g);
    g.connect(ctx.destination);
    src.start();
  }

  launch(kind: PlaneKind) {
    const base = kind === "scout" ? 420 : kind === "fighter" ? 320 : 220;
    this.tone(base, 0.1, "square", 0.05);
    this.tone(base * 1.5, 0.08, "sine", 0.04);
  }
  hit() {
    this.tone(180, 0.08, "square", 0.06);
  }
  explode() {
    this.noise(0.3);
    this.tone(80, 0.2, "sawtooth", 0.06);
  }
  warshipHit() {
    this.noise(0.4, 0.25);
    this.tone(60, 0.35, "sawtooth", 0.1);
  }
  cannon() {
    this.tone(200, 0.06, "square", 0.04);
    this.noise(0.08, 0.08);
  }
  coin() {
    this.tone(880, 0.04, "sine", 0.03);
    setTimeout(() => this.tone(1320, 0.05, "sine", 0.03), 35);
  }
  upgrade() {
    this.tone(523, 0.1, "triangle", 0.06);
    setTimeout(() => this.tone(659, 0.1, "triangle", 0.06), 80);
    setTimeout(() => this.tone(784, 0.15, "triangle", 0.06), 160);
  }
  victory() {
    this.tone(523, 0.18, "triangle", 0.08);
    setTimeout(() => this.tone(659, 0.18, "triangle", 0.08), 180);
    setTimeout(() => this.tone(784, 0.18, "triangle", 0.08), 360);
    setTimeout(() => this.tone(1046, 0.4, "triangle", 0.1), 540);
  }
  defeat() {
    this.tone(440, 0.2, "sawtooth", 0.06);
    setTimeout(() => this.tone(330, 0.2, "sawtooth", 0.06), 200);
    setTimeout(() => this.tone(220, 0.4, "sawtooth", 0.08), 400);
  }
}

// ──────────────────────────────────────────────────────────────────────────
// AI controller
// ──────────────────────────────────────────────────────────────────────────

function aiDecide(sim: SimState, self: Player): { action: "launch" | "upgrade" | "wait"; kind?: PlaneKind } {
  const me = self === 1 ? sim.p1 : sim.p2;
  const opp = self === 1 ? sim.p2 : sim.p1;
  const cfg = DIFFICULTY_CONFIG[sim.difficulty];

  // Hard AI: react to opponent investment. Medium/Easy don't.
  const reactToOpp = sim.difficulty === "hard";

  // Should upgrade?
  if (me.coins >= UPGRADE_COST && Math.random() < cfg.upgradeChance && me.level < 5) {
    return { action: "upgrade" };
  }

  // Pick a plane kind based on coins + difficulty
  const affordable: PlaneKind[] = [];
  if (me.coins >= PLANE_TYPES.scout.cost) affordable.push("scout");
  if (me.coins >= PLANE_TYPES.fighter.cost) affordable.push("fighter");
  if (me.coins >= PLANE_TYPES.bomber.cost) affordable.push("bomber");

  if (affordable.length === 0) return { action: "wait" };

  let kind: PlaneKind;
  const r = Math.random();
  if (sim.difficulty === "easy") {
    kind = affordable[Math.floor(r * affordable.length)];
  } else if (sim.difficulty === "medium") {
    if (affordable.includes("bomber") && r < cfg.preferBomber) kind = "bomber";
    else if (affordable.includes("fighter") && r < 0.6) kind = "fighter";
    else kind = "scout";
  } else {
    // hard: balanced + bomber pressure
    if (reactToOpp && opp.hp < MAX_HP * 0.4 && affordable.includes("bomber")) kind = "bomber";
    else if (affordable.includes("bomber") && r < cfg.preferBomber) kind = "bomber";
    else if (affordable.includes("fighter") && r < 0.7) kind = "fighter";
    else kind = "scout";
  }

  return { action: "launch", kind };
}

// ──────────────────────────────────────────────────────────────────────────
// Simulation step
// ──────────────────────────────────────────────────────────────────────────

function spawnPlane(sim: SimState, player: Player, kind: PlaneKind): boolean {
  const me = player === 1 ? sim.p1 : sim.p2;
  const type = PLANE_TYPES[kind];
  if (me.coins < type.cost) return false;
  me.coins -= type.cost;
  const baseY = 30 + Math.random() * 38;
  sim.planes.push({
    id: nextId(),
    player,
    kind,
    x: player === 1 ? 14 : 86,
    y: baseY,
    baseY,
    hp: type.hp + (me.level - 1),
    maxHp: type.hp + (me.level - 1),
    damage: type.damage + (me.level - 1) * 4,
    speed: type.speed + (me.level - 1) * 0.03,
    wobbleSeed: Math.random() * Math.PI * 2,
    level: me.level,
  });
  return true;
}

function doUpgrade(sim: SimState, player: Player): boolean {
  const me = player === 1 ? sim.p1 : sim.p2;
  if (me.coins < UPGRADE_COST || me.level >= 5) return false;
  me.coins -= UPGRADE_COST;
  me.level += 1;
  return true;
}

interface TickEffects {
  launches: PlaneKind[];
  hits: number;
  explosions: number;
  warshipHits: number;
  cannons: number;
  coins: boolean;
}

function step(sim: SimState): TickEffects {
  const fx: TickEffects = { launches: [], hits: 0, explosions: 0, warshipHits: 0, cannons: 0, coins: false };
  sim.tick += 1;

  // Coins
  if (sim.tick % COIN_INTERVAL_TICKS === 0) {
    sim.p1.coins += 1;
    sim.p2.coins += 1;
    sim.coinPops.push({ id: nextId(), player: 1, age: 0 });
    sim.coinPops.push({ id: nextId(), player: 2, age: 0 });
    fx.coins = true;
  }

  // Move planes + wobble
  for (const plane of sim.planes) {
    const dx = plane.player === 1 ? plane.speed : -plane.speed;
    plane.x += dx;
    plane.y = plane.baseY + Math.sin(sim.tick * 0.08 + plane.wobbleSeed) * 2.2;
  }

  // Warship collisions
  const survivingPlanes: Plane[] = [];
  for (const plane of sim.planes) {
    if (plane.player === 1 && plane.x >= 90) {
      sim.p2.hp = Math.max(0, sim.p2.hp - plane.damage);
      sim.p2.hpFlashAge = 0;
      sim.explosions.push({ id: nextId(), x: 91, y: 75, age: 0, size: 1.4 });
      fx.warshipHits += 1;
      continue;
    }
    if (plane.player === 2 && plane.x <= 10) {
      sim.p1.hp = Math.max(0, sim.p1.hp - plane.damage);
      sim.p1.hpFlashAge = 0;
      sim.explosions.push({ id: nextId(), x: 9, y: 75, age: 0, size: 1.4 });
      fx.warshipHits += 1;
      continue;
    }
    survivingPlanes.push(plane);
  }
  sim.planes = survivingPlanes;

  // Plane vs plane collisions (mutual damage equal to lower HP)
  for (let i = 0; i < sim.planes.length; i++) {
    const a = sim.planes[i];
    if (a.hp <= 0) continue;
    for (let j = i + 1; j < sim.planes.length; j++) {
      const b = sim.planes[j];
      if (b.hp <= 0) continue;
      if (a.player === b.player) continue;
      const ddx = Math.abs(a.x - b.x);
      const ddy = Math.abs(a.y - b.y);
      if (ddx < (a.kind === "bomber" || b.kind === "bomber" ? 5 : 4) && ddy < 10) {
        const dmg = Math.min(a.hp, b.hp);
        a.hp -= dmg;
        b.hp -= dmg;
        sim.explosions.push({ id: nextId(), x: (a.x + b.x) / 2, y: (a.y + b.y) / 2, age: 0, size: 0.9 });
        fx.hits += 1;
      }
    }
  }

  // Warship cannons fire
  for (const owner of [1, 2] as Player[]) {
    const ownerHp = owner === 1 ? sim.p1.hp : sim.p2.hp;
    if (ownerHp <= 0) continue;
    if (sim.tick < sim.cannonNext[owner]) continue;
    const oppPlanes = sim.planes.filter(p => p.player !== owner && p.hp > 0);
    if (oppPlanes.length === 0) continue;
    const myX = owner === 1 ? 9 : 91;
    // pick nearest plane in range
    let target: Plane | null = null;
    let bestDist = Infinity;
    for (const p of oppPlanes) {
      const dist = Math.abs(p.x - myX);
      if (dist < CANNON_RANGE && dist < bestDist) {
        bestDist = dist;
        target = p;
      }
    }
    if (target) {
      const dirX = target.x - myX;
      const dirY = target.y - 62;
      const mag = Math.sqrt(dirX * dirX + dirY * dirY) || 1;
      sim.cannonballs.push({
        id: nextId(),
        player: owner,
        x: myX,
        y: 62,
        vx: (dirX / mag) * CANNONBALL_SPEED,
        vy: (dirY / mag) * CANNONBALL_SPEED,
        age: 0,
      });
      sim.cannonNext[owner] = sim.tick + CANNON_COOLDOWN_TICKS + Math.floor(Math.random() * 20);
      fx.cannons += 1;
    }
  }

  // Move cannonballs + check hits
  const survivingBalls: Cannonball[] = [];
  for (const ball of sim.cannonballs) {
    ball.x += ball.vx;
    ball.y += ball.vy;
    ball.age += 1;
    if (ball.age > 90 || ball.x < -5 || ball.x > 105 || ball.y < -5 || ball.y > 105) continue;
    // check hit
    let consumed = false;
    for (const p of sim.planes) {
      if (p.player === ball.player) continue;
      if (p.hp <= 0) continue;
      if (Math.abs(p.x - ball.x) < 3.5 && Math.abs(p.y - ball.y) < 7) {
        p.hp -= CANNON_DAMAGE;
        sim.explosions.push({ id: nextId(), x: ball.x, y: ball.y, age: 0, size: 0.5 });
        consumed = true;
        fx.hits += 1;
        break;
      }
    }
    if (!consumed) survivingBalls.push(ball);
  }
  sim.cannonballs = survivingBalls;

  // Remove dead planes (and explode them)
  const stillAlive: Plane[] = [];
  for (const p of sim.planes) {
    if (p.hp <= 0) {
      sim.explosions.push({ id: nextId(), x: p.x, y: p.y, age: 0, size: 1.0 });
      fx.explosions += 1;
    } else {
      stillAlive.push(p);
    }
  }
  sim.planes = stillAlive;

  // Age explosions/coinPops
  sim.explosions = sim.explosions.filter(e => {
    e.age += 1;
    return e.age < 15;
  });
  sim.coinPops = sim.coinPops.filter(c => {
    c.age += 1;
    return c.age < 20;
  });
  sim.p1.hpFlashAge += 1;
  sim.p2.hpFlashAge += 1;

  // AI decisions
  for (const player of [1, 2] as Player[]) {
    const me = player === 1 ? sim.p1 : sim.p2;
    if (!me.isAI) continue;
    if (sim.tick < sim.aiNext[player]) continue;
    const decision = aiDecide(sim, player);
    if (decision.action === "launch" && decision.kind) {
      if (spawnPlane(sim, player, decision.kind)) {
        fx.launches.push(decision.kind);
      }
    } else if (decision.action === "upgrade") {
      doUpgrade(sim, player);
    }
    const [lo, hi] = DIFFICULTY_CONFIG[sim.difficulty].actionEveryTicks;
    sim.aiNext[player] = sim.tick + lo + Math.floor(Math.random() * (hi - lo));
  }

  // Win check
  if (sim.p1.hp <= 0 && sim.p2.hp <= 0) sim.winner = null;
  else if (sim.p1.hp <= 0) sim.winner = 2;
  else if (sim.p2.hp <= 0) sim.winner = 1;

  return fx;
}

// ──────────────────────────────────────────────────────────────────────────
// Main component
// ──────────────────────────────────────────────────────────────────────────

export default function ArmyVsArmyGame() {
  const [gameState, setGameState] = useState<GameState>("start");
  const [mode, setMode] = useState<Mode>("1p");
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");
  const [muted, setMuted] = useState(false);
  const [isPortrait, setIsPortrait] = useState(false);

  const soundRef = useRef<SoundManager>(new SoundManager());
  const [sim, setSim] = useState<SimState>(() => makeInitialSim("1p", "medium"));
  const simRef = useRef<SimState>(sim);
  const [finalWinner, setFinalWinner] = useState<Player | null>(null);
  const syncSim = useCallback(() => setSim({ ...simRef.current }), []);

  useEffect(() => {
    soundRef.current.muted = muted;
  }, [muted]);

  useEffect(() => {
    const check = () => {
      if (typeof window === "undefined") return;
      setIsPortrait(window.innerHeight > window.innerWidth && window.innerWidth < 900);
    };
    check();
    window.addEventListener("resize", check);
    window.addEventListener("orientationchange", check);
    return () => {
      window.removeEventListener("resize", check);
      window.removeEventListener("orientationchange", check);
    };
  }, []);

  // Game loop
  useEffect(() => {
    if (gameState !== "playing") return;
    const id = setInterval(() => {
      const fx = step(simRef.current);
      const snd = soundRef.current;
      for (const kind of fx.launches) snd.launch(kind);
      if (fx.hits > 0) snd.hit();
      if (fx.explosions > 0) snd.explode();
      if (fx.warshipHits > 0) snd.warshipHit();
      if (fx.cannons > 0) snd.cannon();
      if (fx.coins) snd.coin();
      const s = simRef.current;
      if (s.winner !== null || s.p1.hp + s.p2.hp <= 0) {
        if (s.winner === 1) snd.victory();
        else if (s.winner === 2 && mode === "1p") snd.defeat();
        else snd.victory();
        setFinalWinner(s.winner);
        setGameState("gameOver");
      }
      syncSim();
    }, TICK_MS);
    return () => clearInterval(id);
  }, [gameState, mode, syncSim]);

  const launch = useCallback((player: Player, kind: PlaneKind) => {
    if (spawnPlane(simRef.current, player, kind)) {
      soundRef.current.launch(kind);
      syncSim();
    }
  }, [syncSim]);

  const upgrade = useCallback((player: Player) => {
    if (doUpgrade(simRef.current, player)) {
      soundRef.current.upgrade();
      syncSim();
    }
  }, [syncSim]);

  const beginGame = useCallback(() => {
    soundRef.current.init();
    simRef.current = makeInitialSim(mode, difficulty);
    setSim(simRef.current);
    setFinalWinner(null);
    setGameState("playing");
  }, [mode, difficulty]);

  const chooseMode = useCallback(
    (m: Mode) => {
      soundRef.current.init();
      setMode(m);
      if (m === "1p") setGameState("difficulty");
      else {
        simRef.current = makeInitialSim("2p", "medium");
        setSim(simRef.current);
        setFinalWinner(null);
        setGameState("playing");
      }
    },
    [],
  );

  const chooseDifficulty = useCallback(
    (d: Difficulty) => {
      setDifficulty(d);
      simRef.current = makeInitialSim("1p", d);
      setSim(simRef.current);
      setFinalWinner(null);
      setGameState("playing");
    },
    [],
  );

  if (isPortrait && gameState === "playing") {
    return <RotateHint onMute={() => setMuted(m => !m)} muted={muted} />;
  }

  if (gameState === "start") {
    return <StartScreen onStart={() => { soundRef.current.init(); setGameState("modeSelect"); }} />;
  }

  if (gameState === "modeSelect") {
    return <ModeSelectScreen onChoose={chooseMode} onBack={() => setGameState("start")} />;
  }

  if (gameState === "difficulty") {
    return <DifficultyScreen onChoose={chooseDifficulty} onBack={() => setGameState("modeSelect")} />;
  }

  if (gameState === "gameOver") {
    return (
      <GameOverScreen
        winner={finalWinner}
        mode={mode}
        onPlayAgain={beginGame}
        onMenu={() => setGameState("modeSelect")}
      />
    );
  }

  return (
    <PlayingScreen
      sim={sim}
      mode={mode}
      muted={muted}
      onLaunch={launch}
      onUpgrade={upgrade}
      onToggleMute={() => setMuted(m => !m)}
      onMenu={() => setGameState("modeSelect")}
    />
  );
}

// ──────────────────────────────────────────────────────────────────────────
// Screens
// ──────────────────────────────────────────────────────────────────────────

function StartScreen({ onStart }: { onStart: () => void }) {
  return (
    <div
      onClick={onStart}
      className="relative w-full overflow-hidden rounded-2xl border-4 border-amber-900 shadow-xl cursor-pointer select-none active:scale-[0.99] transition-transform"
      style={{ aspectRatio: "16/9", minHeight: "60vh" }}
    >
      <div className="absolute inset-0 flex">
        <div className="flex-1" style={{ background: "repeating-linear-gradient(180deg, #93c5fd, #93c5fd 6px, #60a5fa 6px, #60a5fa 9px)" }} />
        <div className="flex-1" style={{ background: "repeating-linear-gradient(180deg, #86efac, #86efac 6px, #4ade80 6px, #4ade80 9px)" }} />
        <div className="flex-1" style={{ background: "repeating-linear-gradient(180deg, #fca5a5, #fca5a5 6px, #f87171 6px, #f87171 9px)" }} />
      </div>
      <div className="relative h-full flex flex-col items-center justify-between py-6 sm:py-10">
        <h1
          className="text-6xl sm:text-8xl font-black text-amber-900 drop-shadow-[2px_2px_0_rgba(255,255,255,0.6)]"
          style={{ fontFamily: FONT, transform: "rotate(-2deg)" }}
        >
          Army vs Army
        </h1>
        <div className="flex items-center justify-center gap-1 sm:gap-2">
          <StickFigure flipped={false} />
          <CrossedSwords />
          <StickFigure flipped={true} />
        </div>
        <div
          className="bg-white/90 px-6 py-3 rounded-2xl border-4 border-amber-900 text-amber-900 text-2xl sm:text-4xl font-bold animate-pulse"
          style={{ fontFamily: FONT }}
        >
          TAP TO START
        </div>
      </div>
    </div>
  );
}

function ModeSelectScreen({ onChoose, onBack }: { onChoose: (m: Mode) => void; onBack: () => void }) {
  return (
    <div className="bg-amber-50 border-4 border-amber-900 rounded-2xl p-6 sm:p-10 shadow-xl text-center">
      <h2 className="text-4xl sm:text-6xl font-black text-amber-900 mb-6" style={{ fontFamily: FONT }}>
        Choose Mode
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 max-w-2xl mx-auto">
        <button
          onClick={() => onChoose("1p")}
          className="py-8 px-4 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white border-4 border-blue-900 shadow-lg active:translate-y-1 transition-all"
          style={{ fontFamily: FONT }}
        >
          <div className="text-3xl sm:text-5xl font-black">1 Player</div>
          <div className="text-xl sm:text-2xl mt-1">vs CPU</div>
        </button>
        <button
          onClick={() => onChoose("2p")}
          className="py-8 px-4 rounded-2xl bg-red-600 hover:bg-red-500 text-white border-4 border-red-900 shadow-lg active:translate-y-1 transition-all"
          style={{ fontFamily: FONT }}
        >
          <div className="text-3xl sm:text-5xl font-black">2 Players</div>
          <div className="text-xl sm:text-2xl mt-1">on this device</div>
        </button>
      </div>
      <button
        onClick={onBack}
        className="mt-8 text-amber-800 text-xl hover:text-amber-600"
        style={{ fontFamily: FONT }}
      >
        ← back
      </button>
    </div>
  );
}

function DifficultyScreen({ onChoose, onBack }: { onChoose: (d: Difficulty) => void; onBack: () => void }) {
  const items: { d: Difficulty; label: string; sub: string; color: string }[] = [
    { d: "easy", label: "Easy", sub: "for first try", color: "bg-green-600 hover:bg-green-500 border-green-900" },
    { d: "medium", label: "Medium", sub: "balanced", color: "bg-amber-600 hover:bg-amber-500 border-amber-900" },
    { d: "hard", label: "Hard", sub: "no mercy!", color: "bg-red-700 hover:bg-red-600 border-red-900" },
  ];
  return (
    <div className="bg-amber-50 border-4 border-amber-900 rounded-2xl p-6 sm:p-10 shadow-xl text-center">
      <h2 className="text-4xl sm:text-6xl font-black text-amber-900 mb-6" style={{ fontFamily: FONT }}>
        Difficulty
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto">
        {items.map(item => (
          <button
            key={item.d}
            onClick={() => onChoose(item.d)}
            className={`py-6 sm:py-10 px-4 rounded-2xl text-white border-4 shadow-lg active:translate-y-1 transition-all ${item.color}`}
            style={{ fontFamily: FONT }}
          >
            <div className="text-3xl sm:text-5xl font-black">{item.label}</div>
            <div className="text-lg sm:text-xl mt-1">{item.sub}</div>
          </button>
        ))}
      </div>
      <button
        onClick={onBack}
        className="mt-8 text-amber-800 text-xl hover:text-amber-600"
        style={{ fontFamily: FONT }}
      >
        ← back
      </button>
    </div>
  );
}

function GameOverScreen({
  winner,
  mode,
  onPlayAgain,
  onMenu,
}: {
  winner: Player | null;
  mode: Mode;
  onPlayAgain: () => void;
  onMenu: () => void;
}) {
  let label = "DRAW!";
  let color = "text-amber-800";
  if (winner !== null) {
    if (mode === "1p") {
      label = winner === 1 ? "YOU WIN!" : "YOU LOSE";
      color = winner === 1 ? "text-blue-700" : "text-red-700";
    } else {
      label = `PLAYER ${winner} WINS!`;
      color = winner === 1 ? "text-blue-700" : "text-red-700";
    }
  }
  return (
    <div className="bg-amber-50 border-4 border-amber-900 rounded-2xl p-8 sm:p-12 text-center shadow-xl">
      <h2 className={`text-5xl sm:text-7xl font-black ${color} mb-6`} style={{ fontFamily: FONT }}>
        {label}
      </h2>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <button
          onClick={onPlayAgain}
          className="px-10 py-4 text-2xl sm:text-3xl font-bold rounded-2xl bg-amber-600 hover:bg-amber-500 text-white border-4 border-amber-800 shadow-lg active:translate-y-1 transition-all"
          style={{ fontFamily: FONT }}
        >
          Play Again
        </button>
        <button
          onClick={onMenu}
          className="px-10 py-4 text-2xl sm:text-3xl font-bold rounded-2xl bg-white hover:bg-amber-100 text-amber-900 border-4 border-amber-800 shadow-lg active:translate-y-1 transition-all"
          style={{ fontFamily: FONT }}
        >
          Menu
        </button>
      </div>
    </div>
  );
}

function RotateHint({ onMute, muted }: { onMute: () => void; muted: boolean }) {
  return (
    <div className="bg-amber-50 border-4 border-amber-900 rounded-2xl p-8 text-center shadow-xl">
      <div className="text-7xl mb-4 animate-spin-slow inline-block" style={{ animation: "rotate-hint 2s ease-in-out infinite" }}>
        📱
      </div>
      <h2 className="text-3xl sm:text-5xl font-black text-amber-900 mb-3" style={{ fontFamily: FONT }}>
        Please rotate your device
      </h2>
      <p className="text-xl sm:text-2xl text-amber-700 mb-6" style={{ fontFamily: FONT }}>
        Army vs Army is best played in landscape!
      </p>
      <button
        onClick={onMute}
        className="px-6 py-2 text-xl bg-amber-200 hover:bg-amber-100 text-amber-900 border-2 border-amber-800 rounded-xl"
        style={{ fontFamily: FONT }}
      >
        {muted ? "🔇 sound off" : "🔊 sound on"}
      </button>
      <style jsx>{`
        @keyframes rotate-hint {
          0%, 40%, 100% { transform: rotate(0deg); }
          60%, 80% { transform: rotate(90deg); }
        }
      `}</style>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────
// Playing screen
// ──────────────────────────────────────────────────────────────────────────

function PlayingScreen({
  sim,
  mode,
  muted,
  onLaunch,
  onUpgrade,
  onToggleMute,
  onMenu,
}: {
  sim: SimState;
  mode: Mode;
  muted: boolean;
  onLaunch: (p: Player, k: PlaneKind) => void;
  onUpgrade: (p: Player) => void;
  onToggleMute: () => void;
  onMenu: () => void;
}) {
  return (
    <div className="flex flex-col gap-2 select-none">
      <div className="flex justify-between items-start text-amber-900" style={{ fontFamily: FONT }}>
        <PlayerHUD player={1} state={sim.p1} label={mode === "1p" ? "YOU" : "P1"} />
        <div className="flex gap-2 mt-1">
          <button
            onClick={onToggleMute}
            className="px-3 py-1 text-lg bg-amber-200 hover:bg-amber-100 text-amber-900 border-2 border-amber-800 rounded-xl"
            style={{ fontFamily: FONT }}
            aria-label="toggle sound"
          >
            {muted ? "🔇" : "🔊"}
          </button>
          <button
            onClick={onMenu}
            className="px-3 py-1 text-lg bg-amber-200 hover:bg-amber-100 text-amber-900 border-2 border-amber-800 rounded-xl"
            style={{ fontFamily: FONT }}
          >
            ☰
          </button>
        </div>
        <PlayerHUD player={2} state={sim.p2} label={mode === "1p" ? "CPU" : "P2"} alignRight />
      </div>

      <div
        className="relative w-full overflow-hidden rounded-2xl border-4 border-amber-900 shadow-xl"
        style={{
          aspectRatio: "16/9",
          maxHeight: "55vh",
          background: "linear-gradient(180deg, #bae6fd 0%, #7dd3fc 60%, #38bdf8 100%)",
        }}
      >
        <Cloud x={20} y={10} scale={1} />
        <Cloud x={55} y={6} scale={0.8} />
        <Cloud x={80} y={14} scale={1.1} />
        <Cloud x={35} y={20} scale={0.7} />

        <div className="absolute" style={{ left: "0%", bottom: "0%", width: "20%", height: "32%" }}>
          <Warship side="left" hp={sim.p1.hp} />
        </div>
        <div className="absolute" style={{ right: "0%", bottom: "0%", width: "20%", height: "32%" }}>
          <Warship side="right" hp={sim.p2.hp} />
        </div>

        <div
          className="absolute left-0 right-0 bottom-0"
          style={{ height: "8%", background: "linear-gradient(180deg, #0c4a6e, #1e3a8a)" }}
        />

        {sim.planes.map(plane => (
          <PlaneSprite key={plane.id} plane={plane} />
        ))}
        {sim.cannonballs.map(ball => (
          <CannonballSprite key={ball.id} ball={ball} />
        ))}
        {sim.explosions.map(exp => (
          <ExplosionSprite key={exp.id} exp={exp} />
        ))}
        {sim.coinPops.map(cp => (
          <CoinPopSprite key={cp.id} pop={cp} />
        ))}
      </div>

      <div className="flex justify-between gap-1 sm:gap-3 mt-1">
        <PlayerControls
          player={1}
          state={sim.p1}
          onLaunch={onLaunch}
          onUpgrade={onUpgrade}
          disabled={sim.p1.isAI}
        />
        <PlayerControls
          player={2}
          state={sim.p2}
          onLaunch={onLaunch}
          onUpgrade={onUpgrade}
          disabled={sim.p2.isAI}
        />
      </div>
    </div>
  );
}

function PlayerHUD({ player, state, label, alignRight }: { player: Player; state: PlayerState; label: string; alignRight?: boolean }) {
  const color = player === 1 ? "bg-blue-600" : "bg-red-600";
  const flashing = state.hpFlashAge < 5;
  return (
    <div className={`flex flex-col gap-1 min-w-[35%] sm:min-w-[28%] ${alignRight ? "items-end" : ""}`}>
      <div className="text-2xl sm:text-3xl font-black" style={{ fontFamily: FONT }}>
        {label}
      </div>
      <div className={`h-4 sm:h-5 w-full bg-white border-2 border-amber-900 rounded-full overflow-hidden ${flashing ? "ring-4 ring-red-500" : ""}`}>
        <div
          className={`h-full ${color} transition-all duration-200`}
          style={{ width: `${(state.hp / MAX_HP) * 100}%` }}
        />
      </div>
      <div className={`flex gap-3 text-lg sm:text-xl ${alignRight ? "flex-row-reverse" : ""}`} style={{ fontFamily: FONT }}>
        <span>💰 {state.coins}</span>
        <span>⭐ Lv {state.level}</span>
      </div>
    </div>
  );
}

function PlayerControls({
  player,
  state,
  onLaunch,
  onUpgrade,
  disabled,
}: {
  player: Player;
  state: PlayerState;
  onLaunch: (p: Player, k: PlaneKind) => void;
  onUpgrade: (p: Player) => void;
  disabled: boolean;
}) {
  if (disabled) {
    return (
      <div className="flex-1 flex items-center justify-center py-6 bg-amber-100 border-4 border-amber-800 rounded-2xl text-amber-700 text-2xl" style={{ fontFamily: FONT }}>
        🤖 CPU thinking...
      </div>
    );
  }
  const planeButtonStyle = (kind: PlaneKind) => {
    const t = PLANE_TYPES[kind];
    const can = state.coins >= t.cost;
    const tone =
      player === 1
        ? "bg-blue-600 hover:bg-blue-500 border-blue-900"
        : "bg-red-600 hover:bg-red-500 border-red-900";
    return { can, tone, t };
  };
  const upTone =
    player === 1
      ? "bg-blue-200 hover:bg-blue-100 border-blue-900 text-blue-900"
      : "bg-red-200 hover:bg-red-100 border-red-900 text-red-900";
  const canUpgrade = state.coins >= UPGRADE_COST && state.level < 5;

  return (
    <div className={`flex gap-1 sm:gap-2 flex-1 ${player === 2 ? "flex-row-reverse" : ""}`}>
      {(["scout", "fighter", "bomber"] as PlaneKind[]).map(kind => {
        const { can, tone, t } = planeButtonStyle(kind);
        return (
          <button
            key={kind}
            onClick={() => onLaunch(player, kind)}
            disabled={!can}
            className={`flex-1 py-2 sm:py-4 rounded-2xl border-4 text-white font-black shadow-lg active:translate-y-1 transition-all disabled:opacity-40 disabled:cursor-not-allowed ${tone}`}
            style={{ fontFamily: FONT }}
          >
            <div className="text-2xl sm:text-4xl">{t.emoji}</div>
            <div className="text-sm sm:text-lg leading-tight">{t.name}</div>
            <div className="text-xs sm:text-base opacity-90">💰{t.cost}</div>
          </button>
        );
      })}
      <button
        onClick={() => onUpgrade(player)}
        disabled={!canUpgrade}
        className={`flex-1 py-2 sm:py-4 rounded-2xl border-4 font-black shadow-lg active:translate-y-1 transition-all disabled:opacity-40 disabled:cursor-not-allowed ${upTone}`}
        style={{ fontFamily: FONT }}
      >
        <div className="text-2xl sm:text-4xl">🔧</div>
        <div className="text-sm sm:text-lg leading-tight">Upgrade</div>
        <div className="text-xs sm:text-base opacity-90">💰{UPGRADE_COST}</div>
      </button>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────
// Sprites
// ──────────────────────────────────────────────────────────────────────────

function StickFigure({ flipped }: { flipped: boolean }) {
  return (
    <svg
      viewBox="0 0 60 120"
      className="w-20 h-40 sm:w-28 sm:h-56"
      style={{ transform: flipped ? "scaleX(-1)" : "none" }}
    >
      <circle cx="30" cy="18" r="10" fill="none" stroke="#000" strokeWidth="2.5" />
      <line x1="30" y1="28" x2="30" y2="70" stroke="#000" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="30" y1="40" x2="10" y2="55" stroke="#000" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="30" y1="40" x2="50" y2="30" stroke="#000" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="30" y1="70" x2="18" y2="105" stroke="#000" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="30" y1="70" x2="42" y2="105" stroke="#000" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

function CrossedSwords() {
  return (
    <svg viewBox="0 0 120 60" className="w-24 h-12 sm:w-40 sm:h-20">
      <line x1="5" y1="5" x2="115" y2="55" stroke="#1e40af" strokeWidth="6" strokeLinecap="round" />
      <line x1="115" y1="5" x2="5" y2="55" stroke="#b91c1c" strokeWidth="6" strokeLinecap="round" />
      <circle cx="60" cy="30" r="4" fill="#fbbf24" stroke="#000" strokeWidth="1.5" />
    </svg>
  );
}

function Cloud({ x, y, scale }: { x: number; y: number; scale: number }) {
  return (
    <svg
      viewBox="0 0 100 50"
      className="absolute opacity-90"
      style={{ left: `${x}%`, top: `${y}%`, width: `${15 * scale}%`, height: "auto" }}
    >
      <ellipse cx="25" cy="30" rx="18" ry="14" fill="#fff" stroke="#94a3b8" strokeWidth="1.5" />
      <ellipse cx="50" cy="22" rx="22" ry="17" fill="#fff" stroke="#94a3b8" strokeWidth="1.5" />
      <ellipse cx="75" cy="30" rx="18" ry="14" fill="#fff" stroke="#94a3b8" strokeWidth="1.5" />
    </svg>
  );
}

function Warship({ side, hp }: { side: "left" | "right"; hp: number }) {
  const damaged = hp < MAX_HP * 0.4;
  const critical = hp < MAX_HP * 0.2;
  const flag = side === "left" ? "#2563eb" : "#dc2626";
  return (
    <svg
      viewBox="0 0 200 120"
      className="w-full h-full"
      style={{ transform: side === "right" ? "scaleX(-1)" : "none" }}
    >
      <rect x="20" y="35" width="20" height="50" fill="#78350f" stroke="#000" strokeWidth="2" />
      <polygon points="40,40 55,55 40,55" fill="#92400e" stroke="#000" strokeWidth="2" />
      <line x1="30" y1="35" x2="30" y2="10" stroke="#000" strokeWidth="2.5" />
      <polygon points="30,12 65,18 30,24" fill={flag} stroke="#000" strokeWidth="1.5" />
      <path
        d="M 10 75 L 30 60 L 170 60 L 195 75 L 185 95 L 25 95 Z"
        fill="#8b6f47"
        stroke="#000"
        strokeWidth="2.5"
      />
      <rect x="55" y="48" width="25" height="14" fill="#fbbf24" stroke="#000" strokeWidth="1.5" />
      <rect x="60" y="50" width="5" height="5" fill="#0c4a6e" />
      <rect x="70" y="50" width="5" height="5" fill="#0c4a6e" />
      <rect x="95" y="46" width="22" height="16" fill="#a16207" stroke="#000" strokeWidth="1.5" />
      <rect x="100" y="48" width="4" height="5" fill="#0c4a6e" />
      <rect x="108" y="48" width="4" height="5" fill="#0c4a6e" />
      <rect x="135" y="50" width="15" height="12" fill="#fbbf24" stroke="#000" strokeWidth="1.5" />
      <circle cx="130" cy="64" r="6" fill="#374151" stroke="#000" strokeWidth="1.5" />
      <line x1="130" y1="64" x2="150" y2="56" stroke="#000" strokeWidth="3.5" strokeLinecap="round" />
      <circle cx="80" cy="64" r="4" fill="#374151" stroke="#000" strokeWidth="1.5" />
      <line x1="80" y1="64" x2="95" y2="58" stroke="#000" strokeWidth="3" strokeLinecap="round" />
      <rect x="50" y="78" width="120" height="6" fill="#5b3a1d" />
      {damaged && (
        <>
          <circle cx="80" cy="55" r="6" fill="#ef4444" opacity="0.85">
            <animate attributeName="r" values="5;8;5" dur="0.6s" repeatCount="indefinite" />
          </circle>
          <circle cx="120" cy="58" r="8" fill="#f97316" opacity="0.85">
            <animate attributeName="r" values="7;10;7" dur="0.7s" repeatCount="indefinite" />
          </circle>
        </>
      )}
      {critical && (
        <text x="100" y="115" textAnchor="middle" fontSize="16" fill="#dc2626" fontWeight="bold" fontFamily="cursive">
          DANGER!
        </text>
      )}
    </svg>
  );
}

function PlaneSprite({ plane }: { plane: Plane }) {
  const flip = plane.player === 2;
  const tint = plane.player === 1 ? "#1e40af" : "#b91c1c";
  const type = PLANE_TYPES[plane.kind];
  return (
    <div
      className="absolute"
      style={{
        left: `${plane.x}%`,
        top: `${plane.y}%`,
        width: `${type.width}%`,
        transform: `translate(-50%, -50%) ${flip ? "scaleX(-1)" : ""}`,
      }}
    >
      {plane.kind === "scout" && <ScoutSvg tint={tint} level={plane.level} />}
      {plane.kind === "fighter" && <FighterSvg tint={tint} level={plane.level} />}
      {plane.kind === "bomber" && <BomberSvg tint={tint} level={plane.level} />}
      {plane.hp < plane.maxHp && (
        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-3/4 h-1.5 bg-white/60 rounded-full border border-black/40 overflow-hidden">
          <div
            className="h-full bg-green-500"
            style={{ width: `${(plane.hp / plane.maxHp) * 100}%`, transform: flip ? "scaleX(-1)" : "none" }}
          />
        </div>
      )}
    </div>
  );
}

function ScoutSvg({ tint, level }: { tint: string; level: number }) {
  const body = level >= 3 ? "#475569" : "#8b6f47";
  return (
    <svg viewBox="0 0 100 50" className="w-full h-auto">
      <polygon points="60,18 95,25 60,32" fill={body} stroke="#000" strokeWidth="2" />
      <rect x="20" y="22" width="42" height="8" fill={body} stroke="#000" strokeWidth="2" rx="2" />
      <polygon points="22,22 8,8 30,22" fill={tint} stroke="#000" strokeWidth="2" />
      <polygon points="22,30 8,44 30,30" fill={tint} stroke="#000" strokeWidth="2" />
      <rect x="46" y="23" width="6" height="6" fill="#7dd3fc" stroke="#000" strokeWidth="1" rx="1" />
      {level >= 2 && <rect x="32" y="16" width="3" height="7" fill="#1f2937" stroke="#000" strokeWidth="0.7" />}
    </svg>
  );
}

function FighterSvg({ tint, level }: { tint: string; level: number }) {
  const body = level >= 3 ? "#475569" : level >= 2 ? "#a16207" : "#8b6f47";
  return (
    <svg viewBox="0 0 100 50" className="w-full h-auto">
      <rect x="18" y="20" width="58" height="12" fill={body} stroke="#000" strokeWidth="2" rx="2" />
      <circle cx="80" cy="26" r="8" fill="#9ca3af" stroke="#000" strokeWidth="2" />
      <line x1="72" y1="26" x2="88" y2="26" stroke="#000" strokeWidth="1.5" />
      <line x1="80" y1="18" x2="80" y2="34" stroke="#000" strokeWidth="1.5" />
      <line x1="74" y1="20" x2="86" y2="32" stroke="#000" strokeWidth="1.5" />
      <line x1="86" y1="20" x2="74" y2="32" stroke="#000" strokeWidth="1.5" />
      <polygon points="28,20 40,6 56,20" fill={tint} stroke="#000" strokeWidth="2" />
      <polygon points="28,32 40,46 56,32" fill={tint} stroke="#000" strokeWidth="2" />
      <rect x="58" y="22" width="7" height="6" fill="#7dd3fc" stroke="#000" strokeWidth="1" rx="1" />
      {level >= 2 && (
        <>
          <rect x="38" y="13" width="3" height="7" fill="#1f2937" stroke="#000" strokeWidth="0.7" />
          <rect x="46" y="13" width="3" height="7" fill="#1f2937" stroke="#000" strokeWidth="0.7" />
        </>
      )}
      {level >= 4 && <rect x="54" y="13" width="3" height="7" fill="#1f2937" stroke="#000" strokeWidth="0.7" />}
    </svg>
  );
}

function BomberSvg({ tint, level }: { tint: string; level: number }) {
  const body = level >= 3 ? "#374151" : level >= 2 ? "#92400e" : "#78350f";
  return (
    <svg viewBox="0 0 100 50" className="w-full h-auto">
      <rect x="10" y="18" width="70" height="16" fill={body} stroke="#000" strokeWidth="2" rx="3" />
      <polygon points="80,16 96,26 80,36" fill={body} stroke="#000" strokeWidth="2" />
      <circle cx="84" cy="26" r="2" fill="#0f172a" />
      <polygon points="20,18 32,2 52,18" fill={tint} stroke="#000" strokeWidth="2" />
      <polygon points="20,34 32,48 52,34" fill={tint} stroke="#000" strokeWidth="2" />
      <ellipse cx="55" cy="26" rx="14" ry="5" fill="#b91c1c" stroke="#000" strokeWidth="2" opacity="0.85" />
      <rect x="62" y="22" width="8" height="7" fill="#7dd3fc" stroke="#000" strokeWidth="1" rx="1" />
      <rect x="5" y="22" width="6" height="8" fill="#5b3a1d" stroke="#000" strokeWidth="1.5" />
      {level >= 2 && (
        <>
          <rect x="30" y="11" width="3" height="8" fill="#1f2937" stroke="#000" strokeWidth="0.7" />
          <rect x="40" y="11" width="3" height="8" fill="#1f2937" stroke="#000" strokeWidth="0.7" />
          <rect x="50" y="11" width="3" height="8" fill="#1f2937" stroke="#000" strokeWidth="0.7" />
        </>
      )}
    </svg>
  );
}

function CannonballSprite({ ball }: { ball: Cannonball }) {
  return (
    <div
      className="absolute"
      style={{
        left: `${ball.x}%`,
        top: `${ball.y}%`,
        width: "1.4%",
        aspectRatio: "1/1",
        transform: "translate(-50%, -50%)",
        background: "radial-gradient(circle, #1f2937, #000)",
        borderRadius: "50%",
        boxShadow: "0 0 6px rgba(0,0,0,0.6)",
      }}
    />
  );
}

function ExplosionSprite({ exp }: { exp: Explosion }) {
  const progress = exp.age / 15;
  const scale = (0.4 + progress * 1.4) * exp.size;
  const opacity = 1 - progress;
  return (
    <div
      className="absolute pointer-events-none"
      style={{
        left: `${exp.x}%`,
        top: `${exp.y}%`,
        width: "8%",
        aspectRatio: "1/1",
        transform: `translate(-50%, -50%) scale(${scale})`,
        opacity,
      }}
    >
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <circle cx="50" cy="50" r="35" fill="#fbbf24" />
        <circle cx="50" cy="50" r="22" fill="#f97316" />
        <circle cx="50" cy="50" r="12" fill="#fff" />
        <polygon points="50,5 55,40 95,50 55,60 50,95 45,60 5,50 45,40" fill="#fbbf24" opacity="0.7" />
      </svg>
    </div>
  );
}

function CoinPopSprite({ pop }: { pop: CoinPop }) {
  const progress = pop.age / 20;
  const x = pop.player === 1 ? 10 : 90;
  return (
    <div
      className="absolute pointer-events-none text-amber-500 font-black"
      style={{
        left: `${x}%`,
        top: `${45 - progress * 15}%`,
        fontFamily: FONT,
        fontSize: "1.5em",
        opacity: 1 - progress,
        transform: "translate(-50%, -50%)",
      }}
    >
      +1 💰
    </div>
  );
}
