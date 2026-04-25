"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const FONT = "'Caveat', 'Comic Sans MS', cursive";

const FIELD_W = 1000;
const FIELD_H = 400;
const GROUND_Y = 340;
const CASTLE_W = 100;
const CASTLE_H = 140;
const PLAYER_CASTLE_X = 20;
const ENEMY_CASTLE_X = FIELD_W - CASTLE_W - 20;
const PLAYER_MINE_X = PLAYER_CASTLE_X + CASTLE_W + 40;
const ENEMY_MINE_X = ENEMY_CASTLE_X - 70;
const STARTING_GOLD = 50;
const CASTLE_HP = 1000;

type UnitType = "miner" | "swordsman" | "archer" | "boss";
type Team = "green" | "red";
type Difficulty = "easy" | "normal" | "hard";

interface UnitDef {
  cost: number;
  hp: number;
  damage: number;
  attackInterval: number;
  range: number;
  speed: number;
  width: number;
  height: number;
}

const UNIT_DEFS: Record<UnitType, UnitDef> = {
  miner:     { cost: 20,  hp: 30,  damage: 0,  attackInterval: 0,    range: 0,   speed: 60,  width: 16, height: 36 },
  swordsman: { cost: 30,  hp: 80,  damage: 15, attackInterval: 1.0,  range: 30,  speed: 50,  width: 18, height: 42 },
  archer:    { cost: 50,  hp: 50,  damage: 12, attackInterval: 1.5,  range: 200, speed: 40,  width: 18, height: 42 },
  boss:      { cost: 200, hp: 500, damage: 40, attackInterval: 1.5,  range: 40,  speed: 30,  width: 32, height: 70 },
};

const DIFFICULTY: Record<Difficulty, { goldRate: number; sword: number; archer: number; boss: number }> = {
  easy:   { goldRate: 0.7, sword: 6, archer: 12, boss: 90 },
  normal: { goldRate: 1.0, sword: 4, archer: 9,  boss: 60 },
  hard:   { goldRate: 1.3, sword: 3, archer: 7,  boss: 45 },
};

interface Unit {
  id: number;
  type: UnitType;
  team: Team;
  x: number;
  y: number;
  hp: number;
  maxHp: number;
  attackCooldown: number;
  // miner-specific
  atMine: boolean;
}

interface Projectile {
  id: number;
  team: Team;
  x: number;
  y: number;
  vx: number;
  damage: number;
}

interface Damage {
  id: number;
  x: number;
  y: number;
  amount: number;
  ttl: number;
}

interface GameState {
  playerTeam: Team;
  difficulty: Difficulty;
  units: Unit[];
  projectiles: Projectile[];
  damages: Damage[];
  playerGold: number;
  enemyGold: number;
  playerCastleHp: number;
  enemyCastleHp: number;
  playerCastleMaxHp: number;
  enemyCastleMaxHp: number;
  enemyCooldown: { sword: number; archer: number; boss: number };
  outcome: "playing" | "win" | "lose";
  nextId: number;
}

interface Upgrades {
  castle_armor: boolean;
  sharper_swords: boolean;
  faster_miners: boolean;
  royal_boss: boolean;
  flag_emblem: boolean;
}

const DEFAULT_UPGRADES: Upgrades = {
  castle_armor: false,
  sharper_swords: false,
  faster_miners: false,
  royal_boss: false,
  flag_emblem: false,
};

const SHOP_ITEMS: { id: keyof Upgrades; name: string; cost: number; emoji: string; desc: string }[] = [
  { id: "castle_armor",   name: "Castle Armor",         cost: 20, emoji: "🛡️", desc: "+20% castle HP" },
  { id: "sharper_swords", name: "Sharper Swords",       cost: 25, emoji: "⚔️", desc: "+25% unit damage" },
  { id: "faster_miners",  name: "Faster Miners",        cost: 30, emoji: "🏃", desc: "+50% gold from miners" },
  { id: "royal_boss",     name: "Royal Boss",           cost: 40, emoji: "👑", desc: "Boss costs 150g" },
  { id: "flag_emblem",    name: "Custom Flag Emblem",   cost: 15, emoji: "🎨", desc: "Star on your flag" },
];

function loadDiamonds(): number {
  if (typeof window === "undefined") return 0;
  const v = localStorage.getItem("stickwars_diamonds");
  return v ? parseInt(v, 10) || 0 : 0;
}
function saveDiamonds(n: number) {
  localStorage.setItem("stickwars_diamonds", String(n));
}
function loadUpgrades(): Upgrades {
  if (typeof window === "undefined") return DEFAULT_UPGRADES;
  const v = localStorage.getItem("stickwars_upgrades");
  if (!v) return DEFAULT_UPGRADES;
  try {
    return { ...DEFAULT_UPGRADES, ...JSON.parse(v) };
  } catch {
    return DEFAULT_UPGRADES;
  }
}
function saveUpgrades(u: Upgrades) {
  localStorage.setItem("stickwars_upgrades", JSON.stringify(u));
}

