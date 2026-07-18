import { test } from "node:test";
import assert from "node:assert/strict";
import { sanitizeNickname, validateScore } from "../app/lib/leaderboard/validate.ts";
import { submitScore, getBoard, checkRateLimit, __resetMemoryStore } from "../app/lib/leaderboard/store.ts";

test("sanitizeNickname trims, caps at 20, collapses whitespace", () => {
  assert.equal(sanitizeNickname("  Meysam   A  "), "Meysam A");
  assert.equal(sanitizeNickname("x".repeat(50)).length, 20);
});

test("sanitizeNickname strips control/zero-width chars", () => {
  assert.equal(sanitizeNickname("Bob ​‍cat"), "Bob cat");
});

test("sanitizeNickname strips real control bytes (NUL, C0)", () => {
  assert.equal(sanitizeNickname("Bob\x00\x01\x1Fcat"), "Bobcat");
});

test("sanitizeNickname empty or profane becomes Player", () => {
  assert.equal(sanitizeNickname("   "), "Player");
  assert.equal(sanitizeNickname("fuck"), "Player");
});

test("validateScore enforces per-game bounds and numeric type", () => {
  assert.deepEqual(validateScore("2048", 2048), { ok: true, value: 2048 });
  assert.equal(validateScore("2048", 3).ok, false);
  assert.equal(validateScore("2048", 500001).ok, false);
  assert.equal(validateScore("2048", "250").ok, false);
  assert.equal(validateScore("2048", NaN).ok, false);
  assert.equal(validateScore("nope", 250).ok, false);
});

test("submitScore keeps one row per player, only improves", async () => {
  __resetMemoryStore();
  const a1 = await submitScore({ game: "2048", score: 300, nickname: "A", playerId: "p1", cc: "SE" });
  assert.equal(a1.accepted, true);
  assert.equal(a1.worldRank, 1);
  // Worse score (lower on higher-is-better) is rejected but still reports rank.
  const a2 = await submitScore({ game: "2048", score: 200, nickname: "A", playerId: "p1", cc: "SE" });
  assert.equal(a2.accepted, false);
  assert.equal(a2.best, 300);
  // Better score overwrites.
  const a3 = await submitScore({ game: "2048", score: 400, nickname: "A", playerId: "p1", cc: "SE" });
  assert.equal(a3.accepted, true);
  const board = await getBoard("2048", "p1");
  assert.equal(board.totalPlayers, 1);
  assert.equal(board.top[0].score, 400);
});

test("higher-is-better ranking orders descending; country rank filters by cc", async () => {
  __resetMemoryStore();
  await submitScore({ game: "2048", score: 250, nickname: "Swede", playerId: "s1", cc: "SE" });
  await submitScore({ game: "2048", score: 180, nickname: "Yank", playerId: "u1", cc: "US" });
  const r = await submitScore({ game: "2048", score: 210, nickname: "Swede2", playerId: "s2", cc: "SE" });
  assert.equal(r.worldRank, 2);       // 250 > 210 > 180
  assert.equal(r.countryRank, 2);     // SE has 250 (Swede) then 210 (Swede2)
  const board = await getBoard("2048");
  assert.deepEqual(board.top.map((x) => x.name), ["Swede", "Swede2", "Yank"]);
  assert.equal(board.top[0].rank, 1);
});

test("rejected resubmit updates display name/country but keeps best score", async () => {
  __resetMemoryStore();
  await submitScore({ game: "2048", score: 300, nickname: "OldName", playerId: "p1", cc: "SE" });
  const r = await submitScore({ game: "2048", score: 200, nickname: "NewName", playerId: "p1", cc: "US" });
  assert.equal(r.accepted, false);
  assert.equal(r.best, 300);        // score unchanged (worse rejected)
  assert.equal(r.countryRank, 1);   // ranked within the NEW country (US)
  const board = await getBoard("2048", "p1");
  assert.equal(board.top[0].name, "NewName"); // display identity follows the player
  assert.equal(board.top[0].cc, "US");
  assert.equal(board.top[0].score, 300);
});

test("rate limit allows 10 then blocks", async () => {
  __resetMemoryStore();
  for (let i = 0; i < 10; i++) assert.equal(await checkRateLimit(["k1"]), true);
  assert.equal(await checkRateLimit(["k1"]), false);
});

// ---------------------------------------------------------------------
// Redis REST path — exercises the real Upstash code path via a mocked
// fetch. store.ts reads UPSTASH_REDIS_REST_URL/TOKEN lazily (per-call),
// so flipping them here at test time is enough to switch off the memory
// fallback without restructuring the module. Kept LAST in the file, with
// fetch/env fully restored in `finally`, so earlier (and any later)
// memory-path tests are unaffected by run order.
// ---------------------------------------------------------------------

type FakeFetchCall = { cmd: unknown[] };

