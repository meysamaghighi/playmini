// Local family scoreboard state. Pure functions over a plain object so this is
// unit-testable under `node --test` with no DOM — same split as
// app/lib/leaderboard/{validate,store}.ts. Nothing here touches localStorage;
// persistence lives in storage.ts.

export type Profile = { id: string; name: string; color: string };

export type FamilyState = {
  profiles: Profile[];
  activeId: string | null;
  /** bests[boardId][profileId] = raw score, always the player's best so far. */
  bests: Record<string, Record<string, number>>;
  /**
   * tombstones[profileId] = ms timestamp of removal. A plain union merge
   * (mergeFamilyState) can't otherwise represent "this id was deleted" — a
   * later merge would just resurrect it from whichever side still has it.
   * One id->timestamp map is proportionate for a single-device family
   * scoreboard; no pruning/GC is needed since MAX_PROFILES keeps this tiny.
   */
  tombstones: Record<string, number>;
};

export const MAX_PROFILES = 6;
export const MAX_NAME_LEN = 16;

// Site palette tokens; distinct hues so 6 players are never confusable.
export const PROFILE_COLORS = [
  "#E8734A", "#4A90D9", "#57A773", "#C05A9E", "#D9A441", "#6C6BC0",
];

export function emptyState(): FamilyState {
  return { profiles: [], activeId: null, bests: {}, tombstones: {} };
}

function cleanName(raw: string): string {
  return raw.replace(/\s+/g, " ").trim().slice(0, MAX_NAME_LEN);
}

export function addProfile(state: FamilyState, name: string, id: string): FamilyState {
  const clean = cleanName(name);
  if (!clean) return state;
  if (state.profiles.length >= MAX_PROFILES) return state;
  if (state.profiles.some((p) => p.id === id)) return state;
  const color = PROFILE_COLORS[state.profiles.length % PROFILE_COLORS.length];
  const profiles = [...state.profiles, { id, name: clean, color }];
  // Re-adding a previously-removed id (in practice only possible if a caller
  // reuses an id rather than calling newProfileId()) must un-tombstone it —
  // otherwise the very next merge would delete the profile the caller just
  // added.
  let tombstones = state.tombstones;
  if (id in tombstones) {
    tombstones = { ...tombstones };
    delete tombstones[id];
  }
  return { ...state, profiles, tombstones, activeId: state.activeId ?? id };
}

export function removeProfile(state: FamilyState, id: string): FamilyState {
  const profiles = state.profiles.filter((p) => p.id !== id);
  const bests: FamilyState["bests"] = {};
  for (const [board, byPlayer] of Object.entries(state.bests)) {
    const kept = { ...byPlayer };
    delete kept[id];
    if (Object.keys(kept).length > 0) bests[board] = kept;
  }
  const activeId = state.activeId === id ? (profiles[0]?.id ?? null) : state.activeId;
  const tombstones = { ...state.tombstones, [id]: Date.now() };
  return { profiles, activeId, bests, tombstones };
}

export function setActive(state: FamilyState, id: string | null): FamilyState {
  if (id !== null && !state.profiles.some((p) => p.id === id)) return state;
  return { ...state, activeId: id };
}

export type Standing = { rank: number; profile: Profile; score: number };

export function recordBest(
  state: FamilyState,
  boardId: string,
  profileId: string,
  score: number,
  lowerIsBetter: boolean,
): FamilyState {
  if (!Number.isFinite(score)) return state;
  if (!state.profiles.some((p) => p.id === profileId)) return state;
  const board = state.bests[boardId] ?? {};
  const prev = board[profileId];
  const better =
    prev === undefined || (lowerIsBetter ? score < prev : score > prev);
  if (!better) return state;
  return {
    ...state,
    bests: { ...state.bests, [boardId]: { ...board, [profileId]: score } },
  };
}

/**
 * Restore (or clear) a single board+player best to a previous value.
 * `prevBest === undefined` means the player had no best on this board before,
 * so the entry is deleted outright (and the board key pruned if that was its
 * only player) rather than stored as `undefined` — same convention
 * `removeProfile` uses for pruning empty boards.
 *
 * Used by FamilyBoard.tsx to undo an auto-recorded score when the active
 * player changes while that score is still showing: restore the outgoing
 * player's prior best with this, then recordBest the score onto the new
 * player against the current state.
 */
export function restoreBest(
  state: FamilyState,
  boardId: string,
  profileId: string,
  prevBest: number | undefined,
): FamilyState {
  const board = state.bests[boardId] ?? {};
  if (prevBest === undefined) {
    if (!(profileId in board)) return state;
    const kept = { ...board };
    delete kept[profileId];
    const bests = { ...state.bests };
    if (Object.keys(kept).length > 0) bests[boardId] = kept;
    else delete bests[boardId];
    return { ...state, bests };
  }
  return { ...state, bests: { ...state.bests, [boardId]: { ...board, [profileId]: prevBest } } };
}

