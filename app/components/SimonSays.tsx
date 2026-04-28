"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type Pad = 0 | 1 | 2 | 3;
type Phase = "ready" | "showing" | "input" | "gameover";

const COLORS: Record<Pad, { base: string; active: string }> = {
  0: { base: "bg-green-700", active: "bg-green-300" },
  1: { base: "bg-red-700", active: "bg-red-300" },
  2: { base: "bg-yellow-600", active: "bg-yellow-300" },
  3: { base: "bg-blue-700", active: "bg-blue-300" },
};

const TONES: Record<Pad, number> = {
  0: 329.63,
  1: 261.63,
  2: 392.0,
  3: 196.0,
};

function playTone(freq: number, ms = 300) {
  try {
    const AudioCtx =
      (window as unknown as { AudioContext?: typeof AudioContext; webkitAudioContext?: typeof AudioContext }).AudioContext ||
      (window as unknown as { AudioContext?: typeof AudioContext; webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = freq;
    gain.gain.value = 0.15;
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    setTimeout(() => {
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
      osc.stop(ctx.currentTime + 0.06);
      ctx.close();
    }, ms);
  } catch {}
}

export default function SimonSays() {
  const [phase, setPhase] = useState<Phase>("ready");
  const [sequence, setSequence] = useState<Pad[]>([]);
  const [userIndex, setUserIndex] = useState(0);
  const [active, setActive] = useState<Pad | null>(null);
  const [best, setBest] = useState(0);
  const phaseRef = useRef<Phase>("ready");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("pb-simon-best");
      if (saved) setBest(parseInt(saved, 10) || 0);
    } catch {}
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const playSequence = useCallback((seq: Pad[]) => {
    phaseRef.current = "showing";
    setPhase("showing");
    const step = Math.max(350, 800 - seq.length * 30);
    let i = 0;
    const showOne = () => {
      if (i >= seq.length) {
        setActive(null);
        phaseRef.current = "input";
        setPhase("input");
        setUserIndex(0);
        return;
      }
      const pad = seq[i];
      setActive(pad);
      playTone(TONES[pad], step - 100);
      timerRef.current = setTimeout(() => {
        setActive(null);
        timerRef.current = setTimeout(() => {
          i++;
          showOne();
        }, 120);
      }, step - 100);
    };
    showOne();
  }, []);

  const start = useCallback(() => {
    const first = Math.floor(Math.random() * 4) as Pad;
    const seq = [first];
    setSequence(seq);
    timerRef.current = setTimeout(() => playSequence(seq), 600);
  }, [playSequence]);

  const handlePad = (pad: Pad) => {
    if (phaseRef.current !== "input") return;
    setActive(pad);
    playTone(TONES[pad], 200);
    setTimeout(() => setActive(null), 200);

    if (sequence[userIndex] !== pad) {
      phaseRef.current = "gameover";
      setPhase("gameover");
      const rounds = sequence.length - 1;
      if (rounds > best) {
        setBest(rounds);
        try {
          localStorage.setItem("pb-simon-best", String(rounds));
        } catch {}
      }
      return;
    }

    const nextIndex = userIndex + 1;
    if (nextIndex >= sequence.length) {
      // Round complete — extend and replay
      const newPad = Math.floor(Math.random() * 4) as Pad;
      const nextSeq = [...sequence, newPad];
      setSequence(nextSeq);
      setUserIndex(0);
      timerRef.current = setTimeout(() => playSequence(nextSeq), 600);
    } else {
      setUserIndex(nextIndex);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex items-center gap-6 text-ink text-lg">
        <div>
          Round: <span className="font-bold">{sequence.length}</span>
        </div>
        <div>
          Best: <span className="font-bold text-yellow-400">{best}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 bg-paper-2 p-2 rounded-full">
        {([0, 1, 2, 3] as Pad[]).map((p) => (
          <button
            key={p}
            onPointerDown={() => handlePad(p)}
            className={`w-32 h-32 md:w-40 md:h-40 transition-colors ${
              active === p ? COLORS[p].active : COLORS[p].base
            } ${
              p === 0
                ? "rounded-tl-full"
                : p === 1
                ? "rounded-tr-full"
                : p === 2
                ? "rounded-bl-full"
                : "rounded-br-full"
            }`}
            aria-label={`Pad ${p + 1}`}
          />
        ))}
      </div>

      {phase === "ready" && (
        <button
          onClick={start}
          className="px-6 py-3 bg-indigo-600 text-ink font-bold rounded-lg hover:bg-indigo-700 text-lg"
        >
          Start
        </button>
      )}

      {phase === "gameover" && (
        <div className="bg-paper-2 text-ink px-6 py-4 rounded-lg text-center">
          <div className="text-2xl font-bold mb-2">Game Over</div>
          <div className="mb-3">
            Rounds: <span className="font-bold">{Math.max(0, sequence.length - 1)}</span>
          </div>
          <button
            onClick={() => {
              setSequence([]);
              setUserIndex(0);
              phaseRef.current = "ready";
              setPhase("ready");
            }}
            className="px-6 py-2 bg-indigo-600 text-ink font-bold rounded-lg hover:bg-indigo-700"
          >
            Play Again
          </button>
        </div>
      )}

      <p className="text-sm text-ink-2 text-center max-w-md">
        Watch the pattern, then tap the pads in the same order. Each round adds one more step.
      </p>
    </div>
  );
}