function bossCost(u: Upgrades) {
  return u.royal_boss ? 150 : 200;
}
function castleMaxHp(u: Upgrades) {
  return u.castle_armor ? Math.round(CASTLE_HP * 1.2) : CASTLE_HP;
}
function damageMult(u: Upgrades) {
  return u.sharper_swords ? 1.25 : 1.0;
}
function minerRateMult(u: Upgrades) {
  return u.faster_miners ? 1.5 : 1.0;
}

type Screen = "splash" | "battle" | "shop";

export default function StickWarsGame() {
  const [screen, setScreen] = useState<Screen>("splash");
  const [diamonds, setDiamonds] = useState(0);
  const [upgrades, setUpgrades] = useState<Upgrades>(DEFAULT_UPGRADES);
  const [team, setTeam] = useState<Team>("green");
  const [difficulty, setDifficulty] = useState<Difficulty>("normal");

  // Read persistence on mount.
  useEffect(() => {
    setDiamonds(loadDiamonds());
    setUpgrades(loadUpgrades());
  }, []);

  function updateDiamonds(n: number) {
    setDiamonds(n);
    saveDiamonds(n);
  }
  function updateUpgrades(u: Upgrades) {
    setUpgrades(u);
    saveUpgrades(u);
  }

  return (
    <div className="w-full max-w-5xl mx-auto">
      {screen === "splash" && (
        <Splash
          team={team}
          setTeam={setTeam}
          difficulty={difficulty}
          setDifficulty={setDifficulty}
          diamonds={diamonds}
          onPlay={() => setScreen("battle")}
          onShop={() => setScreen("shop")}
        />
      )}
      {screen === "shop" && (
        <Shop
          diamonds={diamonds}
          upgrades={upgrades}
          onBuy={(id, cost) => {
            if (diamonds < cost || upgrades[id]) return;
            updateDiamonds(diamonds - cost);
            updateUpgrades({ ...upgrades, [id]: true });
          }}
          onBack={() => setScreen("splash")}
        />
      )}
      {screen === "battle" && (
        <Battle
          team={team}
          difficulty={difficulty}
          upgrades={upgrades}
          onResult={(won) => {
            if (won) updateDiamonds(diamonds + 10);
          }}
          onBackToSplash={() => setScreen("splash")}
          onShop={() => setScreen("shop")}
        />
      )}
    </div>
  );
}