export function standings(
  state: FamilyState,
  boardId: string,
  lowerIsBetter: boolean,
): Standing[] {
  const board = state.bests[boardId];
  if (!board) return [];
  const scored = state.profiles
    .filter((p) => board[p.id] !== undefined)
    .map((profile) => ({ profile, score: board[profile.id] }))
    .sort((a, b) => (lowerIsBetter ? a.score - b.score : b.score - a.score));

  // Ties share a rank (1,1,3) — with 6 players a tie is common and showing
  // two identical scores at different ranks reads as a bug.
  let lastScore: number | null = null;
  let lastRank = 0;
  return scored.map((row, i) => {
    const rank = row.score === lastScore ? lastRank : i + 1;
    lastScore = row.score;
    lastRank = rank;
    return { rank, profile: row.profile, score: row.score };
  });
}

export type ChampionRow = { profile: Profile; firsts: number; played: number };

/**
 * Cross-board tally: who holds the most #1 spots. `lowerBoards` is the set of
 * board ids where a lower score wins; anything not in it is higher-is-better.
 * Tied players each get a first — a shared win is still a win, and docking
 * both players reads as broken.
 */
export function houseChampions(
  state: FamilyState,
  lowerBoards: ReadonlySet<string>,
): ChampionRow[] {
  const firsts = new Map<string, number>();
  const played = new Map<string, number>();

  for (const boardId of Object.keys(state.bests)) {
    const rows = standings(state, boardId, lowerBoards.has(boardId));
    for (const row of rows) {
      played.set(row.profile.id, (played.get(row.profile.id) ?? 0) + 1);
      if (row.rank === 1) firsts.set(row.profile.id, (firsts.get(row.profile.id) ?? 0) + 1);
    }
  }

  return state.profiles
    .map((profile) => ({
      profile,
      firsts: firsts.get(profile.id) ?? 0,
      played: played.get(profile.id) ?? 0,
    }))
    .sort((a, b) => b.firsts - a.firsts || b.played - a.played);
}

/**
 * Every profile tied for the most firsts — standings() and houseChampions()
 * both share ranks/firsts across ties, so the UI must show all of them, not
 * just whichever one sorted first. Empty when nobody has a first yet.
 */
export function topChampions(rows: ChampionRow[]): ChampionRow[] {
  const max = rows.reduce((m, r) => Math.max(m, r.firsts), 0);
  if (max === 0) return [];
  return rows.filter((r) => r.firsts === max);
}

/**
 * Merge two snapshots of family state — typically "what's on disk right now"
 * and "what this tab is about to write" — so a read-modify-write save never
 * clobbers a score another tab wrote in between. Used by storage.ts.
 *
 * - Profiles: union by id. When both sides know an id, `incoming`'s copy of
 *   that profile wins (in practice this never differs — a profile's
 *   name/color are set once at creation and never mutated — but a
 *   deterministic tie-break is still needed).
 * - Bests: union by board+player, keeping the better score per `lowerBoards`
 *   direction. Reuses recordBest so "better" has exactly one definition in
 *   the codebase — this function does not re-implement that comparison.
 * - activeId: `incoming`'s choice wins (it reflects the most recent
 *   interaction on the tab doing the saving), falling back to `disk`'s.
 * - Tombstones: union by id, keeping the later timestamp when both sides
 *   recorded one. Any profile (and any bests entry) whose id is tombstoned
 *   on either side is dropped from the result — a plain union of profiles
 *   has no way to represent "this one was deleted," so without this step a
 *   removal made on one side always gets resurrected by the other side's
 *   copy on the very next merge.
 */
export function mergeFamilyState(
  disk: FamilyState,
  incoming: FamilyState,
  lowerBoards: ReadonlySet<string>,
): FamilyState {
  const tombstones: Record<string, number> = { ...disk.tombstones };
  for (const [id, ts] of Object.entries(incoming.tombstones)) {
    tombstones[id] = Math.max(tombstones[id] ?? 0, ts);
  }

  const byId = new Map<string, Profile>();
  for (const p of disk.profiles) byId.set(p.id, p);
  for (const p of incoming.profiles) byId.set(p.id, p);
  for (const id of Object.keys(tombstones)) byId.delete(id);

  const stripTombstoned = (bests: FamilyState["bests"]): FamilyState["bests"] => {
    const out: FamilyState["bests"] = {};
    for (const [boardId, byPlayer] of Object.entries(bests)) {
      const kept: Record<string, number> = {};
      for (const [profileId, score] of Object.entries(byPlayer)) {
        if (!(profileId in tombstones)) kept[profileId] = score;
      }
      if (Object.keys(kept).length > 0) out[boardId] = kept;
    }
    return out;
  };

  let activeId = incoming.activeId ?? disk.activeId;
  if (activeId !== null && !byId.has(activeId)) {
    activeId = [...byId.values()][0]?.id ?? null;
  }

  let merged: FamilyState = {
    profiles: [...byId.values()],
    activeId,
    bests: stripTombstoned(disk.bests),
    tombstones,
  };
  for (const [boardId, byPlayer] of Object.entries(incoming.bests)) {
    for (const [profileId, score] of Object.entries(byPlayer)) {
      if (profileId in tombstones) continue;
      merged = recordBest(merged, boardId, profileId, score, lowerBoards.has(boardId));
    }
  }
  return merged;
}
