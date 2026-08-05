import { test } from "node:test";
import assert from "node:assert/strict";
import {
  emptyState,
  addProfile,
  removeProfile,
  setActive,
  MAX_PROFILES,
  recordBest,
  standings,
  houseChampions,
  topChampions,
  mergeFamilyState,
} from "../app/lib/family/profiles.ts";

test("emptyState has no profiles and no active player", () => {
  const s = emptyState();
  assert.deepEqual(s.profiles, []);
  assert.equal(s.activeId, null);
  assert.deepEqual(s.bests, {});
});

test("addProfile appends, trims the name, and auto-activates the first profile", () => {
  let s = emptyState();
  s = addProfile(s, "  Mira  ", "p1");
  assert.equal(s.profiles.length, 1);
  assert.equal(s.profiles[0].name, "Mira");
  assert.equal(s.profiles[0].id, "p1");
  assert.equal(s.activeId, "p1", "first profile added becomes active");
  s = addProfile(s, "Dad", "p2");
  assert.equal(s.activeId, "p1", "adding a second profile does not steal focus");
});

test("addProfile assigns distinct colors and caps the name at 16 chars", () => {
  let s = emptyState();
  s = addProfile(s, "x".repeat(40), "p1");
  assert.equal(s.profiles[0].name.length, 16);
  s = addProfile(s, "Dad", "p2");
  assert.notEqual(s.profiles[0].color, s.profiles[1].color);
});

test("addProfile rejects an empty name and refuses past MAX_PROFILES", () => {
  let s = emptyState();
  s = addProfile(s, "   ", "p0");
  assert.equal(s.profiles.length, 0, "blank name is ignored");
  for (let i = 0; i < MAX_PROFILES + 3; i++) s = addProfile(s, `P${i}`, `id${i}`);
  assert.equal(s.profiles.length, MAX_PROFILES);
});

test("removeProfile drops the profile, its scores, and reassigns active", () => {
  let s = emptyState();
  s = addProfile(s, "Mira", "p1");
  s = addProfile(s, "Dad", "p2");
  s.bests = { snake: { p1: 100, p2: 50 } };
  s = removeProfile(s, "p1");
  assert.deepEqual(s.profiles.map((p) => p.id), ["p2"]);
  assert.equal(s.bests.snake.p1, undefined, "removing a player removes their scores");
  assert.equal(s.activeId, "p2", "active moves to a surviving profile");
  s = removeProfile(s, "p2");
  assert.equal(s.activeId, null, "no profiles left means no active player");
});

test("setActive only accepts a known profile id", () => {
  let s = addProfile(emptyState(), "Mira", "p1");
  s = setActive(s, "ghost");
  assert.equal(s.activeId, "p1", "unknown id is ignored");
  s = setActive(s, null);
  assert.equal(s.activeId, null);
});

function twoPlayers() {
  let s = addProfile(emptyState(), "Mira", "p1");
  s = addProfile(s, "Dad", "p2");
  return s;
}

test("recordBest stores a first score for a player on a board", () => {
  const s = recordBest(twoPlayers(), "snake", "p1", 120, false);
  assert.equal(s.bests.snake.p1, 120);
});

test("recordBest only improves — higher-is-better keeps the max", () => {
  let s = recordBest(twoPlayers(), "snake", "p1", 120, false);
  s = recordBest(s, "snake", "p1", 90, false);
  assert.equal(s.bests.snake.p1, 120, "a worse score must not overwrite the best");
  s = recordBest(s, "snake", "p1", 300, false);
  assert.equal(s.bests.snake.p1, 300);
});

test("recordBest only improves — lower-is-better keeps the min", () => {
  let s = recordBest(twoPlayers(), "sudoku-hard", "p1", 300, true);
  s = recordBest(s, "sudoku-hard", "p1", 420, true);
  assert.equal(s.bests["sudoku-hard"].p1, 300);
  s = recordBest(s, "sudoku-hard", "p1", 180, true);
  assert.equal(s.bests["sudoku-hard"].p1, 180);
});

