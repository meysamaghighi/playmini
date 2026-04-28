"use client";

import { useState, useEffect, useRef, useCallback } from "react";

const HOLES = 9;
const ROUND_SECONDS = 30;
const POP_MS_MIN = 600;
const POP_MS_MAX = 1100;
const SPAWN_MS_MIN = 500;
const SPAWN_MS_MAX = 900;

type GameState = "ready" | "playing" | "gameover";

export default function WhackMole() {
  const [gameState, setGameState] = useState<GameState>("ready");
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);
  const [time, setTime] = useState(ROUND_SECONDS);
  const [activeHole, setActiveHole] = useState<number | null>(null);
  const [hitFlash, setHitFlash] = useState<number | null>(null);

  const stateRef = useRef<GameState>("ready");
  const scoreRef = useRef(0);
  const popTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tickTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const flashTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("pb-whackmole-best");
      if (saved) setBest(parseInt(saved, 10) || 0);
    } catch {}
  }, []);

  const stopAll = useCallback(() => {
    if (popTimerRef.current) clearTimeout(popTimerRef.current);
    if (tickTimerRef.current) clearInterval(tickTimerRef.current);
    if (flashTimerRef.current) clearTimeout(flashTimerRef.current);
    popTimerRef.current = null;
    tickTimerRef.current = null;
    flashTimerRef.current = null;
  }, []);

  const scheduleSpawn = useCallback(() => {
    const spawnDelay = SPAWN_MS_MIN + Math.random() * (SPAWN_MS_MAX - SPAWN_MS_MIN);
    popTimerRef.current = setTimeout(() => {
      if (stateRef.current !== "playing") return;
      const hole = Math.floor(Math.random() * HOLES);
      setActiveHole(hole);
      const popDur = POP_MS_MIN + Math.random() * (POP_MS_MAX - POP_MS_MIN);
      popTimerRef.current = setTimeout(() => {
        setActiveHole(null);
        if (stateRef.current === "playing") scheduleSpawn();
      }, popDur);
    }, spawnDelay);
  }, []);

  const start = useCallback(() => {
    stopAll();
    scoreRef.current = 0;
    setScore(0);
    setTime(ROUND_SECONDS);
    setActiveHole(null);
    setHitFlash(null);
    stateRef.current = "playing";
    setGameState("playing");

    tickTimerRef.current = setInterval(() => {
      setTime((t) => {
        if (t <= 1) {
          stopAll();
          stateRef.current = "gameover";
          setGameState("gameover");
          setActiveHole(null);
          setBest((prev) => {
            const next = Math.max(prev, scoreRef.current);
            try {
              localStorage.setItem("pb-whackmole-best", String(next));
            } catch {}
            return next;
          });
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    scheduleSpawn();
  }, [scheduleSpawn, stopAll]);

  useEffect(() => {
    return () => stopAll();
  }, [stopAll]);

  const onHit = (i: number) => {
    if (stateRef.current !== "playing" || activeHole !== i) return;
    scoreRef.current += 1;
    setScore(scoreRef.current);
    setHitFlash(i);
    setActiveHole(null);
    if (popTimerRef.current) clearTimeout(popTimerRef.current);
    if (flashTimerRef.current) clearTimeout(flashTimerRef.current);
    flashTimerRef.current = setTimeout(() => setHitFlash(null), 150);
    scheduleSpawn();
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex items-center gap-6 text-ink text-lg bg-paper-2 px-4 py-2 rounded">
        <div>
          Score: <span className="font-bold">{score}</span>
        </div>
        <div>
          Time: <span className="font-bold text-yellow-400">{time}</span>
        </div>
        <div>
          Best: <span className="font-bold text-emerald-400">{best}</span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 bg-green-700 p-4 rounded-lg">
        {Array.from({ length: HOLES }, (_, i) => {
          const showMole = activeHole === i;
          const flash = hitFlash === i;
          return (
            <button
              key={i}
              onPointerDown={() => onHit(i)}
              className="relative w-20 h-20 md:w-24 md:h-24 bg-green-900 rounded-full overflow-hidden touch-manipulation select-none"
              aria-label={`Hole ${i + 1}`}
            >
              <div className="absolute inset-x-2 bottom-0 h-3 bg-yellow-900 rounded-b-full" />
              <div
                className={`absolute inset-x-3 transition-all duration-150 ease-out ${
                  showMole ? "bottom-2" : "-bottom-20"
                }`}
              >
                <div className="w-full h-14 bg-amber-700 rounded-full flex items-center justify-center text-2xl">
                  🐹
                </div>
              </div>
              {flash && (
                <div className="absolute inset-0 bg-yellow-300/70 rounded-full pointer-events-none" />
              )}
            </button>
          );
        })}
      </div>

      {gameState !== "playing" && (
        <div className="bg-paper-2 text-ink px-6 py-4 rounded-lg text-center">
          {gameState === "ready" ? (
            <div className="text-2xl font-bold mb-3">Whack-a-Mole</div>
          ) : (
            <>
              <div className="text-2xl font-bold mb-2">Time's up!</div>
              <div className="mb-1">Score: {score}</div>
              <div className="mb-3">
                Best: <span className="text-emerald-400 font-bold">{best}</span>
              </div>
            </>
          )}
          <button
            onClick={start}
            className="px-6 py-2 bg-emerald-600 text-ink font-bold rounded-lg hover:bg-emerald-700"
          >
            {gameState === "ready" ? "Start" : "Play Again"}
          </button>
        </div>
      )}

      <p className="text-sm text-ink-2 text-center max-w-md">
        Tap or click moles when they pop up. {ROUND_SECONDS} seconds — how many can you whack?
      </p>
    </div>
  );
}
