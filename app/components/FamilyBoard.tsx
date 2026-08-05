"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  addProfile,
  houseChampions,
  recordBest,
  removeProfile,
  setActive,
  standings,
  emptyState,
  MAX_PROFILES,
  type FamilyState,
} from "../lib/family/profiles";
import { loadFamily, newProfileId, saveFamily } from "../lib/family/storage";
import { GAMES } from "../lib/leaderboard/config";

const LOWER_BOARDS: ReadonlySet<string> = new Set(
  Object.entries(GAMES)
    .filter(([, cfg]) => cfg.lowerIsBetter)
    .map(([id]) => id),
);

export default function FamilyBoard({
  boardId,
  score,
  lowerIsBetter,
  unit = "",
}: {
  boardId: string;
  score: number | null;
  lowerIsBetter: boolean;
  unit?: string;
}) {
  const [state, setState] = useState<FamilyState>(emptyState);
  const [name, setName] = useState("");
  const [hydrated, setHydrated] = useState(false);
  // Guards against re-recording the same score on every re-render.
  const recorded = useRef<number | null>(null);

  useEffect(() => {
    setState(loadFamily());
    setHydrated(true);
  }, []);

  const update = useCallback((next: FamilyState) => {
    setState(next);
    saveFamily(next);
  }, []);

  useEffect(() => {
    if (!hydrated || score === null || recorded.current === score) return;
    if (!state.activeId) return;
    recorded.current = score;
    update(recordBest(state, boardId, state.activeId, score, lowerIsBetter));
  }, [hydrated, score, state, boardId, lowerIsBetter, update]);

  // A new run resets the guard so the next game-over records again.
  useEffect(() => {
    if (score === null) recorded.current = null;
  }, [score]);

  if (!hydrated) return null;

  const rows = standings(state, boardId, lowerIsBetter);
  const champions = houseChampions(state, LOWER_BOARDS);
  const topChampion = champions.find((c) => c.firsts > 0);

  const submitName = () => {
    const id = newProfileId();
    update(addProfile(state, name, id));
    setName("");
  };

  if (state.profiles.length === 0) {
    return (
      <div className="rounded-xl border border-line bg-paper-2 p-4">
        <p className="text-ink font-medium">Add players to start a scoreboard</p>
        <p className="text-ink-2 text-sm mt-1">
          Everyone on this device gets their own best score. Nothing is shared online.
        </p>
        <div className="mt-3 flex gap-2">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submitName()}
            placeholder="Name"
            maxLength={16}
            className="flex-1 rounded-lg border border-line bg-paper px-3 py-2 text-ink"
          />
          <button
            onClick={submitName}
            className="rounded-lg border border-line bg-paper px-4 py-2 text-ink font-medium"
          >
            Add
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-line bg-paper-2 p-4">
      <div className="flex flex-wrap gap-2">
        {state.profiles.map((p) => (
          <button
            key={p.id}
            onClick={() => update(setActive(state, p.id))}
            className={`rounded-full px-3 py-1 text-sm border ${
              state.activeId === p.id ? "border-ink text-ink font-semibold" : "border-line text-ink-2"
            }`}
            style={state.activeId === p.id ? { boxShadow: `inset 0 -2px 0 ${p.color}` } : undefined}
          >
            <span
              className="inline-block w-2 h-2 rounded-full mr-2 align-middle"
              style={{ background: p.color }}
            />
            {p.name}
          </button>
        ))}
        {state.profiles.length < MAX_PROFILES && (
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submitName()}
            placeholder="+ Add"
            maxLength={16}
            className="w-24 rounded-full border border-line bg-paper px-3 py-1 text-sm text-ink"
          />
        )}
      </div>

      {rows.length === 0 ? (
        <p className="text-ink-2 text-sm mt-4">
          No scores here yet — play a round and it lands on the board.
        </p>
      ) : (
        <ol className="mt-4 space-y-1">
          {rows.map((r) => (
            <li
              key={r.profile.id}
              className={`flex items-center justify-between rounded-lg px-3 py-2 ${
                r.profile.id === state.activeId ? "bg-paper" : ""
              }`}
            >
              <span className="text-ink">
                <span className="text-ink-2 tabular-nums mr-3">#{r.rank}</span>
                <span
                  className="inline-block w-2 h-2 rounded-full mr-2 align-middle"
                  style={{ background: r.profile.color }}
                />
                {r.profile.name}
              </span>
              <span className="text-ink tabular-nums font-semibold">
                {r.score}
                {unit}
              </span>
            </li>
          ))}
        </ol>
      )}

      {topChampion && (
        <p className="text-ink-2 text-sm mt-3 border-t border-line pt-3">
          🏆 House champion: <span className="text-ink font-semibold">{topChampion.profile.name}</span>{" "}
          — {topChampion.firsts} game{topChampion.firsts === 1 ? "" : "s"} in first place
        </p>
      )}

      {state.profiles.length > 0 && (
        <details className="mt-3">
          <summary className="text-ink-2 text-xs cursor-pointer">Manage players</summary>
          <div className="mt-2 flex flex-wrap gap-2">
            {state.profiles.map((p) => (
              <button
                key={p.id}
                onClick={() => update(removeProfile(state, p.id))}
                className="rounded-lg border border-line px-2 py-1 text-xs text-ink-2"
              >
                Remove {p.name}
              </button>
            ))}
          </div>
        </details>
      )}
    </div>
  );
}