test("recordBest ignores unknown players and non-finite scores", () => {
  const base = twoPlayers();
  assert.equal(recordBest(base, "snake", "ghost", 100, false).bests.snake, undefined);
  assert.equal(recordBest(base, "snake", "p1", NaN, false).bests.snake, undefined);
  assert.equal(recordBest(base, "snake", "p1", Infinity, false).bests.snake, undefined);
});

test("standings rank best-first and include every player who has played", () => {
  let s = twoPlayers();
  s = recordBest(s, "snake", "p1", 100, false);
  s = recordBest(s, "snake", "p2", 300, false);
  const rows = standings(s, "snake", false);
  assert.deepEqual(rows.map((r) => [r.rank, r.profile.name, r.score]), [
    [1, "Dad", 300],
    [2, "Mira", 100],
  ]);
});

test("standings invert for lower-is-better boards", () => {
  let s = twoPlayers();
  s = recordBest(s, "sudoku-hard", "p1", 200, true);
  s = recordBest(s, "sudoku-hard", "p2", 500, true);
  assert.deepEqual(standings(s, "sudoku-hard", true).map((r) => r.profile.name), ["Mira", "Dad"]);
});

test("standings omit players with no score and return [] for an unplayed board", () => {
  let s = twoPlayers();
  s = recordBest(s, "snake", "p1", 100, false);
  assert.equal(standings(s, "snake", false).length, 1);
  assert.deepEqual(standings(s, "pong", false), []);
});

test("standings give tied scores the same rank", () => {
  let s = twoPlayers();
  s = recordBest(s, "snake", "p1", 100, false);
  s = recordBest(s, "snake", "p2", 100, false);
  assert.deepEqual(standings(s, "snake", false).map((r) => r.rank), [1, 1]);
});

test("houseChampions counts first places across boards, best first", () => {
  let s = twoPlayers();
  s = recordBest(s, "snake", "p1", 300, false);   // Mira #1
  s = recordBest(s, "snake", "p2", 100, false);
  s = recordBest(s, "pong", "p1", 5, false);
  s = recordBest(s, "pong", "p2", 9, false);      // Dad #1
  s = recordBest(s, "2048", "p1", 2048, false);   // Mira #1 (only player)
  const rows = houseChampions(s, new Set());
  assert.deepEqual(rows.map((r) => [r.profile.name, r.firsts, r.played]), [
    ["Mira", 2, 3],
    ["Dad", 1, 2],
  ]);
});

test("houseChampions respects lower-is-better boards", () => {
  let s = twoPlayers();
  s = recordBest(s, "sudoku-hard", "p1", 500, true);
  s = recordBest(s, "sudoku-hard", "p2", 200, true); // Dad is faster, so Dad is #1
  const rows = houseChampions(s, new Set(["sudoku-hard"]));
  assert.equal(rows[0].profile.name, "Dad");
  assert.equal(rows[0].firsts, 1);
});

test("houseChampions awards a shared first to every tied player", () => {
  let s = twoPlayers();
  s = recordBest(s, "snake", "p1", 100, false);
  s = recordBest(s, "snake", "p2", 100, false);
  const rows = houseChampions(s, new Set());
  assert.deepEqual(rows.map((r) => r.firsts), [1, 1]);
});

test("houseChampions lists every profile, including one who has never played", () => {
  const rows = houseChampions(twoPlayers(), new Set());
  assert.equal(rows.length, 2);
  assert.deepEqual(rows.map((r) => [r.firsts, r.played]), [[0, 0], [0, 0]]);
});

// Promoted test gap: the two lower-is-better tests above each use a single
// board, so a per-call direction bug (e.g. a global "lower wins" flag) would
// pass them both. A state with one higher-is-better AND one lower-is-better
// board at once is the direct guard, and exactly what a real family with
// mixed game types produces on day one.
test("houseChampions ranks a higher-is-better board and a lower-is-better board independently in the same call", () => {
  let s = twoPlayers();
  s = recordBest(s, "snake", "p1", 300, false); // higher wins: Mira #1
  s = recordBest(s, "snake", "p2", 100, false);
  s = recordBest(s, "sudoku-hard", "p1", 500, true); // lower wins: Dad #1
  s = recordBest(s, "sudoku-hard", "p2", 200, true);
  const rows = houseChampions(s, new Set(["sudoku-hard"]));
  assert.deepEqual(rows.map((r) => [r.profile.name, r.firsts]), [
    ["Mira", 1],
    ["Dad", 1],
  ]);
});

