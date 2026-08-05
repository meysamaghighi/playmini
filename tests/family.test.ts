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
