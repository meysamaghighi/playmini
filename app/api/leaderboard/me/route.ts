import { GAMES } from "../../../lib/leaderboard/config.ts";
import { getPlayerRank, storeAvailable } from "../../../lib/leaderboard/store.ts";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const game = url.searchParams.get("game") ?? "";
  if (!Object.hasOwn(GAMES, game)) return Response.json({ error: "unknown game" }, { status: 400 });
  const avail = storeAvailable();
  if (!avail.ok) return Response.json({ error: avail.reason }, { status: 503 });
  const playerId = url.searchParams.get("playerId")?.slice(0, 64);
  if (!playerId) return Response.json({ error: "playerId required" }, { status: 400 });
  try {
    const you = await getPlayerRank(game, playerId);
    return Response.json({ you }, { headers: { "Cache-Control": "private, no-store" } });
  } catch {
    return Response.json({ error: "leaderboard unavailable" }, { status: 503 });
  }
}
