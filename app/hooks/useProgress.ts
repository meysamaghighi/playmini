"use client";

import { useCallback, useEffect, useState } from "react";

export type ProgressMode = "higher" | "lower";

export type ProgressEntry = {
  best: number;
  plays: number;
  lastScore: number;
  mode: ProgressMode;
};

export type ProgressV1 = {
  v: 1;
  lastPlayed: string | null;
  streak: { count: number; lastDate: string | null };
  history: Record<string, ProgressEntry>;
};

const SITE_ID = "playmini";
const STORAGE_KEY = `${SITE_ID}_progress`;

const EMPTY: ProgressV1 = {
  v: 1,
  lastPlayed: null,
  streak: { count: 0, lastDate: null },
  history: {},
};

function load(): ProgressV1 {
  if (typeof window === "undefined") return EMPTY;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY;
    const parsed = JSON.parse(raw);
    if (parsed?.v === 1) return { ...EMPTY, ...parsed };
  } catch {}
  return EMPTY;
}

function save(state: ProgressV1) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {}
}

/**
 * Read legacy `pb-${gameId}-best` or `pb-${gameId}` keys (28 distinct keys
 * scattered across 23 game components). Used as a one-time seed when a game
 * is first played through useProgress; original keys are left intact for
 * rollback safety.
 */
function readLegacyBest(gameId: string): number | null {
  if (typeof window === "undefined") return null;
  try {
    const candidates = [`pb-${gameId}-best`, `pb-${gameId}`];
    for (const key of candidates) {
      const v = localStorage.getItem(key);
      if (v === null) continue;
      const n = parseFloat(v);
      if (Number.isFinite(n)) return n;
    }
  } catch {}
  return null;
}

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

function daysApart(a: string, b: string): number {
  return Math.round(
    (new Date(a).getTime() - new Date(b).getTime()) / 86_400_000
  );
}

export function useProgress() {
  const [state, setState] = useState<ProgressV1>(EMPTY);

  useEffect(() => {
    setState(load());
  }, []);

  const recordPlay = useCallback(
    (gameId: string, score: number, mode: ProgressMode) => {
      let isNewBest = false;
      setState(prev => {
        const existing = prev.history[gameId];
        const currentBest = existing ? existing.best : readLegacyBest(gameId);
        const isBetter =
          currentBest === null ||
          (mode === "higher" ? score > currentBest : score < currentBest);
        isNewBest = isBetter;
        const next: ProgressV1 = {
          ...prev,
          lastPlayed: todayISO(),
          history: {
            ...prev.history,
            [gameId]: {
              best: isBetter ? score : (currentBest as number),
              plays: (existing?.plays ?? 0) + 1,
              lastScore: score,
              mode,
            },
          },
        };
        save(next);
        return next;
      });
      return { isNewBest };
    },
    []
  );

  const bumpStreak = useCallback(() => {
    setState(prev => {
      const today = todayISO();
      const last = prev.streak.lastDate;
      if (last === today) return prev;
      const count =
        last && daysApart(today, last) === 1 ? prev.streak.count + 1 : 1;
      const next: ProgressV1 = {
        ...prev,
        streak: { count, lastDate: today },
      };
      save(next);
      return next;
    });
  }, []);

  const reset = useCallback(() => {
    setState(EMPTY);
    save(EMPTY);
  }, []);

  return { state, recordPlay, bumpStreak, reset };
}
