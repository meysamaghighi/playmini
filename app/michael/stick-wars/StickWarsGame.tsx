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
const WALL_W = 24;
const WALL_H = 110;
const WALL_HP = 250;
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

type UnitType = "miner" | "swordsman" | "archer" | "cavalry" | "boss";
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
  cavalry:   { cost: 40,  hp: 110, damage: 18, attackInterval: 0.9,  range: 32,  speed: 95,  width: 36, height: 50 },
  boss:      { cost: 200, hp: 500, damage: 40, attackInterval: 1.5,  range: 40,  speed: 30,  width: 32, height: 70 },
};

const DIFFICULTY: Record<Difficulty, { goldRate: number; sword: number; archer: number; boss: number }> = {
  easy:   { goldRate: 0.3, sword: 12, archer: 25, boss: 200 },
  normal: { goldRate: 0.7, sword: 6,  archer: 12, boss: 90 },
  hard:   { goldRate: 1.1, sword: 4,  archer: 8,  boss: 55 },
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
  wallHp: number;
  enemyCooldown: { sword: number; archer: number; boss: number };
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
      enemyCooldown: { sword: 4, archer: 10, boss: 60 },
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
      if (e.key === "4") spawnPlayerUnit("cavalry");
      if (e.key === "5") spawnPlayerUnit("boss");
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
      <div className="mt-2 grid grid-cols-3 sm:grid-cols-5 gap-2">
        {(["miner", "swordsman", "archer", "cavalry", "boss"] as UnitType[]).map((t, i) => {
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
            damage: 0, // visual only
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
        // Damage applies on impact (simulate with instant hit + visual projectile).
        closest.hp -= dmg;
        s.damages.push({
          id: s.nextId++,
          x: closest.x + UNIT_DEFS[closest.type].width / 2,
          y: closest.y,
          amount: Math.round(dmg), ttl: 0.6,
        });
        s.projectiles.push({
          id: s.nextId++,
          team: playerTeam,
          x: PLAYER_CASTLE_X + CASTLE_W / 2,
          y: GROUND_Y - CASTLE_H - 10,
          vx: speed,
          damage: 0,
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

  // Projectiles. Arrows = thin dark lines; bullets (fast) = bright yellow streaks.
  for (const p of s.projectiles) {
    const isFast = Math.abs(p.vx) >= DOME_BULLET_SPEED * 0.9;
    if (isFast) {
      ctx.strokeStyle = "#facc15";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
      ctx.lineTo(p.x + (p.vx > 0 ? -16 : 16), p.y);
      ctx.stroke();
    } else {
      ctx.strokeStyle = "#374151";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
      ctx.lineTo(p.x + (p.vx > 0 ? -10 : 10), p.y);
      ctx.stroke();
    }
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

function drawDome(ctx: CanvasRenderingContext2D, castleX: number, hasBullets: boolean) {
  const cx = castleX + CASTLE_W / 2;
  const baseY = GROUND_Y - CASTLE_H;
  // Dome (half circle on top of castle).
  ctx.fillStyle = hasBullets ? "#7c3aed" : "#475569";
  ctx.beginPath();
  ctx.arc(cx, baseY + 8, 22, Math.PI, 0);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "#1f2937";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(cx, baseY + 8, 22, Math.PI, 0);
  ctx.stroke();
  // Cannon/barrel sticking out the right.
  ctx.fillStyle = hasBullets ? "#1f2937" : "#374151";
  ctx.fillRect(cx, baseY - 4, 18, 5);
  if (hasBullets) {
    // Glowing dot to indicate rifle upgrade.
    ctx.fillStyle = "#facc15";
    ctx.beginPath();
    ctx.arc(cx + 18, baseY - 1.5, 2.5, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawWall(ctx: CanvasRenderingContext2D, hp: number) {
  if (hp <= 0) return;
  const wallY = GROUND_Y - WALL_H;
  const x = WALL_X - WALL_W / 2;
  // Brick body.
  ctx.fillStyle = "#7c2d12";
  ctx.fillRect(x, wallY, WALL_W, WALL_H);
  ctx.strokeStyle = "#451a03";
  ctx.lineWidth = 2;
  ctx.strokeRect(x, wallY, WALL_W, WALL_H);
  // Crenellations on top.
  for (let i = 0; i < 3; i++) {
    const cx = x + 1 + i * 8;
    ctx.fillRect(cx, wallY - 6, 6, 6);
  }
  // Brick rows.
  ctx.strokeStyle = "#451a03";
  ctx.lineWidth = 1;
  const brickH = 12;
  for (let row = 1; row < Math.floor(WALL_H / brickH); row++) {
    const y = wallY + row * brickH;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + WALL_W, y);
    ctx.stroke();
    if (row % 2 === 0) {
      ctx.beginPath();
      ctx.moveTo(x + WALL_W / 2, y - brickH);
      ctx.lineTo(x + WALL_W / 2, y);
      ctx.stroke();
    }
  }
  // HP bar above wall.
  const barY = wallY - 14;
  ctx.fillStyle = "#374151";
  ctx.fillRect(x - 6, barY, WALL_W + 12, 4);
  ctx.fillStyle = "#dc2626";
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

function drawCavalry(ctx: CanvasRenderingContext2D, u: Unit, fill: string, outline: string) {
  const def = UNIT_DEFS[u.type];
  const horseY = u.y + def.height - 22;
  const horseLeftX = u.x + 4;
  const horseRightX = u.x + def.width - 4;
  ctx.fillStyle = "#7c3f00";
  ctx.strokeStyle = "#3b1f00";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.ellipse((horseLeftX + horseRightX) / 2, horseY, (horseRightX - horseLeftX) / 2, 8, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(horseRightX - 2, horseY - 2);
  ctx.lineTo(horseRightX + 6, horseY - 10);
  ctx.lineTo(horseRightX + 12, horseY - 8);
  ctx.lineTo(horseRightX + 12, horseY - 2);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  const phase = Math.floor(u.x / 6) % 2 === 0 ? 1 : -1;
  ctx.strokeStyle = "#3b1f00";
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(horseLeftX + 2, horseY + 6);
  ctx.lineTo(horseLeftX + 2 + 3 * phase, u.y + def.height);
  ctx.moveTo(horseLeftX + 10, horseY + 6);
  ctx.lineTo(horseLeftX + 10 - 3 * phase, u.y + def.height);
  ctx.moveTo(horseRightX - 10, horseY + 6);
  ctx.lineTo(horseRightX - 10 + 3 * phase, u.y + def.height);
  ctx.moveTo(horseRightX - 2, horseY + 6);
  ctx.lineTo(horseRightX - 2 - 3 * phase, u.y + def.height);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(horseLeftX, horseY - 2);
  ctx.lineTo(horseLeftX - 6, horseY + 4);
  ctx.stroke();
  const riderCx = (horseLeftX + horseRightX) / 2 + 2;
  const riderHeadY = horseY - 18;
  ctx.fillStyle = fill;
  ctx.strokeStyle = outline;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(riderCx, riderHeadY, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(riderCx, riderHeadY + 5);
  ctx.lineTo(riderCx, horseY - 4);
  ctx.stroke();
  ctx.strokeStyle = "#9ca3af";
  ctx.beginPath();
  ctx.moveTo(riderCx + 2, riderHeadY + 8);
  ctx.lineTo(riderCx + 18, riderHeadY + 2);
  ctx.stroke();
  if (u.hp < u.maxHp) {
    const barY = u.y - 4;
    ctx.fillStyle = "#374151";
    ctx.fillRect(u.x, barY, def.width, 3);
    ctx.fillStyle = fill;
    ctx.fillRect(u.x, barY, def.width * (u.hp / u.maxHp), 3);
  }
}

function drawUnit(ctx: CanvasRenderingContext2D, u: Unit) {
  const fill = teamFill(u.team);
  const outline = teamOutline(u.team);
  const def = UNIT_DEFS[u.type];
  if (u.type === "cavalry") {
    drawCavalry(ctx, u, fill, outline);
    return;
  }
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

