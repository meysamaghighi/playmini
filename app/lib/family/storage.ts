import { emptyState, mergeFamilyState, type FamilyState, type Profile } from "./profiles.ts";
import { LOWER_BOARDS } from "../leaderboard/config.ts";

export const FAMILY_KEY = "pm.family.v1";

type MiniStorage = Pick<Storage, "getItem" | "setItem">;

function defaultStore(): MiniStorage | null {
  try {
    return typeof localStorage === "undefined" ? null : localStorage;
  } catch {
    return null; // Safari private mode throws on access
  }
}

function isProfile(v: unknown): v is Profile {
  const p = v as Profile;
  return (
    !!p && typeof p.id === "string" && typeof p.name === "string" && typeof p.color === "string"
  );
}

/**
 * Never throws and never returns a half-valid object: a corrupt blob degrades
 * to an empty scoreboard rather than breaking every game page that renders it.
 */
export function loadFamily(store: MiniStorage | null = defaultStore()): FamilyState {
  if (!store) return emptyState();
  let parsed: unknown;
  try {
    const raw = store.getItem(FAMILY_KEY);
    if (!raw) return emptyState();
    parsed = JSON.parse(raw);
  } catch {
    return emptyState();
  }

  const obj = (parsed ?? {}) as Partial<FamilyState>;
  const profiles = Array.isArray(obj.profiles) ? obj.profiles.filter(isProfile) : [];

  // Skip "__proto__" board/player keys rather than letting them through to
  // the bracket-assignment [[Set]] path below: on a plain object,
  // `acc["__proto__"] = x` doesn't create an own property, it reassigns the
  // object's prototype. JSON.parse itself is safe (it defines "__proto__" as
  // an ordinary own property), but a hand-edited blob can still carry the
  // key through to here, and this accumulator is built with plain `{}`
  // (not Object.create(null)) so it stays deep-equal-comparable with plain
  // object literals in tests.
  const bests: FamilyState["bests"] = {};
  if (obj.bests && typeof obj.bests === "object" && !Array.isArray(obj.bests)) {
    for (const [boardId, byPlayer] of Object.entries(obj.bests)) {
      if (boardId === "__proto__" || !byPlayer || typeof byPlayer !== "object") continue;
      const clean: Record<string, number> = {};
      for (const [pid, score] of Object.entries(byPlayer as Record<string, unknown>)) {
        if (pid === "__proto__") continue;
        if (typeof score === "number" && Number.isFinite(score)) clean[pid] = score;
      }
      if (Object.keys(clean).length > 0) bests[boardId] = clean;
    }
  }

  const activeId =
    typeof obj.activeId === "string" && profiles.some((p) => p.id === obj.activeId)
      ? obj.activeId
      : null;

  // Tombstones are a newer field — any blob written by the current code
  // always has it, but this must still tolerate one that doesn't (an older
  // save, or a hand-edited value) rather than throwing. Missing/malformed
  // just means "no tombstones," same degrade-not-throw contract as the rest
  // of this function.
  const tombstones: FamilyState["tombstones"] = {};
  if (obj.tombstones && typeof obj.tombstones === "object" && !Array.isArray(obj.tombstones)) {
    for (const [id, ts] of Object.entries(obj.tombstones as Record<string, unknown>)) {
      if (id === "__proto__") continue;
      if (typeof ts === "number" && Number.isFinite(ts)) tombstones[id] = ts;
    }
  }

  return { profiles, activeId, bests, tombstones };
}

export function saveFamily(state: FamilyState, store: MiniStorage | null = defaultStore()): void {
  if (!store) return;
  try {
    // Read-modify-write: `state` is this tab's in-memory snapshot, which may
    // already be stale by the time we get here (another tab could have saved
    // a new best in between). Reload what's actually on disk and merge
    // rather than blindly overwriting it — see mergeFamilyState in
    // profiles.ts for the merge rule.
    const disk = loadFamily(store);
    const merged = mergeFamilyState(disk, state, LOWER_BOARDS);
    store.setItem(FAMILY_KEY, JSON.stringify(merged));
  } catch {
    /* quota or private mode — the in-memory board still works this session */
  }
}

export function newProfileId(): string {
  try {
    return crypto.randomUUID();
  } catch {
    return `p${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
  }
}
