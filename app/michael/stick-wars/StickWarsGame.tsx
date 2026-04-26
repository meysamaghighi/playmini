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
const STARTING_GOLD = 75;
const CASTLE_HP = 1000;
const WALL_X = FIELD_W / 2;
const WALL_W = 32;
const WALL_H = 120;
const WALL_HP = 500;
const PLAYER_DEFENSE_X = PLAYER_CASTLE_X + CASTLE_W + 180;
// Castle dome turret (upgrade).
const DOME_RANGE = 300;
const DOME_ARROW_DAMAGE = 8;
const DOME_ARROW_INTERVAL = 1.5;
const DOME_ARROW_SPEED = 400;
// Rifle bullets (upgrade on top of dome).
const DOME_BULLET_DAMAGE = 16;
const DOME_BULLET_INTERVAL = 0.7;
const DOME_BULLET_SPEED = 900;

type UnitType = "miner" | "swordsman" | "archer" | "rifleman" | "cavalry" | "boss";
type Team = "green" | "red";
type Difficulty = "easy" | "normal" | "hard";
type Stance = "offend" | "defend";

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
  rifleman:  { cost: 75,  hp: 55,  damage: 14, attackInterval: 0.55, range: 240, speed: 38,  width: 18, height: 42 },
  cavalry:   { cost: 40,  hp: 110, damage: 18, attackInterval: 0.9,  range: 32,  speed: 95,  width: 36, height: 50 },
  boss:      { cost: 200, hp: 500, damage: 40, attackInterval: 1.5,  range: 40,  speed: 30,  width: 36, height: 78 },
};

const DIFFICULTY: Record<Difficulty, { goldRate: number; sword: number; archer: number; rifle: number; boss: number }> = {
  easy:   { goldRate: 0.3, sword: 12, archer: 25, rifle: 35, boss: 200 },
  normal: { goldRate: 0.7, sword: 6,  archer: 12, rifle: 18, boss: 90 },
  hard:   { goldRate: 1.1, sword: 4,  archer: 8,  rifle: 11, boss: 55 },
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
  vy: number;
  damage: number;
  variant: "arrow" | "bullet";
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
  wallHp: number;
  enemyCooldown: { sword: number; archer: number; rifle: number; boss: number };
  domeCooldown: number;
  playerStance: Stance;
  outcome: "playing" | "win" | "lose";
  nextId: number;
}

interface Upgrades {
  castle_armor: boolean;
  sharper_swords: boolean;
  faster_miners: boolean;
  royal_boss: boolean;
  flag_emblem: boolean;
  castle_dome: boolean;
  rifle_bullets: boolean;
}

const DEFAULT_UPGRADES: Upgrades = {
  castle_armor: false,
  sharper_swords: false,
  faster_miners: false,
  royal_boss: false,
  flag_emblem: false,
  castle_dome: false,
  rifle_bullets: false,
};

