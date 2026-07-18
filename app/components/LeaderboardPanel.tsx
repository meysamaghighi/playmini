"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

type Row = { rank: number; name: string; cc: string; score: number };
type Board = { top: Row[]; you: { rank: number; score: number } | null; totalPlayers: number };
type SubmitResult = { accepted: boolean; best: number; worldRank: number; countryRank: number; totalPlayers: number };

function pid(): string {
  try {
    let id = localStorage.getItem("lb.pid");
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem("lb.pid", id);
    }
    return id;
  } catch {
    return "anon";
  }
}

function Flag({ cc }: { cc: string }) {
  const [broken, setBroken] = useState(false);
  if (!cc || broken) {
    return (
      <span aria-label="unknown country" className="inline-block w-5 text-center">
        🌐
      </span>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`/flags/${cc.toLowerCase()}.svg`}
      alt={cc}
      width={20}
      height={15}
      className="inline-block rounded-[2px]"
      onError={() => setBroken(true)}
    />
  );
}

export default function LeaderboardPanel({
  game,
  score,
  unit = "",
}: {
  game: string;
  score: number | null;
  unit?: string;
}) {
  const [nick, setNick] = useState("");
  const [board, setBoard] = useState<Board | null>(null);
  const [result, setResult] = useState<SubmitResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [scope, setScope] = useState<"world" | "country">("world");
  const viewed = useRef(false);

  const load = useCallback(async () => {
    try {
      const res = await fetch(`/api/leaderboard?game=${game}&playerId=${encodeURIComponent(pid())}`);
      if (res.ok) setBoard((await res.json()) as Board);
    } catch {
      /* board is optional — never break the game */
    }
  }, [game]);

  useEffect(() => {
    try {
      setNick(localStorage.getItem("lb.nick") ?? "");
    } catch {
      /* ignore */
    }
    void load();
    if (!viewed.current) {
      viewed.current = true;
      window.gtag?.("event", "leaderboard_view", { game });
    }
  }, [game, load]);

  const rows = useMemo(() => board?.top ?? [], [board]);

  // Country scope needs the viewer's cc; derive it from their own row if present.
  const myCc = useMemo(() => {
    const mine = rows.find((r) => board?.you && r.rank === board.you.rank);
    return mine?.cc ?? "";
  }, [rows, board]);

  const visible = scope === "world" ? rows : rows.filter((r) => r.cc === myCc);

  async function submit() {
    if (busy || score === null) return;
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/leaderboard/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ game, score, nickname: nick, playerId: pid() }),
      });
      const j = await res.json();
      if (!res.ok) {
        setError(j.error ?? "could not submit");
        return;
      }
      setResult(j as SubmitResult);
      try {
        localStorage.setItem("lb.nick", nick);
      } catch {
        /* ignore */
      }
      window.gtag?.("event", "leaderboard_submit", { game });
      void load();
    } catch {
      setError("offline — try again later");
    } finally {
      setBusy(false);
    }
  }

  return (
    // Explicit text-ink so descendants never inherit a light color from a
    // dark game-area ancestor (mirrors the speed-test fix).
    <div className="mt-6 rounded-xl border border-line bg-paper-2 p-4 text-left text-ink">
      <h3 className="font-display text-lg text-ink mb-3" style={{ fontWeight: 800 }}>
        🌍 Global Leaderboard
      </h3>

      {score !== null && !result && (
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <label htmlFor="lb-nick" className="sr-only">
            Your name
          </label>
          <input
            id="lb-nick"
            value={nick}
            onChange={(e) => setNick(e.target.value)}
            maxLength={20}
            placeholder="Your name"
            className="px-3 py-2 rounded-lg border border-line bg-paper text-ink text-sm w-40"
          />
          <button
            onClick={submit}
            disabled={busy}
            className="px-4 py-2 rounded-lg text-sm font-bold text-ink bg-amber-600 hover:bg-amber-700 disabled:opacity-50"
          >
            {busy ? "Submitting…" : `Submit ${score}${unit}`}
          </button>
        </div>
      )}

      {result && (
        <p className="text-sm text-ink mb-3">
          You&apos;re <strong>#{result.worldRank}</strong> in the world
          {result.countryRank > 0 && myCc ? (
            <>
              {" "}
              · <strong>#{result.countryRank}</strong> in your country
            </>
          ) : null}
          {!result.accepted ? (
            <>
              {" "}
              (kept your best: {result.best}
              {unit})
            </>
          ) : null}
        </p>
      )}
      {error && (
        <p role="alert" className="text-sm text-red-500 mb-3">
          {error}
        </p>
      )}

      <div className="flex gap-2 mb-2">
        {(["world", "country"] as const).map((s) => (
          <button
            key={s}
            onClick={() => setScope(s)}
            aria-pressed={scope === s}
            className={`px-3 py-1 rounded-full text-xs border border-line ${scope === s ? "font-bold" : "text-ink-3"}`}
          >
            {s === "world" ? "Global" : "My country"}
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <p className="text-sm text-ink-3">No scores yet — be the first!</p>
      ) : (
        <ol className="max-h-64 overflow-y-auto text-sm">
          {visible.map((r) => {
            const isMe = board?.you?.rank === r.rank;
            return (
              <li
                key={`${r.rank}-${r.name}`}
                className={`flex items-center gap-2 py-1 px-2 rounded ${isMe ? "bg-paper font-bold" : ""}`}
              >
                <span className="w-8 text-right text-ink-3">#{r.rank}</span>
                <Flag cc={r.cc} />
                <span className="flex-1 truncate">{r.name}</span>
                <span>
                  {r.score}
                  {unit}
                </span>
              </li>
            );
          })}
        </ol>
      )}
      {board && board.you && board.you.rank > 100 && (
        <p className="text-sm text-ink-2 mt-1">
          … your best: #{board.you.rank} ({board.you.score}
          {unit})
        </p>
      )}
    </div>
  );
}
