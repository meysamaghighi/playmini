import { GAMES } from "../../../lib/leaderboard/config.ts";
import { sanitizeNickname, validateScore } from "../../../lib/leaderboard/validate.ts";
import { checkRateLimit, submitScore, storeAvailable } from "../../../lib/leaderboard/store.ts";
import { createHash } from "node:crypto";

export async function POST(req: Request) {
  const avail = storeAvailable();
  if (!avail.ok) return Response.json({ error: avail.reason }, { status: 503 });

  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return Response.json({ error: "invalid JSON" }, { status: 400 });
  }

  const game = typeof body.game === "string" ? body.game : "";
  if (!Object.hasOwn(GAMES, game)) return Response.json({ error: "unknown game" }, { status: 400 });
  const playerId = typeof body.playerId === "string" ? body.playerId.slice(0, 64) : "";
  if (!playerId) return Response.json({ error: "missing playerId" }, { status: 400 });
  const scoreCheck = validateScore(game, body.score);
  if (!scoreCheck.ok) return Response.json({ error: scoreCheck.error }, { status: 400 });
  const nickname = sanitizeNickname(typeof body.nickname === "string" ? body.nickname : "");

  // Rate limit per playerId and per hashed IP. The IP itself is never stored —
  // it exists only inside this request to derive the counter key (spec).
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "";
  const ipHash = ip ? createHash("sha256").update(ip).digest("hex").slice(0, 16) : "noip";
  if (!(await checkRateLimit([`p:${playerId}`, `ip:${ipHash}`]))) {
    return Response.json({ error: "too many submissions, slow down" }, { status: 429 });
  }

  const cc = (req.headers.get("x-vercel-ip-country") ?? "").toUpperCase();
  const country = /^[A-Z]{2}$/.test(cc) && cc !== "XX" ? cc : "";

  try {
    const result = await submitScore({ game, score: scoreCheck.value, nickname, playerId, cc: country });
    return Response.json(result);
  } catch {
    return Response.json({ error: "leaderboard unavailable" }, { status: 503 });
  }
}