function withFakeRedis(
  responses: unknown[],
  run: (calls: FakeFetchCall[]) => Promise<void>
): Promise<void> {
  const calls: FakeFetchCall[] = [];
  const originalFetch = globalThis.fetch;
  const originalUrl = process.env.UPSTASH_REDIS_REST_URL;
  const originalToken = process.env.UPSTASH_REDIS_REST_TOKEN;

  process.env.UPSTASH_REDIS_REST_URL = "https://fake-redis.example/";
  process.env.UPSTASH_REDIS_REST_TOKEN = "fake-token";

  globalThis.fetch = (async (_url: string | URL, init?: RequestInit) => {
    const cmd = JSON.parse(String(init?.body)) as unknown[];
    calls.push({ cmd });
    const result = responses.shift();
    return {
      ok: true,
      json: async () => ({ result }),
    } as Response;
  }) as typeof fetch;

  return run(calls).finally(() => {
    globalThis.fetch = originalFetch;
    if (originalUrl === undefined) delete process.env.UPSTASH_REDIS_REST_URL;
    else process.env.UPSTASH_REDIS_REST_URL = originalUrl;
    if (originalToken === undefined) delete process.env.UPSTASH_REDIS_REST_TOKEN;
    else process.env.UPSTASH_REDIS_REST_TOKEN = originalToken;
  });
}

test("redis path: submitScore happy path issues correctly-shaped commands", async () => {
  await withFakeRedis(
    [
      null, // ZSCORE lb:pm:2048 p1 -> no prior score
      1, // ZADD
      1, // HSET
      ["p1", "300"], // ZRANGE (fullBoard, for computeRanks) — not negated, 2048 is higher-is-better
      [JSON.stringify({ name: "A", cc: "SE", ts: 1 })], // HMGET (readMeta)
    ],
    async (calls) => {
      const r = await submitScore({ game: "2048", score: 300, nickname: "A", playerId: "p1", cc: "SE" });
      assert.equal(r.accepted, true);
      assert.equal(r.best, 300);
      assert.equal(r.worldRank, 1);
      assert.equal(r.countryRank, 1);

      assert.deepEqual(calls[0].cmd, ["ZSCORE", "lb:pm:2048", "p1"]);
      assert.deepEqual(calls[1].cmd, ["ZADD", "lb:pm:2048", 300, "p1"]);
      assert.equal(calls[2].cmd[0], "HSET");
      assert.equal(calls[2].cmd[1], "lb:pm:2048:meta");
      assert.deepEqual(calls[3].cmd, ["ZRANGE", "lb:pm:2048", 0, -1, "REV", "WITHSCORES"]);
      assert.equal(calls[4].cmd[0], "HMGET");
    }
  );
});

test("redis path: checkRateLimit issues INCR/EXPIRE and blocks over the cap", async () => {
  await withFakeRedis([1, 1, 11], async (calls) => {
    const first = await checkRateLimit(["rk1"]);
    assert.equal(first, true);
    const second = await checkRateLimit(["rk1"]);
    assert.equal(second, false);

    assert.deepEqual(calls[0].cmd, ["INCR", "lb:rl:rk1"]);
    assert.deepEqual(calls[1].cmd, ["EXPIRE", "lb:rl:rk1", 60]);
    assert.deepEqual(calls[2].cmd, ["INCR", "lb:rl:rk1"]);
  });
});

// --------- Route handlers ---------

import { GET as boardGET } from "../app/api/leaderboard/route.ts";
import { POST as submitPOST } from "../app/api/leaderboard/submit/route.ts";

function postReq(body: unknown, headers: Record<string, string> = {}) {
  return new Request("http://x/api/leaderboard/submit", {
    method: "POST",
    headers: { "Content-Type": "application/json", ...headers },
    body: JSON.stringify(body),
  });
}

test("submit route: happy path stores country from vercel header", async () => {
  __resetMemoryStore();
  const res = await submitPOST(postReq(
    { game: "2048", score: 222, nickname: "Zoe", playerId: "pz" },
    { "x-vercel-ip-country": "SE" }
  ));
  assert.equal(res.status, 200);
  const j = await res.json();
  assert.equal(j.accepted, true);
  assert.equal(j.worldRank, 1);
  const b = await (await boardGET(new Request("http://x/api/leaderboard?game=2048&playerId=pz"))).json();
  assert.equal(b.top[0].cc, "SE");
  assert.equal(b.you.rank, 1);
});

test("submit route: rejects garbage", async () => {
  __resetMemoryStore();
  assert.equal((await submitPOST(postReq({ game: "2048", score: 3, nickname: "a", playerId: "p" }))).status, 400);
  assert.equal((await submitPOST(postReq({ game: "nope", score: 200, nickname: "a", playerId: "p" }))).status, 400);
  assert.equal((await submitPOST(postReq({ game: "2048", score: 200, nickname: "a" }))).status, 400); // no playerId
  const bad = new Request("http://x/api/leaderboard/submit", { method: "POST", body: "not json" });
  assert.equal((await submitPOST(bad)).status, 400);
});

test("board route: 400 on unknown game", async () => {
  assert.equal((await boardGET(new Request("http://x/api/leaderboard?game=nope"))).status, 400);
});

test("prototype property names are not valid games", async () => {
  __resetMemoryStore();
  for (const g of ["hasOwnProperty", "constructor", "toString", "__proto__"]) {
    assert.equal((await boardGET(new Request(`http://x/api/leaderboard?game=${g}`))).status, 400);
    assert.equal((await submitPOST(postReq({ game: g, score: 99999999, nickname: "x", playerId: "y" }))).status, 400);
  }
  assert.equal(validateScore("hasOwnProperty", 99999999).ok, false);
});