const SHOP_ITEMS: { id: keyof Upgrades; name: string; cost: number; emoji: string; desc: string; requires?: keyof Upgrades }[] = [
  { id: "castle_armor",   name: "Castle Armor",         cost: 20, emoji: "🛡️", desc: "+20% castle HP" },
  { id: "sharper_swords", name: "Sharper Swords",       cost: 25, emoji: "⚔️", desc: "+25% unit damage" },
  { id: "faster_miners",  name: "Faster Miners",        cost: 30, emoji: "🏃", desc: "+50% gold from miners" },
  { id: "royal_boss",     name: "Royal Boss",           cost: 40, emoji: "👑", desc: "Boss costs 150g" },
  { id: "flag_emblem",    name: "Custom Flag Emblem",   cost: 15, emoji: "🎨", desc: "Star on your flag" },
  { id: "castle_dome",    name: "Castle Dome",          cost: 35, emoji: "🏰", desc: "Castle auto-shoots arrows" },
  { id: "rifle_bullets",  name: "Rifle Bullets",        cost: 50, emoji: "🎯", desc: "Dome shoots fast bullets", requires: "castle_dome" },
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
          const reqMissing = item.requires && !upgrades[item.requires];
          const reqLabel = item.requires
            ? SHOP_ITEMS.find((s) => s.id === item.requires)?.name
            : undefined;
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
                  {reqMissing && (
                    <p className="text-sm text-red-600" style={{ fontFamily: FONT }}>
                      Needs: {reqLabel}
                    </p>
                  )}
                </div>
              </div>
              <button
                onClick={() => onBuy(item.id, item.cost)}
                disabled={owned || !canAfford || reqMissing}
                className={`w-full mt-2 py-2 text-xl font-bold rounded-lg ${
                  owned
                    ? "bg-green-600 text-white cursor-default"
                    : canAfford && !reqMissing
                    ? "bg-amber-600 hover:bg-amber-500 text-white"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
                style={{ fontFamily: FONT }}
              >
                {owned ? "Owned ✓" : reqMissing ? "Locked" : `💎 ${item.cost}`}
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
    wallHp: WALL_HP,
    outcome: "playing" as "playing" | "win" | "lose",
  });
  const [stance, setStance] = useState<Stance>("offend");

  const toggleStance = useCallback(() => {
    const s = stateRef.current;
    if (!s || s.outcome !== "playing") return;
    const next: Stance = s.playerStance === "offend" ? "defend" : "offend";
    s.playerStance = next;
    setStance(next);
  }, []);

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
      wallHp: WALL_HP,
      enemyCooldown: { sword: 4, archer: 10, rifle: 22, boss: 60 },
      domeCooldown: 0,
      playerStance: "offend",
      outcome: "playing",
      nextId: 1,
    };
    // Free starting miner for player — pre-positioned AT the mine so gold flows immediately.
    const playerMiner = makeUnit(init, "miner", "player", team);
    playerMiner.x = PLAYER_MINE_X;
    playerMiner.atMine = true;
    init.units.push(playerMiner);
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
          wallHp: Math.max(0, Math.round(s.wallHp)),
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
      if (e.key === "4") spawnPlayerUnit("rifleman");
      if (e.key === "5") spawnPlayerUnit("cavalry");
      if (e.key === "6") spawnPlayerUnit("boss");
      if (e.key === "d" || e.key === "D") toggleStance();
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

      <div className="mt-3 flex gap-2 justify-center">
        <button
          onClick={toggleStance}
          disabled={hud.outcome !== "playing"}
          className={`px-4 py-2 rounded-xl border-4 text-xl font-bold transition-all ${
            stance === "offend"
              ? "border-red-700 bg-red-100 text-red-800"
              : "border-blue-700 bg-blue-100 text-blue-800"
          } ${hud.outcome !== "playing" ? "opacity-50 cursor-not-allowed" : "hover:opacity-90"}`}
          style={{ fontFamily: FONT }}
          title="Toggle stance (D)"
        >
          {stance === "offend" ? "⚔️ Attack" : "🛡️ Defend"} <span className="text-sm text-gray-500">[D]</span>
        </button>
      </div>
      <div className="mt-2 grid grid-cols-3 sm:grid-cols-6 gap-2">
        {(["miner", "swordsman", "archer", "rifleman", "cavalry", "boss"] as UnitType[]).map((t, i) => {
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
    case "rifleman": return "🔫";
    case "cavalry": return "🐴";
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
  s.enemyCooldown.rifle -= dt;
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
  if (s.enemyCooldown.rifle <= 0 && s.enemyGold >= UNIT_DEFS.rifleman.cost) {
    s.enemyGold -= UNIT_DEFS.rifleman.cost;
    s.units.push(makeUnitFromGame(s, "rifleman", "enemy"));
    s.enemyCooldown.rifle = diff.rifle;
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

    const wallAlive = s.wallHp > 0;
    const wallLeftEdge = WALL_X - WALL_W / 2;
    const wallRightEdge = WALL_X + WALL_W / 2;
    const onPlayerSide = (v: Unit) => v.x + UNIT_DEFS[v.type].width / 2 < WALL_X;
    const myUnitOnPlayerSide = onPlayerSide(u);

    // Combat unit: find nearest enemy in range. While wall is alive, only see enemies on same side.
    let nearestEnemy: Unit | null = null;
    let nearestDist = Infinity;
    for (const v of s.units) {
      if (v.team === u.team || v.hp <= 0 || v.type === "miner") continue;
      if (wallAlive && onPlayerSide(v) !== myUnitOnPlayerSide) continue;
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
        if (wallAlive && onPlayerSide(v) !== myUnitOnPlayerSide) continue;
        const d = Math.abs(v.x - u.x);
        if (d < def.range && d < nearestDist) {
          nearestDist = d;
          nearestEnemy = v;
        }
      }
    }

    // Forward structure: wall while alive, otherwise enemy castle.
    // Player on "defend" stance ignores structures and holds the line instead.
    const playerDefending = isPlayer && s.playerStance === "defend";
    let structureX: number;
    let attackingWall = false;
    if (playerDefending) {
      structureX = PLAYER_DEFENSE_X;
    } else if (wallAlive) {
      structureX = isPlayer ? wallLeftEdge : wallRightEdge;
      attackingWall = true;
    } else {
      structureX = isPlayer ? ENEMY_CASTLE_X : PLAYER_CASTLE_X + CASTLE_W;
    }
    const distToStructure = isPlayer ? structureX - (u.x + def.width) : u.x - structureX;

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
            vy: 0,
            damage: 0, // visual only — damage already applied above
            variant: "arrow",
          });
        } else if (u.type === "rifleman") {
          s.projectiles.push({
            id: s.nextId++,
            team: u.team,
            x: u.x + def.width / 2,
            y: u.y + 8,
            vx: direction * 850,
            vy: 0,
            damage: 0,
            variant: "bullet",
          });
        }
        u.attackCooldown = def.attackInterval;
      }
    } else if (!playerDefending && distToStructure <= def.range) {
      // Attack wall or enemy castle (defenders never strike structures).
      if (u.attackCooldown <= 0) {
        const dmg = def.damage * dmgMult;
        if (attackingWall) {
          s.wallHp -= dmg;
          s.damages.push({
            id: s.nextId++,
            x: WALL_X,
            y: GROUND_Y - WALL_H + 20,
            amount: Math.round(dmg), ttl: 0.6,
          });
        } else {
          if (isPlayer) s.enemyCastleHp -= dmg;
          else s.playerCastleHp -= dmg;
          s.damages.push({
            id: s.nextId++,
            x: isPlayer ? structureX + 20 : structureX - 20,
            y: GROUND_Y - CASTLE_H + 20,
            amount: Math.round(dmg), ttl: 0.6,
          });
        }
        u.attackCooldown = def.attackInterval;
      }
    } else if (playerDefending) {
      // Hold the line: walk toward defense X, then stand.
      const target = PLAYER_DEFENSE_X - def.width;
      if (u.x < target - 2) u.x = Math.min(target, u.x + def.speed * dt);
      else if (u.x > target + 2) u.x = Math.max(target, u.x - def.speed * dt);
    } else {
      // Walk toward forward structure, but never cross a live wall.
      const desiredX = u.x + direction * def.speed * dt;
      if (wallAlive) {
        if (isPlayer) u.x = Math.min(desiredX, wallLeftEdge - def.width);
        else u.x = Math.max(desiredX, wallRightEdge);
      } else {
        u.x = desiredX;
      }
    }
  }

  // Castle dome turret (player-only upgrade).
  if (upgrades.castle_dome) {
    s.domeCooldown -= dt;
    if (s.domeCooldown <= 0) {
      // Pick the closest enemy unit on the field.
      let closest: Unit | null = null;
      let closestDist = Infinity;
      for (const v of s.units) {
        if (v.team === playerTeam || v.hp <= 0) continue;
        const d = v.x - (PLAYER_CASTLE_X + CASTLE_W / 2);
        if (d > 0 && d < DOME_RANGE && d < closestDist) {
          closestDist = d;
          closest = v;
        }
      }
      if (closest) {
        const useBullets = upgrades.rifle_bullets;
        const dmg = useBullets ? DOME_BULLET_DAMAGE : DOME_ARROW_DAMAGE;
        const speed = useBullets ? DOME_BULLET_SPEED : DOME_ARROW_SPEED;
        // Apply damage immediately; spawn an AIMED projectile for visuals.
        closest.hp -= dmg;
        s.damages.push({
          id: s.nextId++,
          x: closest.x + UNIT_DEFS[closest.type].width / 2,
          y: closest.y,
          amount: Math.round(dmg), ttl: 0.6,
        });
        // Spawn from the cannon muzzle on top of the dome.
        // baseY = GROUND_Y - CASTLE_H + 30, topY = baseY - CASTLE_W/2, barrel offset 24px right & 3px up.
        const fromX = PLAYER_CASTLE_X + CASTLE_W / 2 + 24;
        const fromY = GROUND_Y - CASTLE_H + 30 - CASTLE_W / 2 - 3;
        const targetX = closest.x + UNIT_DEFS[closest.type].width / 2;
        const targetY = closest.y + UNIT_DEFS[closest.type].height / 2;
        const dx = targetX - fromX;
        const dy = targetY - fromY;
        const dist = Math.hypot(dx, dy) || 1;
        s.projectiles.push({
          id: s.nextId++,
          team: playerTeam,
          x: fromX,
          y: fromY,
          vx: (dx / dist) * speed,
          vy: (dy / dist) * speed,
          damage: 0,
          variant: useBullets ? "bullet" : "arrow",
        });
        s.domeCooldown = useBullets ? DOME_BULLET_INTERVAL : DOME_ARROW_INTERVAL;
      } else {
        s.domeCooldown = 0.3; // re-check soon
      }
    }
  }

  // Update projectiles (visual only).
  for (const p of s.projectiles) {
    p.x += p.vx * dt;
    p.y += p.vy * dt;
  }
  s.projectiles = s.projectiles.filter(
    (p) => p.x > -20 && p.x < FIELD_W + 20 && p.y > -20 && p.y < GROUND_Y + 20
  );

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

  // Player castle dome turret (upgrade).
  if (upgrades.castle_dome) {
    drawDome(ctx, PLAYER_CASTLE_X, upgrades.rifle_bullets);
  }

  // Wall.
  drawWall(ctx, s.wallHp);

  // Defense line (visible only when player is defending).
  if (s.playerStance === "defend") {
    ctx.strokeStyle = "#3b82f6";
    ctx.setLineDash([6, 6]);
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(PLAYER_DEFENSE_X, 30);
    ctx.lineTo(PLAYER_DEFENSE_X, GROUND_Y);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  // Projectiles drawn as a line along the velocity vector (so aimed shots look right).
  for (const p of s.projectiles) {
    const speed = Math.hypot(p.vx, p.vy) || 1;
    const ux = p.vx / speed;
    const uy = p.vy / speed;
    if (p.variant === "bullet") {
      ctx.strokeStyle = "#facc15";
      ctx.lineWidth = 3;
      const len = 18;
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
      ctx.lineTo(p.x - ux * len, p.y - uy * len);
      ctx.stroke();
    } else {
      ctx.strokeStyle = "#374151";
      ctx.lineWidth = 2;
      const len = 12;
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
      ctx.lineTo(p.x - ux * len, p.y - uy * len);
      ctx.stroke();
    }
  }

  // Units.
  for (const u of s.units) {
    drawUnit(ctx, u, playerTeam);
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

function drawDome(ctx: CanvasRenderingContext2D, castleX: number, hasBullets: boolean) {
  const cx = castleX + CASTLE_W / 2;
  const radius = CASTLE_W / 2; // dome diameter == castle width
  // Dome sits on top of the castle wall; baseY is the wall's top edge.
  const baseY = GROUND_Y - CASTLE_H + 30;
  // Half-dome.
  ctx.fillStyle = hasBullets ? "#7c3aed" : "#475569";
  ctx.beginPath();
  ctx.arc(cx, baseY, radius, Math.PI, 0);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "#1f2937";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(cx, baseY, radius, Math.PI, 0);
  ctx.stroke();
  // Window slits along the dome (cosmetic).
  ctx.fillStyle = "#0f172a";
  for (const a of [Math.PI * 0.85, Math.PI * 0.65, Math.PI * 0.5, Math.PI * 0.35, Math.PI * 0.15]) {
    const wx = cx + Math.cos(a + Math.PI) * (radius - 10);
    const wy = baseY + Math.sin(a + Math.PI) * (radius - 10);
    ctx.fillRect(wx - 2, wy - 4, 4, 8);
  }
  // Cannon barrel on top, pointing right toward enemy.
  const topY = baseY - radius;
  ctx.fillStyle = hasBullets ? "#1f2937" : "#374151";
  ctx.fillRect(cx - 4, topY - 6, 28, 6);
  if (hasBullets) {
    // Glowing muzzle to indicate rifle upgrade.
    ctx.fillStyle = "#facc15";
    ctx.beginPath();
    ctx.arc(cx + 24, topY - 3, 3, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawWall(ctx: CanvasRenderingContext2D, hp: number) {
  if (hp <= 0) return;
  const wallY = GROUND_Y - WALL_H;
  const x = WALL_X - WALL_W / 2;
  // Stone body with vertical gradient.
  const grad = ctx.createLinearGradient(x, wallY, x, GROUND_Y);
  grad.addColorStop(0, "#6b7280");
  grad.addColorStop(0.5, "#4b5563");
  grad.addColorStop(1, "#374151");
  ctx.fillStyle = grad;
  ctx.fillRect(x, wallY, WALL_W, WALL_H);
  // Buttress/base flare.
  ctx.fillStyle = "#374151";
  ctx.beginPath();
  ctx.moveTo(x - 4, GROUND_Y);
  ctx.lineTo(x, GROUND_Y - 14);
  ctx.lineTo(x + WALL_W, GROUND_Y - 14);
  ctx.lineTo(x + WALL_W + 4, GROUND_Y);
  ctx.closePath();
  ctx.fill();
  // Stone block courses (offset like real masonry).
  const brickH = 14;
  const halfW = WALL_W / 2;
  ctx.strokeStyle = "#1f2937";
  ctx.lineWidth = 1.2;
  const rows = Math.floor(WALL_H / brickH);
  for (let row = 0; row < rows; row++) {
    const y = wallY + row * brickH;
    // Horizontal mortar line.
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + WALL_W, y);
    ctx.stroke();
    // Vertical seam, offset every other row.
    const seamX = row % 2 === 0 ? x + halfW : x;
    ctx.beginPath();
    ctx.moveTo(seamX, y);
    ctx.lineTo(seamX, y + brickH);
    ctx.stroke();
    if (row % 2 === 0) {
      // small highlight on each block to suggest stone shading
      ctx.fillStyle = "rgba(255,255,255,0.06)";
      ctx.fillRect(x + 1, y + 1, halfW - 2, 2);
      ctx.fillRect(x + halfW + 1, y + 1, halfW - 2, 2);
    }
  }
  // Outline.
  ctx.strokeStyle = "#1f2937";
  ctx.lineWidth = 2;
  ctx.strokeRect(x, wallY, WALL_W, WALL_H);
  // Crenellations on top.
  ctx.fillStyle = "#4b5563";
  const merlonW = 8;
  const merlonGap = 4;
  const merlonH = 8;
  for (let i = 0; i < 3; i++) {
    const mx = x + i * (merlonW + merlonGap);
    if (mx + merlonW <= x + WALL_W) {
      ctx.fillRect(mx, wallY - merlonH, merlonW, merlonH);
      ctx.strokeStyle = "#1f2937";
      ctx.lineWidth = 1.2;
      ctx.strokeRect(mx, wallY - merlonH, merlonW, merlonH);
    }
  }
  // Iron banding (reinforcement bands).
  ctx.fillStyle = "#1f2937";
  ctx.fillRect(x - 2, wallY + WALL_H * 0.33 - 1, WALL_W + 4, 3);
  ctx.fillRect(x - 2, wallY + WALL_H * 0.66 - 1, WALL_W + 4, 3);
  // Rivets on bands.
  ctx.fillStyle = "#9ca3af";
  for (const by of [wallY + WALL_H * 0.33, wallY + WALL_H * 0.66]) {
    ctx.beginPath();
    ctx.arc(x + 4, by, 1.2, 0, Math.PI * 2);
    ctx.arc(x + WALL_W - 4, by, 1.2, 0, Math.PI * 2);
    ctx.fill();
  }
  // HP bar above wall.
  const barY = wallY - merlonH - 8;
  ctx.fillStyle = "#374151";
  ctx.fillRect(x - 6, barY, WALL_W + 12, 4);
  ctx.fillStyle = hp / WALL_HP > 0.5 ? "#22c55e" : hp / WALL_HP > 0.25 ? "#f59e0b" : "#dc2626";
  ctx.fillRect(x - 6, barY, (WALL_W + 12) * (hp / WALL_HP), 4);
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

function drawCavalry(ctx: CanvasRenderingContext2D, u: Unit, fill: string, outline: string, facingRight: boolean) {
  const def = UNIT_DEFS[u.type];
  const horseY = u.y + def.height - 22;
  const horseLeftX = u.x + 4;
  const horseRightX = u.x + def.width - 4;
  const cxBody = (horseLeftX + horseRightX) / 2;
  const headSide = facingRight ? horseRightX : horseLeftX;
  const tailSide = facingRight ? horseLeftX : horseRightX;
  const dir = facingRight ? 1 : -1;

  // Body with subtle dappling.
  const bodyGrad = ctx.createLinearGradient(cxBody, horseY - 8, cxBody, horseY + 10);
  bodyGrad.addColorStop(0, "#8b4513");
  bodyGrad.addColorStop(1, "#5a2c0a");
  ctx.fillStyle = bodyGrad;
  ctx.strokeStyle = "#2a1505";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.ellipse(cxBody, horseY, (horseRightX - horseLeftX) / 2, 9, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  // Dapple spots.
  ctx.fillStyle = "rgba(0,0,0,0.18)";
  ctx.beginPath();
  ctx.arc(cxBody - 4, horseY + 1, 1.5, 0, Math.PI * 2);
  ctx.arc(cxBody + 4, horseY - 2, 1.5, 0, Math.PI * 2);
  ctx.arc(cxBody - 1, horseY + 4, 1.2, 0, Math.PI * 2);
  ctx.fill();

  // Saddle.
  ctx.fillStyle = "#1f2937";
  ctx.beginPath();
  ctx.moveTo(cxBody - 8, horseY - 6);
  ctx.lineTo(cxBody + 8, horseY - 6);
  ctx.lineTo(cxBody + 6, horseY - 1);
  ctx.lineTo(cxBody - 6, horseY - 1);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = teamFill(u.team);
  ctx.fillRect(cxBody - 7, horseY - 5, 14, 1.5); // saddle-blanket trim

  // Neck + head.
  ctx.fillStyle = "#7a3f0a";
  ctx.strokeStyle = "#2a1505";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(headSide - 2 * dir, horseY - 2);
  ctx.lineTo(headSide + 6 * dir, horseY - 12);
  ctx.lineTo(headSide + 14 * dir, horseY - 10);
  ctx.lineTo(headSide + 14 * dir, horseY - 2);
  ctx.lineTo(headSide + 8 * dir, horseY);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  // Ear.
  ctx.fillStyle = "#5a2c0a";
  ctx.beginPath();
  ctx.moveTo(headSide + 6 * dir, horseY - 12);
  ctx.lineTo(headSide + 8 * dir, horseY - 16);
  ctx.lineTo(headSide + 10 * dir, horseY - 12);
  ctx.closePath();
  ctx.fill();
  // Eye.
  ctx.fillStyle = "#000";
  ctx.beginPath();
  ctx.arc(headSide + 10 * dir, horseY - 8, 1, 0, Math.PI * 2);
  ctx.fill();
  // Bridle/reins.
  ctx.strokeStyle = "#1f2937";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(headSide + 13 * dir, horseY - 5);
  ctx.lineTo(headSide + 1 * dir, horseY - 8);
  ctx.lineTo(cxBody, horseY - 8);
  ctx.stroke();

  // Mane (along the neck).
  ctx.strokeStyle = "#1f1305";
  ctx.lineWidth = 2;
  for (let i = 0; i < 4; i++) {
    const mx = headSide + (2 + i * 1.5) * dir;
    const my = horseY - 10 + i * 1.5;
    ctx.beginPath();
    ctx.moveTo(mx, my);
    ctx.lineTo(mx - 2 * dir, my + 4);
    ctx.stroke();
  }

  // Tail (on opposite side of head).
  ctx.strokeStyle = "#1f1305";
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(tailSide + 2 * -dir, horseY - 2);
  ctx.quadraticCurveTo(tailSide + 10 * -dir, horseY + 2, tailSide + 12 * -dir, horseY + 10);
  ctx.stroke();
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(tailSide + 4 * -dir, horseY);
  ctx.quadraticCurveTo(tailSide + 8 * -dir, horseY + 6, tailSide + 7 * -dir, horseY + 12);
  ctx.stroke();

  // Legs — animated, with hooves (dark caps).
  const phase = Math.floor(u.x / 6) % 2 === 0 ? 1 : -1;
  const legPositions = [
    horseLeftX + 3,
    horseLeftX + 10,
    horseRightX - 10,
    horseRightX - 3,
  ];
  ctx.strokeStyle = "#2a1505";
  ctx.lineWidth = 3;
  legPositions.forEach((lx, i) => {
    const swing = (i % 2 === 0 ? 1 : -1) * phase * 3;
    ctx.beginPath();
    ctx.moveTo(lx, horseY + 6);
    ctx.lineTo(lx + swing, u.y + def.height - 2);
    ctx.stroke();
    // Hoof.
    ctx.fillStyle = "#0f172a";
    ctx.fillRect(lx + swing - 2, u.y + def.height - 2, 4, 2);
  });

  // Rider.
  const riderCx = cxBody + 2 * dir;
  const riderHeadY = horseY - 22;
  ctx.fillStyle = fill;
  ctx.strokeStyle = outline;
  ctx.lineWidth = 2;
  // Helmet rim.
  ctx.fillStyle = "#374151";
  ctx.fillRect(riderCx - 6, riderHeadY - 1, 12, 2);
  // Head.
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.arc(riderCx, riderHeadY, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  // Helmet plume.
  ctx.fillStyle = teamOutline(u.team);
  ctx.beginPath();
  ctx.moveTo(riderCx - 1, riderHeadY - 5);
  ctx.lineTo(riderCx + 2, riderHeadY - 10);
  ctx.lineTo(riderCx + 4, riderHeadY - 5);
  ctx.closePath();
  ctx.fill();
  // Torso.
  ctx.strokeStyle = outline;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(riderCx, riderHeadY + 5);
  ctx.lineTo(riderCx, horseY - 6);
  ctx.stroke();
  // Lance.
  ctx.strokeStyle = "#7c3f00";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(riderCx + 2 * dir, riderHeadY + 8);
  ctx.lineTo(riderCx + 22 * dir, riderHeadY - 2);
  ctx.stroke();
  // Lance tip.
  ctx.fillStyle = "#cbd5e1";
  ctx.beginPath();
  ctx.moveTo(riderCx + 22 * dir, riderHeadY - 2);
  ctx.lineTo(riderCx + 28 * dir, riderHeadY - 5);
  ctx.lineTo(riderCx + 22 * dir, riderHeadY + 1);
  ctx.closePath();
  ctx.fill();
  // Pennant.
  ctx.fillStyle = teamFill(u.team);
  ctx.beginPath();
  ctx.moveTo(riderCx + 16 * dir, riderHeadY + 1);
  ctx.lineTo(riderCx + 22 * dir, riderHeadY - 4);
  ctx.lineTo(riderCx + 16 * dir, riderHeadY - 4);
  ctx.closePath();
  ctx.fill();

  if (u.hp < u.maxHp) {
    const barY = u.y - 4;
    ctx.fillStyle = "#374151";
    ctx.fillRect(u.x, barY, def.width, 3);
    ctx.fillStyle = fill;
    ctx.fillRect(u.x, barY, def.width * (u.hp / u.maxHp), 3);
  }
}

function drawUnit(ctx: CanvasRenderingContext2D, u: Unit, playerTeam: Team) {
  const fill = teamFill(u.team);
  const outline = teamOutline(u.team);
  const def = UNIT_DEFS[u.type];
  const facingRight = u.team === playerTeam;
  const dir = facingRight ? 1 : -1;
  if (u.type === "cavalry") {
    drawCavalry(ctx, u, fill, outline, facingRight);
    return;
  }
  if (u.type === "boss") {
    drawBoss(ctx, u, fill, outline, facingRight);
    return;
  }
  const cx = u.x + def.width / 2;
  const headR = 5;
  const headY = u.y + headR;
  const bodyTopY = headY + headR;
  const bodyBottomY = u.y + def.height - 8;
  const legY = u.y + def.height;

  // Backpack for miners — drawn first so the body covers near edges.
  if (u.type === "miner") {
    // Pack sits opposite to direction of travel (on the back).
    const packX = cx - 7 * dir;
    const packY = bodyTopY + 3;
    ctx.fillStyle = "#92400e";
    ctx.strokeStyle = "#451a03";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect ? ctx.roundRect(packX - 4, packY, 8, 11, 2) : ctx.rect(packX - 4, packY, 8, 11);
    ctx.fill();
    ctx.stroke();
    // Strap across body.
    ctx.strokeStyle = "#451a03";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(packX + 2 * dir, packY);
    ctx.lineTo(cx + 2 * dir, bodyTopY + 1);
    ctx.stroke();
    // A nugget peeking out the top.
    ctx.fillStyle = "#facc15";
    ctx.beginPath();
    ctx.arc(packX, packY + 1, 1.5, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.strokeStyle = outline;
  ctx.lineWidth = 2;
  ctx.fillStyle = fill;

  // Head.
  ctx.beginPath();
  ctx.arc(cx, headY, headR, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  // Eye dot toward the facing direction.
  ctx.fillStyle = "#0f172a";
  ctx.beginPath();
  ctx.arc(cx + 1.6 * dir, headY - 0.5, 0.9, 0, Math.PI * 2);
  ctx.fill();

  // Body.
  ctx.strokeStyle = outline;
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
    // Forearm extending from shoulder to grip.
    const gripX = cx + 11 * dir;
    const gripY = bodyTopY - 2;
    ctx.strokeStyle = outline;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cx, bodyTopY + 4);
    ctx.lineTo(gripX, gripY);
    ctx.stroke();
    // Pommel.
    ctx.fillStyle = "#fde68a";
    ctx.beginPath();
    ctx.arc(gripX - 1 * dir, gripY + 2, 1.6, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#78350f";
    ctx.lineWidth = 1;
    ctx.stroke();
    // Hilt grip (brown bound handle).
    ctx.strokeStyle = "#7c3f00";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(gripX, gripY);
    ctx.lineTo(gripX + 3 * dir, gripY - 3);
    ctx.stroke();
    // Crossguard.
    ctx.strokeStyle = "#fde68a";
    ctx.lineWidth = 2;
    const guardX = gripX + 3 * dir;
    const guardY = gripY - 3;
    ctx.beginPath();
    ctx.moveTo(guardX - 4, guardY - 4);
    ctx.lineTo(guardX + 4, guardY + 4);
    ctx.stroke();
    // Blade — thick silver line w/ highlight.
    const tipX = gripX + 16 * dir;
    const tipY = gripY - 16;
    ctx.strokeStyle = "#cbd5e1";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(guardX, guardY);
    ctx.lineTo(tipX, tipY);
    ctx.stroke();
    // Highlight stripe.
    ctx.strokeStyle = "#f8fafc";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(guardX + dir, guardY - 1);
    ctx.lineTo(tipX, tipY + 1);
    ctx.stroke();
    // Edge outline.
    ctx.strokeStyle = "#1f2937";
    ctx.lineWidth = 0.6;
    ctx.beginPath();
    ctx.moveTo(guardX, guardY);
    ctx.lineTo(tipX, tipY);
    ctx.stroke();
  } else if (u.type === "archer") {
    // Arm to bow grip.
    ctx.strokeStyle = outline;
    ctx.lineWidth = 2;
    const gripX = cx + 8 * dir;
    const gripY = bodyTopY + 2;
    ctx.beginPath();
    ctx.moveTo(cx, bodyTopY + 4);
    ctx.lineTo(gripX, gripY);
    ctx.stroke();
    // Bow body (curved).
    const bowCx = cx + 12 * dir;
    const bowCy = bodyTopY + 2;
    ctx.strokeStyle = "#7c3f00";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(bowCx, bowCy, 9, facingRight ? -Math.PI / 2 : Math.PI / 2, facingRight ? Math.PI / 2 : -Math.PI / 2);
    ctx.stroke();
    // Bowstring (drawn).
    ctx.strokeStyle = "#f9fafb";
    ctx.lineWidth = 1;
    const stringX = bowCx - 3 * dir; // pulled back toward archer
    ctx.beginPath();
    ctx.moveTo(bowCx, bowCy - 9);
    ctx.lineTo(stringX, bowCy);
    ctx.lineTo(bowCx, bowCy + 9);
    ctx.stroke();
    // Nocked arrow.
    ctx.strokeStyle = "#1f2937";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(stringX, bowCy);
    ctx.lineTo(stringX + 9 * dir, bowCy);
    ctx.stroke();
    // Arrow head.
    ctx.fillStyle = "#475569";
    ctx.beginPath();
    ctx.moveTo(stringX + 9 * dir, bowCy - 1.5);
    ctx.lineTo(stringX + 12 * dir, bowCy);
    ctx.lineTo(stringX + 9 * dir, bowCy + 1.5);
    ctx.closePath();
    ctx.fill();
    // Quiver on back.
    ctx.fillStyle = "#7c3f00";
    ctx.fillRect(cx - 4 * dir, bodyTopY + 2, 3, 12);
    ctx.fillStyle = "#fef3c7";
    for (let i = 0; i < 3; i++) {
      ctx.fillRect(cx - 4 * dir + i * 0.8, bodyTopY + 1, 0.8, 3);
    }
  } else if (u.type === "rifleman") {
    // Helmet (green/red beret-ish cap).
    ctx.fillStyle = "#1f2937";
    ctx.beginPath();
    ctx.arc(cx, headY - 2, headR + 1, Math.PI, Math.PI * 2);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = teamFill(u.team);
    ctx.fillRect(cx - headR, headY - 2, (headR + 1) * 2, 1.5);
    // Front arm.
    ctx.strokeStyle = outline;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cx, bodyTopY + 4);
    ctx.lineTo(cx + 9 * dir, bodyTopY + 1);
    ctx.stroke();
    // Rear arm holding stock.
    ctx.beginPath();
    ctx.moveTo(cx, bodyTopY + 6);
    ctx.lineTo(cx + 4 * dir, bodyTopY + 4);
    ctx.stroke();
    // Rifle body — wood stock + dark barrel.
    const stockStartX = cx + 2 * dir;
    const stockEndX = cx + 10 * dir;
    const barrelEndX = cx + 22 * dir;
    const rifleY = bodyTopY + 1;
    // Stock (wood).
    ctx.fillStyle = "#7c3f00";
    ctx.fillRect(
      Math.min(stockStartX, stockEndX),
      rifleY - 1,
      Math.abs(stockEndX - stockStartX),
      3.5
    );
    ctx.strokeStyle = "#451a03";
    ctx.lineWidth = 1;
    ctx.strokeRect(
      Math.min(stockStartX, stockEndX),
      rifleY - 1,
      Math.abs(stockEndX - stockStartX),
      3.5
    );
    // Barrel.
    ctx.fillStyle = "#1f2937";
    ctx.fillRect(
      Math.min(stockEndX, barrelEndX),
      rifleY - 0.5,
      Math.abs(barrelEndX - stockEndX),
      2
    );
    // Sight.
    ctx.fillRect(stockEndX + 4 * dir - 0.5, rifleY - 2, 1, 1.5);
    // Trigger guard.
    ctx.strokeStyle = "#1f2937";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(stockEndX, rifleY + 3.5, 1.6, 0, Math.PI);
    ctx.stroke();
    // Bandolier across chest.
    ctx.strokeStyle = "#7c3f00";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(cx - 4, bodyTopY);
    ctx.lineTo(cx + 4, bodyBottomY - 4);
    ctx.stroke();
    // Bullet pips.
    ctx.fillStyle = "#facc15";
    for (let i = 0; i < 3; i++) {
      const t = 0.25 + i * 0.25;
      const bx = cx - 4 + 8 * t;
      const by = bodyTopY + (bodyBottomY - 4 - bodyTopY) * t;
      ctx.beginPath();
      ctx.arc(bx, by, 1.1, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (u.type === "miner") {
    // Hard hat.
    ctx.fillStyle = "#facc15";
    ctx.beginPath();
    ctx.arc(cx, headY - 1, headR + 1, Math.PI, Math.PI * 2);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "#a16207";
    ctx.lineWidth = 1;
    ctx.stroke();
    // Helmet lamp.
    ctx.fillStyle = "#fef9c3";
    ctx.fillRect(cx + 1 * dir, headY - 4, 3, 2);
    // Pickaxe shaft.
    ctx.strokeStyle = "#7c3f00";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cx, bodyTopY + 4);
    ctx.lineTo(cx + 10 * dir, bodyTopY - 6);
    ctx.stroke();
    // Pickaxe head (double-pointed).
    ctx.strokeStyle = "#475569";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(cx + 5 * dir, bodyTopY - 8);
    ctx.lineTo(cx + 14 * dir, bodyTopY - 4);
    ctx.stroke();
    ctx.lineWidth = 1;
    ctx.strokeStyle = "#1f2937";
    ctx.beginPath();
    ctx.moveTo(cx + 5 * dir, bodyTopY - 8);
    ctx.lineTo(cx + 14 * dir, bodyTopY - 4);
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

function drawBoss(ctx: CanvasRenderingContext2D, u: Unit, fill: string, outline: string, facingRight: boolean) {
  const def = UNIT_DEFS[u.type];
  const cx = u.x + def.width / 2;
  const dir = facingRight ? 1 : -1;
  const headR = 11;
  const headY = u.y + headR + 2;
  const bodyTopY = headY + headR;
  const bodyBottomY = u.y + def.height - 12;
  const legY = u.y + def.height;
  const phase = Math.floor(u.x / 8) % 2 === 0 ? 1 : -1;

  // Shadow on ground.
  ctx.fillStyle = "rgba(0,0,0,0.25)";
  ctx.beginPath();
  ctx.ellipse(cx, legY + 1, def.width / 2 + 4, 3, 0, 0, Math.PI * 2);
  ctx.fill();

  // Cape behind boss.
  ctx.fillStyle = teamOutline(u.team);
  ctx.beginPath();
  ctx.moveTo(cx - 6 * dir, bodyTopY - 2);
  ctx.lineTo(cx - 14 * dir, bodyBottomY);
  ctx.lineTo(cx - 4 * dir, bodyBottomY - 4);
  ctx.closePath();
  ctx.fill();

  // Beefy body trapezoid.
  ctx.fillStyle = fill;
  ctx.strokeStyle = outline;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(cx - 14, bodyTopY);
  ctx.lineTo(cx + 14, bodyTopY);
  ctx.lineTo(cx + 11, bodyBottomY);
  ctx.lineTo(cx - 11, bodyBottomY);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  // Shoulder spikes.
  ctx.fillStyle = "#1f2937";
  for (const sx of [cx - 13, cx - 6, cx + 1, cx + 8]) {
    ctx.beginPath();
    ctx.moveTo(sx, bodyTopY + 1);
    ctx.lineTo(sx + 3, bodyTopY - 5);
    ctx.lineTo(sx + 6, bodyTopY + 1);
    ctx.closePath();
    ctx.fill();
  }
  // Belt.
  ctx.fillStyle = "#1f2937";
  ctx.fillRect(cx - 12, bodyBottomY - 5, 24, 4);
  ctx.fillStyle = "#facc15";
  ctx.fillRect(cx - 2, bodyBottomY - 5, 4, 4);

  // Head (big, dark).
  ctx.fillStyle = "#3f1f1f";
  ctx.strokeStyle = "#0f172a";
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.arc(cx, headY, headR, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  // Horns.
  ctx.fillStyle = "#0f172a";
  ctx.beginPath();
  ctx.moveTo(cx - 7, headY - 8);
  ctx.lineTo(cx - 12, headY - 16);
  ctx.lineTo(cx - 4, headY - 10);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(cx + 7, headY - 8);
  ctx.lineTo(cx + 12, headY - 16);
  ctx.lineTo(cx + 4, headY - 10);
  ctx.closePath();
  ctx.fill();
  // Glowing eyes.
  ctx.fillStyle = "#fde047";
  ctx.beginPath();
  ctx.arc(cx - 3, headY - 1, 1.6, 0, Math.PI * 2);
  ctx.arc(cx + 3, headY - 1, 1.6, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#dc2626";
  ctx.beginPath();
  ctx.arc(cx - 3, headY - 1, 0.8, 0, Math.PI * 2);
  ctx.arc(cx + 3, headY - 1, 0.8, 0, Math.PI * 2);
  ctx.fill();
  // Fangs.
  ctx.fillStyle = "#f8fafc";
  ctx.beginPath();
  ctx.moveTo(cx - 3, headY + 5);
  ctx.lineTo(cx - 2, headY + 8);
  ctx.lineTo(cx - 1, headY + 5);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(cx + 1, headY + 5);
  ctx.lineTo(cx + 2, headY + 8);
  ctx.lineTo(cx + 3, headY + 5);
  ctx.closePath();
  ctx.fill();

  // Legs (thicker).
  ctx.strokeStyle = outline;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(cx - 6, bodyBottomY);
  ctx.lineTo(cx - 6 + 3 * phase, legY);
  ctx.moveTo(cx + 6, bodyBottomY);
  ctx.lineTo(cx + 6 - 3 * phase, legY);
  ctx.stroke();
  // Boots.
  ctx.fillStyle = "#0f172a";
  ctx.fillRect(cx - 10 + 3 * phase, legY - 2, 8, 3);
  ctx.fillRect(cx + 2 - 3 * phase, legY - 2, 8, 3);

  // Arm holding spiked club.
  const armEndX = cx + 16 * dir;
  const armEndY = bodyTopY + 6;
  ctx.strokeStyle = outline;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(cx + 12 * dir, bodyTopY + 4);
  ctx.lineTo(armEndX, armEndY);
  ctx.stroke();
  // Club shaft.
  ctx.strokeStyle = "#5a2c0a";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(armEndX, armEndY);
  ctx.lineTo(armEndX + 6 * dir, armEndY - 18);
  ctx.stroke();
  // Club head (dark wood orb).
  const ccx = armEndX + 8 * dir;
  const ccy = armEndY - 22;
  ctx.fillStyle = "#3a1f0a";
  ctx.strokeStyle = "#1a0a02";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(ccx, ccy, 8, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  // Club spikes.
  ctx.fillStyle = "#cbd5e1";
  ctx.strokeStyle = "#475569";
  ctx.lineWidth = 1;
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    const sx = ccx + Math.cos(a) * 8;
    const sy = ccy + Math.sin(a) * 8;
    const tx = ccx + Math.cos(a) * 13;
    const ty = ccy + Math.sin(a) * 13;
    const ox = -Math.sin(a) * 2;
    const oy = Math.cos(a) * 2;
    ctx.beginPath();
    ctx.moveTo(sx + ox, sy + oy);
    ctx.lineTo(tx, ty);
    ctx.lineTo(sx - ox, sy - oy);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }

  // HP bar (always visible for boss).
  const barW = def.width;
  const barY = u.y - 6;
  ctx.fillStyle = "#374151";
  ctx.fillRect(u.x, barY, barW, 4);
  ctx.fillStyle = fill;
  ctx.fillRect(u.x, barY, barW * (u.hp / u.maxHp), 4);
  ctx.strokeStyle = "#0f172a";
  ctx.lineWidth = 1;
  ctx.strokeRect(u.x, barY, barW, 4);
}

