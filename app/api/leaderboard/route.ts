import { GAMES } from "../../lib/leaderboard/config.ts";
import { getBoard, storeAvailable } from "../../lib/leaderboard/store.ts";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const game = url.searchParams.get("game") ?? "";
  if (!Object.hasOwn(GAMES, game)) return Response.json({ error: "unknown game" }, { status: 400 });
  const avail = storeAvailable();
  if (!avail.ok) return Response.json({ error: avail.reason }, { status: 503 });
  const playerId = (url.searchParams.get("playerId") ?? undefined)?.slice(0, 64);
  try {
    const board = await getBoard(game, playerId);
    return Response.json(board, {
      headers: { "Cache-Control": "s-maxage=30, stale-while-revalidate=60" },
    });
  } catch {
    return Response.json({ error: "leaderboard unavailable" }, { status: 503 });
  }
}
