import { emptyState, type FamilyState, type Profile } from "./profiles.ts";

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

  const bests: FamilyState["bests"] = {};
  if (obj.bests && typeof obj.bests === "object" && !Array.isArray(obj.bests)) {
    for (const [boardId, byPlayer] of Object.entries(obj.bests)) {
      if (!byPlayer || typeof byPlayer !== "object") continue;
      const clean: Record<string, number> = {};
      for (const [pid, score] of Object.entries(byPlayer as Record<string, unknown>)) {
        if (typeof score === "number" && Number.isFinite(score)) clean[pid] = score;
      }
      if (Object.keys(clean).length > 0) bests[boardId] = clean;
    }
  }

  const activeId =
    typeof obj.activeId === "string" && profiles.some((p) => p.id === obj.activeId)
      ? obj.activeId
      : null;

  return { profiles, activeId, bests };
}

export function saveFamily(state: FamilyState, store: MiniStorage | null = defaultStore()): void {
  if (!store) return;
  try {
    store.setItem(FAMILY_KEY, JSON.stringify(state));
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