test("topChampions returns every profile tied for the max, not just one", () => {
  let s = twoPlayers();
  s = addProfile(s, "Kid", "p3");
  s = recordBest(s, "snake", "p1", 100, false);
  s = recordBest(s, "snake", "p2", 100, false); // tied with Mira for snake's first
  s = recordBest(s, "pong", "p1", 5, false); // Mira's second first — breaks the tie
  const rows = houseChampions(s, new Set());
  const champs = topChampions(rows);
  assert.deepEqual(champs.map((r) => r.profile.name), ["Mira"]);
});

test("topChampions returns all tied leaders when the tie is at the top", () => {
  let s = twoPlayers();
  s = recordBest(s, "snake", "p1", 100, false);
  s = recordBest(s, "snake", "p2", 100, false);
  const rows = houseChampions(s, new Set());
  const champs = topChampions(rows).map((r) => r.profile.name).sort();
  assert.deepEqual(champs, ["Dad", "Mira"]);
});

test("topChampions is empty when nobody has a first yet", () => {
  const rows = houseChampions(twoPlayers(), new Set());
  assert.deepEqual(topChampions(rows), []);
});

// Finding 1: switching the active player while a game-over score is still
// showing must move that score to the new player and leave nothing behind on
// the old one. FamilyBoard.tsx implements this by re-applying recordBest to
// the state snapshot from BEFORE the score was first auto-recorded (not the
// state after), for the newly selected player. This test verifies that
// re-application is what actually avoids the phantom — recording against the
// post-record state would instead leave the score on both players.
test("re-applying a recorded score to the pre-record snapshot moves it with no phantom on the previous player", () => {
  const base = twoPlayers(); // pre-record snapshot: neither player has a score yet
  const recordedToP1 = recordBest(base, "snake", "p1", 300, false); // simulated auto-record
  assert.equal(recordedToP1.bests.snake.p1, 300);

  // Simulate switching the active player to p2: re-apply from `base`, not
  // from `recordedToP1`.
  const movedToP2 = recordBest(base, "snake", "p2", 300, false);
  assert.equal(movedToP2.bests.snake.p2, 300, "the score lands on the newly selected player");
  assert.equal(movedToP2.bests.snake?.p1, undefined, "no phantom best is left on the previous player");
});

test("moving a recorded score to a player with a better existing best does not regress their record", () => {
  let base = twoPlayers();
  base = recordBest(base, "snake", "p2", 500, false); // Dad already has a better score
  const moved = recordBest(base, "snake", "p2", 300, false); // this run's score is worse
  assert.equal(moved.bests.snake.p2, 500, "an existing better best is not clobbered by a moved lesser score");
});

import { loadFamily, saveFamily, FAMILY_KEY } from "../app/lib/family/storage.ts";

function fakeStore() {
  const data = new Map<string, string>();
  return {
    data,
    getItem: (k: string) => data.get(k) ?? null,
    setItem: (k: string, v: string) => void data.set(k, v),
  };
}

test("saveFamily then loadFamily round-trips state", () => {
  const store = fakeStore();
  let s = addProfile(emptyState(), "Mira", "p1");
  s = recordBest(s, "snake", "p1", 250, false);
  saveFamily(s, store);
  const loaded = loadFamily(store);
  assert.equal(loaded.profiles[0].name, "Mira");
  assert.equal(loaded.bests.snake.p1, 250);
  assert.equal(loaded.activeId, "p1");
});

test("loadFamily returns an empty state when nothing is stored", () => {
  assert.deepEqual(loadFamily(fakeStore()), emptyState());
});

test("loadFamily survives corrupt or half-shaped JSON without throwing", () => {
  const bad = fakeStore();
  bad.data.set(FAMILY_KEY, "{not json");
  assert.deepEqual(loadFamily(bad), emptyState());

  const partial = fakeStore();
  partial.data.set(FAMILY_KEY, JSON.stringify({ profiles: "nope" }));
  const s = loadFamily(partial);
  assert.deepEqual(s.profiles, []);
  assert.deepEqual(s.bests, {});
});

