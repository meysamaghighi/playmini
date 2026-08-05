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
};

export const MAX_PROFILES = 6;
export const MAX_NAME_LEN = 16;

// Site palette tokens; distinct hues so 6 players are never confusable.
export const PROFILE_COLORS = [
  "#E8734A", "#4A90D9", "#57A773", "#C05A9E", "#D9A441", "#6C6BC0",
];

export function emptyState(): FamilyState {
  return { profiles: [], activeId: null, bests: {} };
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
  return { ...state, profiles, activeId: state.activeId ?? id };
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
  return { profiles, activeId, bests };
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
