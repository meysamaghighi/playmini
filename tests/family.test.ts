import { test } from "node:test";
import assert from "node:assert/strict";
import {
  emptyState,
  addProfile,
  removeProfile,
  setActive,
  MAX_PROFILES,
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
