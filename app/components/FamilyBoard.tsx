"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  addProfile,
  houseChampions,
  recordBest,
  removeProfile,
  setActive,
  standings,
  topChampions,
  emptyState,
  MAX_PROFILES,
  MAX_NAME_LEN,
  type FamilyState,
} from "../lib/family/profiles";
import { loadFamily, newProfileId, saveFamily } from "../lib/family/storage";
import { LOWER_BOARDS } from "../lib/leaderboard/config";

function joinNames(names: string[]): string {
  if (names.length <= 1) return names[0] ?? "";
  if (names.length === 2) return `${names[0]} & ${names[1]}`;
  return `${names.slice(0, -1).join(", ")} & ${names[names.length - 1]}`;
}

function NameInput({
  name,
  setName,
  submitName,
  autoFocus,
  className,
}: {
  name: string;
  setName: (v: string) => void;
  submitName: () => void;
  autoFocus?: boolean;
  className: string;
}) {
  return (
    <input
      value={name}
      onChange={(e) => setName(e.target.value)}
      onKeyDown={(e) => e.key === "Enter" && submitName()}
      placeholder={autoFocus ? "Name" : "+ Add"}
      maxLength={MAX_NAME_LEN}
      className={className}
    />
  );
}

export default function FamilyBoard({
  boardId,
  score,
  unit = "",
}: {
  boardId: string;
  score: number | null;
  unit?: string;
}) {
  const lowerIsBetter = LOWER_BOARDS.has(boardId);
  const [state, setState] = useState<FamilyState>(emptyState);
  const [name, setName] = useState("");
  const [hydrated, setHydrated] = useState(false);
  // Guards against re-recording the same score on every re-render.
  const recorded = useRef<number | null>(null);
  // Snapshot of state as it was immediately BEFORE `recorded.current` got
  // auto-recorded, and who it was recorded for. While the same game-over
  // score is still showing, switching the active player re-applies the
  // score to the new player starting from this snapshot — so the previous
  // player reverts to exactly what they had before (no phantom best) and a
  // fresh recordBest decides whether it actually improves the new player's
  // record.
  const preRecordState = useRef<FamilyState | null>(null);

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
    preRecordState.current = state;
    recorded.current = score;
    update(recordBest(state, boardId, state.activeId, score, lowerIsBetter));
  }, [hydrated, score, state, boardId, lowerIsBetter, update]);

  // A new run resets the guards so the next game-over records again.
  useEffect(() => {
    if (score === null) {
      recorded.current = null;
      preRecordState.current = null;
    }
  }, [score]);

  if (!hydrated) return null;

  const rows = standings(state, boardId, lowerIsBetter);
  const champions = topChampions(houseChampions(state, LOWER_BOARDS));

  const submitName = () => {
    const id = newProfileId();
    const next = addProfile(state, name, id);
    if (next !== state) {
      update(next);
      setName("");
    }
  };

  // Switching players while this run's score is still on screen moves the
  // score instead of leaving it stuck on whoever was active at game-over
  // (see preRecordState above). Any other switch (no live score, or the
  // player clicked is already active) is a plain setActive.
  const switchPlayer = (id: string) => {
    if (id === state.activeId) return;
    if (score !== null && recorded.current === score && preRecordState.current) {
      const next = setActive(
        recordBest(preRecordState.current, boardId, id, score, lowerIsBetter),
        id,
      );
      update(next);
      return;
    }
    update(setActive(state, id));
  };

  const removePlayer = (id: string, playerName: string) => {
    if (
      !window.confirm(`Remove ${playerName} and all of their scores? This can't be undone.`)
    ) {
      return;
    }
    update(removeProfile(state, id));
  };

  if (state.profiles.length === 0) {
    return (
      <div className="rounded-xl border border-line bg-paper-2 p-4">
        <p className="text-ink font-medium">Add players to start a scoreboard</p>
        <p className="text-ink-2 text-sm mt-1">
          Everyone on this device gets their own best score. Nothing is shared online.
        </p>
        <div className="mt-3 flex gap-2">
          <NameInput
            name={name}
            setName={setName}
            submitName={submitName}
            autoFocus
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
            onClick={() => switchPlayer(p.id)}
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
          <NameInput
            name={name}
            setName={setName}
            submitName={submitName}
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
                <span className="text-ink-2 tabular-nums mr-3">
                  #{r.rank} of {rows.length}
                </span>
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

      {champions.length > 0 && (
        <p className="text-ink-2 text-sm mt-3 border-t border-line pt-3">
          🏆 House champion{champions.length > 1 ? "s" : ""}:{" "}
          <span className="text-ink font-semibold">
            {joinNames(champions.map((c) => c.profile.name))}
          </span>{" "}
          — {champions[0].firsts} game{champions[0].firsts === 1 ? "" : "s"} in first place
          {champions.length > 1 ? " each" : ""}
        </p>
      )}

      <details className="mt-3">
        <summary className="text-ink-2 text-xs cursor-pointer">Manage players</summary>
        <div className="mt-2 flex flex-wrap gap-2">
          {state.profiles.map((p) => (
            <button
              key={p.id}
              onClick={() => removePlayer(p.id, p.name)}
              className="rounded-lg border border-line px-2 py-1 text-xs text-ink-2"
            >
              Remove {p.name}
            </button>
          ))}
        </div>
      </details>
    </div>
  );
}
