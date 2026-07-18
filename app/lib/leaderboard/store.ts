// app/lib/leaderboard/store.ts
// Upstash Redis via REST (no npm dependency). Falls back to an in-process
// memory store when env vars are absent — allowed in non-production only.
import { GAMES, SITE } from "./config.ts";

export type Row = { rank: number; name: string; cc: string; score: number };
type Meta = { name: string; cc: string; ts: number };

// Read lazily (not into module-level constants) so tests can flip these env
// vars at call time to exercise the real Redis code path.
const urlEnv = () => process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL || "";
const tokenEnv = () => process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN || "";
const IS_PROD = process.env.NODE_ENV === "production";

export function storeAvailable(): { ok: boolean; reason?: string } {
  if (urlEnv() && tokenEnv()) return { ok: true };
  if (!IS_PROD) return { ok: true }; // memory fallback for dev/tests
  return { ok: false, reason: "leaderboard storage not configured" };
}

// ---------- Redis command runner (REST) ----------
async function redisCmd(cmd: (string | number)[]): Promise<unknown> {
  const res = await fetch(urlEnv(), {
    method: "POST",
    headers: { Authorization: `Bearer ${tokenEnv()}`, "Content-Type": "application/json" },
    body: JSON.stringify(cmd),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`redis ${cmd[0]} failed: ${res.status}`);
  const data = (await res.json()) as { result: unknown };
  return data.result;
}

// ---------- In-memory fallback (dev/tests only) ----------
type MemBoard = { scores: Map<string, number>; meta: Map<string, Meta> };
const mem: { boards: Map<string, MemBoard>; counters: Map<string, { n: number; exp: number }> } = {
  boards: new Map(),
  counters: new Map(),
};
export function __resetMemoryStore() {
  mem.boards.clear();
  mem.counters.clear();
}
function memBoard(key: string): MemBoard {
  let b = mem.boards.get(key);
  if (!b) { b = { scores: new Map(), meta: new Map() }; mem.boards.set(key, b); }
  return b;
}
const useMemory = () => !(urlEnv() && tokenEnv());

// Stored score is negated for lower-is-better so ZSET ascending order is
// always "best first" with a single code path (spec).
const toStored = (game: string, v: number) => (GAMES[game].lowerIsBetter ? -v : v);
const fromStored = (game: string, v: number) => (GAMES[game].lowerIsBetter ? -v : v);
const boardKey = (game: string) => `lb:${SITE}:${game}`;

// ---------- Rate limit: 10 per rolling minute per key ----------
export async function checkRateLimit(keys: string[]): Promise<boolean> {
  for (const k of keys) {
    const full = `lb:rl:${k}`;
    if (useMemory()) {
      const now = Date.now();
      const c = mem.counters.get(full);
      if (!c || c.exp < now) mem.counters.set(full, { n: 1, exp: now + 60_000 });
      else if (++c.n > 10) return false;
    } else {
      const n = (await redisCmd(["INCR", full])) as number;
      if (n === 1) await redisCmd(["EXPIRE", full, 60]);
      if (n > 10) return false;
    }
  }
  return true;
}

// ---------- Submit ----------
export async function submitScore(args: {
  game: string; score: number; nickname: string; playerId: string; cc: string;
}): Promise<{ accepted: boolean; best: number; worldRank: number; countryRank: number; totalPlayers: number }> {
  const { game, score, nickname, playerId, cc } = args;
  const stored = toStored(game, score);
  const key = boardKey(game);
  let best = score;
  let accepted = false;

  if (useMemory()) {
    const b = memBoard(key);
    const prev = b.scores.get(playerId);
    if (prev === undefined || stored > prev) {
      b.scores.set(playerId, stored);
      accepted = true;
    } else best = fromStored(game, prev);
    // Display identity follows the player: name/country update on every
    // submit (standard leaderboard behavior); only the score needs to improve.
    b.meta.set(playerId, { name: nickname, cc, ts: Date.now() });
  } else {
    const prevRaw = (await redisCmd(["ZSCORE", key, playerId])) as string | null;
    const prev = prevRaw === null ? undefined : Number(prevRaw);
    if (prev === undefined || stored > prev) {
      await redisCmd(["ZADD", key, stored, playerId]);
      accepted = true;
    } else best = fromStored(game, prev);
    // Display identity follows the player (see memory-path comment).
    await redisCmd(["HSET", `${key}:meta`, playerId, JSON.stringify({ name: nickname, cc, ts: Date.now() } satisfies Meta)]);
  }

  const ranks = await computeRanks(game, playerId, cc);
  return { accepted, best, ...ranks };
}

// ---------- Ranks & board reads ----------
// Boards are pilot-scale (spec caps interest at top 100; total players are
// low), so reading the full ZSET for country rank is fine at this size.
async function fullBoard(game: string): Promise<{ playerId: string; stored: number }[]> {
  const key = boardKey(game);
  if (useMemory()) {
    return [...memBoard(key).scores.entries()]
      .map(([playerId, stored]) => ({ playerId, stored }))
      .sort((a, b) => b.stored - a.stored);
  }
  const flat = (await redisCmd(["ZRANGE", key, 0, -1, "REV", "WITHSCORES"])) as string[];
  const out: { playerId: string; stored: number }[] = [];
  for (let i = 0; i < flat.length; i += 2) out.push({ playerId: flat[i], stored: Number(flat[i + 1]) });
  return out;
}

async function readMeta(game: string, ids: string[]): Promise<Map<string, Meta>> {
  const key = `${boardKey(game)}:meta`;
  const m = new Map<string, Meta>();
  if (ids.length === 0) return m;
  if (useMemory()) {
    const b = memBoard(boardKey(game));
    ids.forEach((id) => { const v = b.meta.get(id); if (v) m.set(id, v); });
    return m;
  }
  const vals = (await redisCmd(["HMGET", key, ...ids])) as (string | null)[];
  vals.forEach((v, i) => { if (v) m.set(ids[i], JSON.parse(v) as Meta); });
  return m;
}

async function computeRanks(game: string, playerId: string, cc: string) {
  const all = await fullBoard(game);
  const meta = await readMeta(game, all.map((e) => e.playerId));
  const worldRank = all.findIndex((e) => e.playerId === playerId) + 1;
  const sameCountry = all.filter((e) => (meta.get(e.playerId)?.cc ?? "") === cc);
  const countryRank = sameCountry.findIndex((e) => e.playerId === playerId) + 1;
  return { worldRank, countryRank, totalPlayers: all.length };
}

export async function getBoard(game: string, playerId?: string) {
  const all = await fullBoard(game);
  const meta = await readMeta(game, all.map((e) => e.playerId));
  const top: Row[] = all.slice(0, 100).map((e, i) => ({
    rank: i + 1,
    name: meta.get(e.playerId)?.name ?? "Player",
    cc: meta.get(e.playerId)?.cc ?? "",
    score: fromStored(game, e.stored),
  }));
  let you: { rank: number; score: number } | null = null;
  if (playerId) {
    const idx = all.findIndex((e) => e.playerId === playerId);
    if (idx >= 0) you = { rank: idx + 1, score: fromStored(game, all[idx].stored) };
  }
  return { top, you, totalPlayers: all.length };
}