function Splash({
  team, setTeam, difficulty, setDifficulty, diamonds, onPlay, onShop,
}: {
  team: Team; setTeam: (t: Team) => void;
  difficulty: Difficulty; setDifficulty: (d: Difficulty) => void;
  diamonds: number;
  onPlay: () => void; onShop: () => void;
}) {
  return (
    <div className="bg-white rounded-2xl border-4 border-amber-700 p-8 shadow-xl text-center">
      <h2
        className="text-6xl font-black text-amber-900 mb-2"
        style={{ fontFamily: FONT, transform: "rotate(-1deg)" }}
      >
        STICK WARS
      </h2>
      <p className="text-2xl text-amber-700 mb-8" style={{ fontFamily: FONT }}>
        💎 {diamonds}
      </p>

      <div className="mb-8">
        <h3 className="text-3xl text-amber-900 mb-3" style={{ fontFamily: FONT }}>
          Pick your team
        </h3>
        <div className="flex gap-6 justify-center">
          <button
            onClick={() => setTeam("green")}
            className={`px-8 py-6 rounded-2xl border-4 text-3xl font-bold transition-all ${
              team === "green"
                ? "border-green-700 bg-green-100 scale-110"
                : "border-gray-300 bg-white opacity-60"
            }`}
            style={{ fontFamily: FONT, color: "#15803d" }}
          >
            🟢 Green
          </button>
          <button
            onClick={() => setTeam("red")}
            className={`px-8 py-6 rounded-2xl border-4 text-3xl font-bold transition-all ${
              team === "red"
                ? "border-red-700 bg-red-100 scale-110"
                : "border-gray-300 bg-white opacity-60"
            }`}
            style={{ fontFamily: FONT, color: "#b91c1c" }}
          >
            🔴 Red
          </button>
        </div>
      </div>

      <div className="mb-8">
        <h3 className="text-3xl text-amber-900 mb-3" style={{ fontFamily: FONT }}>
          Difficulty
        </h3>
        <div className="flex gap-3 justify-center flex-wrap">
          {(["easy", "normal", "hard"] as Difficulty[]).map((d) => (
            <button
              key={d}
              onClick={() => setDifficulty(d)}
              className={`px-6 py-3 rounded-xl border-4 text-2xl font-bold capitalize transition-all ${
                difficulty === d
                  ? "border-amber-700 bg-amber-200 text-amber-900"
                  : "border-gray-300 bg-white opacity-60 text-gray-700"
              }`}
              style={{ fontFamily: FONT }}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-4 justify-center flex-wrap">
        <button
          onClick={onPlay}
          className="px-12 py-5 text-4xl font-black rounded-2xl bg-red-600 hover:bg-red-500 text-white border-4 border-red-800 shadow-lg active:translate-y-1 transition-all"
          style={{ fontFamily: FONT }}
        >
          FIGHT!
        </button>
        <button
          onClick={onShop}
          className="px-8 py-5 text-3xl font-bold rounded-2xl bg-amber-600 hover:bg-amber-500 text-white border-4 border-amber-800 shadow-lg active:translate-y-1 transition-all"
          style={{ fontFamily: FONT }}
        >
          🛒 Shop
        </button>
      </div>
    </div>
  );
}

function Shop({
  diamonds, upgrades, onBuy, onBack,
}: {
  diamonds: number;
  upgrades: Upgrades;
  onBuy: (id: keyof Upgrades, cost: number) => void;
  onBack: () => void;
}) {
  return (
    <div className="bg-white rounded-2xl border-4 border-amber-700 p-6 shadow-xl">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-4xl font-black text-amber-900" style={{ fontFamily: FONT }}>
          🛒 Shop
        </h2>
        <p className="text-3xl text-amber-700" style={{ fontFamily: FONT }}>
          💎 {diamonds}
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {SHOP_ITEMS.map((item) => {
          const owned = upgrades[item.id];
          const canAfford = diamonds >= item.cost;
          return (
            <div
              key={item.id}
              className={`p-4 rounded-xl border-4 ${
                owned ? "border-green-600 bg-green-50" : "border-amber-300 bg-amber-50"
              }`}
            >
              <div className="flex items-center gap-3 mb-2">
                <span className="text-4xl">{item.emoji}</span>
                <div>
                  <h3 className="text-2xl font-bold text-amber-900" style={{ fontFamily: FONT }}>
                    {item.name}
                  </h3>
                  <p className="text-lg text-amber-700" style={{ fontFamily: FONT }}>
                    {item.desc}
                  </p>
                </div>
              </div>
              <button
                onClick={() => onBuy(item.id, item.cost)}
                disabled={owned || !canAfford}
                className={`w-full mt-2 py-2 text-xl font-bold rounded-lg ${
                  owned
                    ? "bg-green-600 text-white cursor-default"
                    : canAfford
                    ? "bg-amber-600 hover:bg-amber-500 text-white"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
                style={{ fontFamily: FONT }}
              >
                {owned ? "Owned ✓" : `💎 ${item.cost}`}
              </button>
            </div>
          );
        })}
      </div>
      <button
        onClick={onBack}
        className="mt-6 px-8 py-3 text-2xl font-bold rounded-xl bg-amber-700 hover:bg-amber-600 text-white"
        style={{ fontFamily: FONT }}
      >
        ← Back
      </button>
    </div>
  );
}

function Battle({
  team, difficulty, upgrades, onResult, onBackToSplash, onShop,
}: {
  team: Team;
  difficulty: Difficulty;
  upgrades: Upgrades;
  onResult: (won: boolean) => void;
  onBackToSplash: () => void;
  onShop: () => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const stateRef = useRef<GameState | null>(null);
  const lastTimeRef = useRef<number>(0);
  const rafRef = useRef<number | null>(null);
  const resultReportedRef = useRef(false);

  const [hud, setHud] = useState({
    gold: STARTING_GOLD,
    playerHp: castleMaxHp(upgrades),
    enemyHp: CASTLE_HP,
    playerHpMax: castleMaxHp(upgrades),
    enemyHpMax: CASTLE_HP,
    outcome: "playing" as "playing" | "win" | "lose",
  });

  // Init game state once.
  if (stateRef.current === null) {
    const playerHpMax = castleMaxHp(upgrades);
    const init: GameState = {
      playerTeam: team,
      difficulty,
      units: [],
      projectiles: [],
      damages: [],
      playerGold: STARTING_GOLD,
      enemyGold: STARTING_GOLD,
      playerCastleHp: playerHpMax,
      enemyCastleHp: CASTLE_HP,
      playerCastleMaxHp: playerHpMax,
      enemyCastleMaxHp: CASTLE_HP,
      enemyCooldown: { sword: 2, archer: 5, boss: 30 },
      outcome: "playing",
      nextId: 1,
    };
    // Free starting miner for player.
    init.units.push(makeUnit(init, "miner", "player", team));
    init.units.push(makeUnit(init, "miner", "enemy", team));
    stateRef.current = init;
  }

  function makeUnit(
    state: GameState,
    type: UnitType,
    side: "player" | "enemy",
    playerTeam: Team
  ): Unit {
    const def = UNIT_DEFS[type];
    const isPlayer = side === "player";
    const x = isPlayer ? PLAYER_CASTLE_X + CASTLE_W : ENEMY_CASTLE_X - def.width;
    return {
      id: state.nextId++,
      type,
      team: isPlayer ? playerTeam : playerTeam === "green" ? "red" : "green",
      x,
      y: GROUND_Y - def.height,
      hp: def.hp,
      maxHp: def.hp,
      attackCooldown: 0,
      atMine: false,
    };
  }

  function isPlayerUnit(u: Unit, playerTeam: Team) {
    return u.team === playerTeam;
  }

  const spawnPlayerUnit = useCallback(
    (type: UnitType) => {
      const s = stateRef.current;
      if (!s || s.outcome !== "playing") return;
      const cost = type === "boss" ? bossCost(upgrades) : UNIT_DEFS[type].cost;
      if (s.playerGold < cost) return;
      if (type === "boss") {
        const aliveBoss = s.units.find((u) => isPlayerUnit(u, s.playerTeam) && u.type === "boss");
        if (aliveBoss) return;
      }
      s.playerGold -= cost;
      s.units.push(makeUnit(s, type, "player", s.playerTeam));
    },
    [upgrades]
  );

  // Game loop.
  useEffect(() => {
    function loop(t: number) {
      const s = stateRef.current;
      if (!s) return;
      const dt = lastTimeRef.current ? Math.min((t - lastTimeRef.current) / 1000, 0.05) : 0;
      lastTimeRef.current = t;
      if (s.outcome === "playing") {
        step(s, dt, upgrades);
      }
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext("2d");
        if (ctx) draw(ctx, s, upgrades);
      }
      // Push HUD updates ~10Hz via simple decimation.
      hudTickRef.current += dt;
      if (hudTickRef.current > 0.1 || s.outcome !== "playing") {
        hudTickRef.current = 0;
        setHud({
          gold: Math.floor(s.playerGold),
          playerHp: Math.max(0, Math.round(s.playerCastleHp)),
          enemyHp: Math.max(0, Math.round(s.enemyCastleHp)),
          playerHpMax: s.playerCastleMaxHp,
          enemyHpMax: s.enemyCastleMaxHp,
          outcome: s.outcome,
        });
      }
      if (s.outcome !== "playing" && !resultReportedRef.current) {
        resultReportedRef.current = true;
        onResult(s.outcome === "win");
      }
      rafRef.current = requestAnimationFrame(loop);
    }
    rafRef.current = requestAnimationFrame(loop);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [upgrades, onResult]);

  const hudTickRef = useRef(0);

  // Keyboard shortcuts.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "1") spawnPlayerUnit("miner");
      if (e.key === "2") spawnPlayerUnit("swordsman");
      if (e.key === "3") spawnPlayerUnit("archer");
      if (e.key === "4") spawnPlayerUnit("boss");
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [spawnPlayerUnit]);

  // Responsive canvas sizing.
  useEffect(() => {
    function fit() {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const parent = canvas.parentElement;
      if (!parent) return;
      const w = parent.clientWidth;
      const scale = Math.min(1, w / FIELD_W);
      canvas.style.width = FIELD_W * scale + "px";
      canvas.style.height = FIELD_H * scale + "px";
    }
    fit();
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, []);

  const playerCost = (t: UnitType) => (t === "boss" ? bossCost(upgrades) : UNIT_DEFS[t].cost);

  return (
    <div className="bg-white rounded-2xl border-4 border-amber-700 p-4 shadow-xl">
      <div className="flex justify-between mb-2 text-xl items-center" style={{ fontFamily: FONT }}>
        <div className="flex items-center gap-2">
          <span className="text-2xl">💰</span>
          <span className="text-amber-900 font-bold text-2xl">{hud.gold}</span>
        </div>
        <div className="flex-1 mx-4 grid grid-cols-2 gap-3">
          <div>
            <div className="text-xs text-green-700 font-bold">YOU ({team})</div>
            <div className="bg-gray-200 rounded h-3 overflow-hidden">
              <div
                className="bg-green-600 h-full transition-all"
                style={{
                  width: `${(hud.playerHp / hud.playerHpMax) * 100}%`,
                  background: team === "green" ? "#22c55e" : "#ef4444",
                }}
              />
            </div>
          </div>
          <div>
            <div className="text-xs text-red-700 font-bold text-right">ENEMY</div>
            <div className="bg-gray-200 rounded h-3 overflow-hidden">
              <div
                className="h-full ml-auto transition-all"
                style={{
                  width: `${(hud.enemyHp / hud.enemyHpMax) * 100}%`,
                  background: team === "green" ? "#ef4444" : "#22c55e",
                  marginLeft: "auto",
                }}
              />
            </div>
          </div>
        </div>
      </div>

      <div
        className="w-full overflow-hidden rounded-xl border-4 border-amber-300 mx-auto"
        style={{ maxWidth: FIELD_W }}
      >
        <canvas
          ref={canvasRef}
          width={FIELD_W}
          height={FIELD_H}
          className="block"
          style={{ background: "#fef3c7" }}
        />
      </div>

      <div className="mt-3 grid grid-cols-4 gap-2">
        {(["miner", "swordsman", "archer", "boss"] as UnitType[]).map((t, i) => {
          const cost = playerCost(t);
          const canAfford = hud.gold >= cost;
          return (
            <button
              key={t}
              onClick={() => spawnPlayerUnit(t)}
              disabled={!canAfford || hud.outcome !== "playing"}
              className={`py-3 rounded-xl border-4 text-center transition-all ${
                canAfford && hud.outcome === "playing"
                  ? "border-amber-700 bg-amber-100 hover:bg-amber-200 active:translate-y-0.5"
                  : "border-gray-300 bg-gray-100 text-gray-400 cursor-not-allowed"
              }`}
              style={{ fontFamily: FONT }}
            >
              <div className="text-2xl">{unitEmoji(t)}</div>
              <div className="text-base font-bold capitalize">{t}</div>
              <div className="text-sm">💰 {cost} <span className="text-gray-500">[{i + 1}]</span></div>
            </button>
          );
        })}
      </div>

      {hud.outcome !== "playing" && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl border-4 border-amber-700 p-8 text-center max-w-sm w-full mx-4 shadow-2xl">
            <h2
              className={`text-6xl font-black mb-3 ${hud.outcome === "win" ? "text-green-700" : "text-red-700"}`}
              style={{ fontFamily: FONT }}
            >
              {hud.outcome === "win" ? "VICTORY!" : "DEFEAT"}
            </h2>
            <p className="text-2xl mb-6 text-amber-800" style={{ fontFamily: FONT }}>
              {hud.outcome === "win" ? "+10 💎" : "0 💎"}
            </p>
            <div className="flex gap-3 justify-center flex-wrap">
              <button
                onClick={onBackToSplash}
                className="px-6 py-3 text-xl font-bold rounded-xl bg-red-600 hover:bg-red-500 text-white"
                style={{ fontFamily: FONT }}
              >
                Play Again
              </button>
              <button
                onClick={onShop}
                className="px-6 py-3 text-xl font-bold rounded-xl bg-amber-600 hover:bg-amber-500 text-white"
                style={{ fontFamily: FONT }}
              >
                🛒 Shop
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function unitEmoji(t: UnitType): string {
  switch (t) {
    case "miner": return "⛏️";
    case "swordsman": return "🗡️";
    case "archer": return "🏹";
    case "boss": return "👹";
  }
}

// Simulation step.
function step(s: GameState, dt: number, upgrades: Upgrades) {
  const playerTeam = s.playerTeam;
  const enemyTeam: Team = playerTeam === "green" ? "red" : "green";
  const diff = DIFFICULTY[s.difficulty];
  const dmgMult = damageMult(upgrades);
  const minerMult = minerRateMult(upgrades);

  // Enemy passive gold (no enemy miners, simpler AI).
  s.enemyGold += diff.goldRate * dt * 5;

  // Enemy spawn timers.
  s.enemyCooldown.sword -= dt;
  s.enemyCooldown.archer -= dt;
  s.enemyCooldown.boss -= dt;
  if (s.enemyCooldown.sword <= 0 && s.enemyGold >= UNIT_DEFS.swordsman.cost) {
    s.enemyGold -= UNIT_DEFS.swordsman.cost;
    s.units.push(makeUnitFromGame(s, "swordsman", "enemy"));
    s.enemyCooldown.sword = diff.sword;
  }
  if (s.enemyCooldown.archer <= 0 && s.enemyGold >= UNIT_DEFS.archer.cost) {
    s.enemyGold -= UNIT_DEFS.archer.cost;
    s.units.push(makeUnitFromGame(s, "archer", "enemy"));
    s.enemyCooldown.archer = diff.archer;
  }
  if (s.enemyCooldown.boss <= 0 && s.enemyGold >= UNIT_DEFS.boss.cost) {
    const hasBoss = s.units.find((u) => u.team === enemyTeam && u.type === "boss");
    if (!hasBoss) {
      s.enemyGold -= UNIT_DEFS.boss.cost;
      s.units.push(makeUnitFromGame(s, "boss", "enemy"));
      s.enemyCooldown.boss = diff.boss;
    } else {
      s.enemyCooldown.boss = 5;
    }
  }

  // Update each unit.
  for (const u of s.units) {
    if (u.hp <= 0) continue;
    const def = UNIT_DEFS[u.type];
    const isPlayer = u.team === playerTeam;
    const direction = isPlayer ? 1 : -1;

    if (u.type === "miner") {
      const targetMineX = isPlayer ? PLAYER_MINE_X : ENEMY_MINE_X;
      if (Math.abs(u.x - targetMineX) < 4) {
        u.atMine = true;
        u.x = targetMineX;
      } else {
        u.atMine = false;
        u.x += Math.sign(targetMineX - u.x) * def.speed * dt;
      }
      if (u.atMine) {
        const rate = 1.0 * minerMult;
        if (isPlayer) s.playerGold += rate * dt;
        else s.enemyGold += rate * dt;
      }
      continue;
    }

    // Combat unit: find nearest enemy in range.
    let nearestEnemy: Unit | null = null;
    let nearestDist = Infinity;
    for (const v of s.units) {
      if (v.team === u.team || v.hp <= 0 || v.type === "miner") continue;
      const d = Math.abs(v.x - u.x);
      if (d < nearestDist) {
        nearestDist = d;
        nearestEnemy = v;
      }
    }
    // Also check enemy miners as targets (lower priority — only if no other targets in range).
    if (!nearestEnemy || nearestDist > def.range) {
      for (const v of s.units) {
        if (v.team === u.team || v.hp <= 0 || v.type !== "miner") continue;
        const d = Math.abs(v.x - u.x);
        if (d < def.range && d < nearestDist) {
          nearestDist = d;
          nearestEnemy = v;
        }
      }
    }

    const enemyCastleX = isPlayer ? ENEMY_CASTLE_X : PLAYER_CASTLE_X + CASTLE_W;
    const distToCastle = isPlayer ? enemyCastleX - (u.x + def.width) : u.x - enemyCastleX;

    u.attackCooldown -= dt;

    if (nearestEnemy && nearestDist <= def.range) {
      // Attack the unit.
      if (u.attackCooldown <= 0) {
        const dmg = def.damage * dmgMult;
        nearestEnemy.hp -= dmg;
        s.damages.push({
          id: s.nextId++, x: nearestEnemy.x + UNIT_DEFS[nearestEnemy.type].width / 2,
          y: nearestEnemy.y, amount: Math.round(dmg), ttl: 0.6,
        });
        if (u.type === "archer") {
          s.projectiles.push({
            id: s.nextId++,
            team: u.team,
            x: u.x + def.width / 2,
            y: u.y + 10,
            vx: direction * 400,
            damage: 0, // visual only
          });
        }
        u.attackCooldown = def.attackInterval;
      }
    } else if (distToCastle <= def.range) {
      // Attack castle.
      if (u.attackCooldown <= 0) {
        const dmg = def.damage * dmgMult;
        if (isPlayer) s.enemyCastleHp -= dmg;
        else s.playerCastleHp -= dmg;
        s.damages.push({
          id: s.nextId++,
          x: isPlayer ? enemyCastleX + 20 : enemyCastleX - 20,
          y: GROUND_Y - CASTLE_H + 20,
          amount: Math.round(dmg), ttl: 0.6,
        });
        u.attackCooldown = def.attackInterval;
      }
    } else {
      // Walk toward enemy castle.
      u.x += direction * def.speed * dt;
    }
  }

  // Update projectiles (visual only).
  for (const p of s.projectiles) {
    p.x += p.vx * dt;
  }
  s.projectiles = s.projectiles.filter((p) => p.x > -20 && p.x < FIELD_W + 20);

  // Update damage popups.
  for (const d of s.damages) {
    d.ttl -= dt;
    d.y -= 30 * dt;
  }
  s.damages = s.damages.filter((d) => d.ttl > 0);

  // Remove dead units.
  s.units = s.units.filter((u) => u.hp > 0);

  // Win/lose.
  if (s.enemyCastleHp <= 0) s.outcome = "win";
  else if (s.playerCastleHp <= 0) s.outcome = "lose";
}

function makeUnitFromGame(s: GameState, type: UnitType, side: "player" | "enemy"): Unit {
  const def = UNIT_DEFS[type];
  const isPlayer = side === "player";
  const x = isPlayer ? PLAYER_CASTLE_X + CASTLE_W : ENEMY_CASTLE_X - def.width;
  return {
    id: s.nextId++,
    type,
    team: isPlayer ? s.playerTeam : s.playerTeam === "green" ? "red" : "green",
    x,
    y: GROUND_Y - def.height,
    hp: def.hp,
    maxHp: def.hp,
    attackCooldown: 0,
    atMine: false,
  };
}

// Drawing.
function teamFill(team: Team) { return team === "green" ? "#22c55e" : "#ef4444"; }
function teamOutline(team: Team) { return team === "green" ? "#15803d" : "#b91c1c"; }

function draw(ctx: CanvasRenderingContext2D, s: GameState, upgrades: Upgrades) {
  // Sky/ground.
  ctx.fillStyle = "#fef3c7";
  ctx.fillRect(0, 0, FIELD_W, FIELD_H);
  // Soft hills.
  ctx.fillStyle = "#fde68a";
  ctx.beginPath();
  ctx.moveTo(0, GROUND_Y);
  ctx.quadraticCurveTo(FIELD_W * 0.25, GROUND_Y - 60, FIELD_W * 0.5, GROUND_Y - 20);
  ctx.quadraticCurveTo(FIELD_W * 0.75, GROUND_Y + 20, FIELD_W, GROUND_Y - 30);
  ctx.lineTo(FIELD_W, GROUND_Y);
  ctx.closePath();
  ctx.fill();
  // Ground.
  ctx.fillStyle = "#a8854a";
  ctx.fillRect(0, GROUND_Y, FIELD_W, FIELD_H - GROUND_Y);
  ctx.fillStyle = "#8b6f3f";
  ctx.fillRect(0, GROUND_Y, FIELD_W, 4);

  const playerTeam = s.playerTeam;
  const enemyTeam: Team = playerTeam === "green" ? "red" : "green";

  // Mines.
  drawMine(ctx, PLAYER_MINE_X, GROUND_Y);
  drawMine(ctx, ENEMY_MINE_X, GROUND_Y);

  // Castles.
  drawCastle(ctx, PLAYER_CASTLE_X, playerTeam, upgrades.flag_emblem);
  drawCastle(ctx, ENEMY_CASTLE_X, enemyTeam, false);

  // Projectiles (arrows).
  ctx.strokeStyle = "#374151";
  ctx.lineWidth = 2;
  for (const p of s.projectiles) {
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
    ctx.lineTo(p.x + (p.vx > 0 ? -10 : 10), p.y);
    ctx.stroke();
  }

  // Units.
  for (const u of s.units) {
    drawUnit(ctx, u);
  }

  // Damage popups.
  ctx.fillStyle = "#dc2626";
  ctx.font = `bold 18px ${FONT}`;
  ctx.textAlign = "center";
  for (const d of s.damages) {
    ctx.globalAlpha = Math.max(0, d.ttl / 0.6);
    ctx.fillText(`-${d.amount}`, d.x, d.y);
  }
  ctx.globalAlpha = 1;
}

function drawMine(ctx: CanvasRenderingContext2D, x: number, groundY: number) {
  // Pile of rocks with gold sparkle.
  ctx.fillStyle = "#6b7280";
  ctx.beginPath();
  ctx.moveTo(x - 25, groundY);
  ctx.lineTo(x - 15, groundY - 30);
  ctx.lineTo(x, groundY - 40);
  ctx.lineTo(x + 15, groundY - 30);
  ctx.lineTo(x + 25, groundY);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#facc15";
  ctx.beginPath();
  ctx.arc(x - 5, groundY - 18, 3, 0, Math.PI * 2);
  ctx.arc(x + 8, groundY - 25, 3, 0, Math.PI * 2);
  ctx.arc(x + 2, groundY - 32, 3, 0, Math.PI * 2);
  ctx.fill();
}

function drawCastle(ctx: CanvasRenderingContext2D, x: number, team: Team, emblem: boolean) {
  const y = GROUND_Y - CASTLE_H;
  ctx.fillStyle = "#9ca3af";
  ctx.fillRect(x, y + 30, CASTLE_W, CASTLE_H - 30);
  ctx.strokeStyle = "#4b5563";
  ctx.lineWidth = 3;
  ctx.strokeRect(x, y + 30, CASTLE_W, CASTLE_H - 30);
  // Crenellations.
  for (let i = 0; i < 5; i++) {
    const cx = x + 4 + i * 19;
    ctx.fillRect(cx, y + 22, 12, 10);
  }
  // Door.
  ctx.fillStyle = "#78350f";
  ctx.fillRect(x + CASTLE_W / 2 - 12, y + 80, 24, 60);
  // Flag pole.
  ctx.fillStyle = "#52525b";
  ctx.fillRect(x + CASTLE_W / 2 - 1, y - 40, 2, 60);
  // Flag (waves slightly via time).
  const t = (typeof performance !== "undefined" ? performance.now() : 0) / 400;
  const wave = Math.sin(t) * 3;
  ctx.fillStyle = teamFill(team);
  ctx.beginPath();
  ctx.moveTo(x + CASTLE_W / 2, y - 40);
  ctx.lineTo(x + CASTLE_W / 2 + 30, y - 32 + wave);
  ctx.lineTo(x + CASTLE_W / 2, y - 24);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = teamOutline(team);
  ctx.lineWidth = 1.5;
  ctx.stroke();
  if (emblem) {
    ctx.fillStyle = "#fde047";
    ctx.font = "12px serif";
    ctx.fillText("★", x + CASTLE_W / 2 + 6, y - 28);
  }
}

function drawUnit(ctx: CanvasRenderingContext2D, u: Unit) {
  const fill = teamFill(u.team);
  const outline = teamOutline(u.team);
  const def = UNIT_DEFS[u.type];
  const cx = u.x + def.width / 2;
  const headR = u.type === "boss" ? 9 : 5;
  const headY = u.y + headR;
  const bodyTopY = headY + headR;
  const bodyBottomY = u.y + def.height - 8;
  const legY = u.y + def.height;

  ctx.strokeStyle = outline;
  ctx.lineWidth = u.type === "boss" ? 3 : 2;
  ctx.fillStyle = fill;

  // Head.
  ctx.beginPath();
  ctx.arc(cx, headY, headR, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Body.
  ctx.beginPath();
  ctx.moveTo(cx, bodyTopY);
  ctx.lineTo(cx, bodyBottomY);
  ctx.stroke();

  // Walking animation: legs alternate based on x position.
  const phase = Math.floor(u.x / 8) % 2 === 0 ? 1 : -1;
  ctx.beginPath();
  ctx.moveTo(cx, bodyBottomY);
  ctx.lineTo(cx - 5 * phase, legY);
  ctx.moveTo(cx, bodyBottomY);
  ctx.lineTo(cx + 5 * phase, legY);
  ctx.stroke();

  // Arms / weapon.
  if (u.type === "swordsman") {
    ctx.beginPath();
    ctx.moveTo(cx, bodyTopY + 4);
    ctx.lineTo(cx + 10, bodyTopY - 2);
    ctx.stroke();
    // Sword.
    ctx.strokeStyle = "#9ca3af";
    ctx.beginPath();
    ctx.moveTo(cx + 10, bodyTopY - 2);
    ctx.lineTo(cx + 18, bodyTopY - 12);
    ctx.stroke();
  } else if (u.type === "archer") {
    ctx.beginPath();
    ctx.moveTo(cx, bodyTopY + 4);
    ctx.lineTo(cx + 8, bodyTopY + 2);
    ctx.stroke();
    // Bow.
    ctx.strokeStyle = "#7c3f00";
    ctx.beginPath();
    ctx.arc(cx + 12, bodyTopY + 2, 8, -Math.PI / 2, Math.PI / 2);
    ctx.stroke();
  } else if (u.type === "boss") {
    ctx.beginPath();
    ctx.moveTo(cx, bodyTopY + 6);
    ctx.lineTo(cx + 14, bodyTopY + 2);
    ctx.stroke();
    // Club.
    ctx.fillStyle = "#7c3f00";
    ctx.beginPath();
    ctx.arc(cx + 16, bodyTopY - 4, 7, 0, Math.PI * 2);
    ctx.fill();
  } else if (u.type === "miner") {
    // Pickaxe.
    ctx.beginPath();
    ctx.moveTo(cx, bodyTopY + 4);
    ctx.lineTo(cx + 8, bodyTopY - 4);
    ctx.stroke();
    ctx.strokeStyle = "#9ca3af";
    ctx.beginPath();
    ctx.moveTo(cx + 6, bodyTopY - 6);
    ctx.lineTo(cx + 12, bodyTopY - 2);
    ctx.stroke();
  }

  // HP bar.
  if (u.hp < u.maxHp) {
    const barW = def.width;
    const barY = u.y - 6;
    ctx.fillStyle = "#374151";
    ctx.fillRect(u.x, barY, barW, 3);
    ctx.fillStyle = fill;
    ctx.fillRect(u.x, barY, barW * (u.hp / u.maxHp), 3);
  }
}