test("loadFamily drops an activeId that no longer matches a profile", () => {
  const store = fakeStore();
  store.data.set(
    FAMILY_KEY,
    JSON.stringify({ profiles: [{ id: "p1", name: "Mira", color: "#E8734A" }], activeId: "ghost", bests: {} }),
  );
  assert.equal(loadFamily(store).activeId, null);
});

test("saveFamily never throws when storage rejects the write", () => {
  const hostile = {
    getItem: () => null,
    setItem: () => {
      throw new Error("QuotaExceededError");
    },
  };
  assert.doesNotThrow(() => saveFamily(emptyState(), hostile));
});

test("loadFamily drops a __proto__ board or player key instead of letting it reassign a prototype", () => {
  const store = fakeStore();
  // A hand-edited blob: "__proto__" as a board id, and as a player id inside
  // a legitimate board. Built as a raw string (not via an object literal or
  // JSON.stringify of one) because a literal `{ __proto__: ... }` sets the
  // prototype at construction time rather than creating an enumerable key —
  // this is what a real corrupted localStorage value looks like.
  store.data.set(
    FAMILY_KEY,
    '{"profiles":[],"activeId":null,"bests":{"__proto__":{"p1":999},"snake":{"__proto__":1,"p1":250}}}',
  );
  const loaded = loadFamily(store);
  assert.equal(Object.getPrototypeOf(loaded.bests), Object.prototype, "bests keeps a normal prototype");
  assert.equal(loaded.bests.__proto__, Object.prototype, "the __proto__ board key was dropped, not stored");
  assert.equal(loaded.bests.snake.p1, 250, "the real score on the board survives");
  assert.equal(Object.keys(loaded.bests.snake).includes("__proto__"), false, "the __proto__ player key was dropped");
});

test("mergeFamilyState unions profiles from both sides by id", () => {
  const disk = addProfile(emptyState(), "Mira", "p1");
  const incoming = addProfile(emptyState(), "Dad", "p2");
  const merged = mergeFamilyState(disk, incoming, new Set());
  assert.deepEqual(merged.profiles.map((p) => p.id).sort(), ["p1", "p2"]);
});

test("mergeFamilyState keeps the better score per board+player, honoring direction, regardless of merge order", () => {
  const s = twoPlayers();
  const diskBetter = recordBest(s, "sudoku-hard", "p1", 200, true); // faster time on disk
  const incomingWorse = recordBest(s, "sudoku-hard", "p1", 500, true); // slower time incoming
  const merged = mergeFamilyState(diskBetter, incomingWorse, new Set(["sudoku-hard"]));
  assert.equal(merged.bests["sudoku-hard"].p1, 200, "the lower (better) time wins");
});

test("mergeFamilyState: a genuinely better incoming score does overwrite disk", () => {
  const s = twoPlayers();
  const disk = recordBest(s, "snake", "p1", 100, false);
  const incoming = recordBest(s, "snake", "p1", 400, false);
  const merged = mergeFamilyState(disk, incoming, new Set());
  assert.equal(merged.bests.snake.p1, 400);
});

test("saveFamily merges instead of clobbering when another tab wrote a score first", () => {
  const store = fakeStore();
  // Both tabs start from the same shared snapshot.
  let base = addProfile(emptyState(), "Mira", "p1");
  base = addProfile(base, "Dad", "p2");
  saveFamily(base, store);

  const tabA = loadFamily(store);
  const tabB = loadFamily(store);

  // Tab B records a score and saves first.
  const tabBAfter = recordBest(tabB, "snake", "p2", 300, false);
  saveFamily(tabBAfter, store);

  // Tab A, still holding its stale in-memory copy from before B's save,
  // records its own score and saves.
  const tabAAfter = recordBest(tabA, "snake", "p1", 150, false);
  saveFamily(tabAAfter, store);

  const final = loadFamily(store);
  assert.equal(final.bests.snake.p1, 150, "tab A's score made it through");
  assert.equal(final.bests.snake.p2, 300, "tab B's earlier save was not clobbered by tab A's stale write");
});
