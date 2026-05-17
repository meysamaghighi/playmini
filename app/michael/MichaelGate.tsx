"use client";

import { useEffect, useState } from "react";

const PASSWORD = "mike";
const STORAGE_KEY = "michael_unlocked";

export default function MichaelGate({ children }: { children: React.ReactNode }) {
  const [unlocked, setUnlocked] = useState<boolean | null>(null);
  const [input, setInput] = useState("");
  const [shake, setShake] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    setUnlocked(sessionStorage.getItem(STORAGE_KEY) === "true");
  }, []);

  function attemptUnlock(e: React.FormEvent) {
    e.preventDefault();
    if (input === PASSWORD) {
      sessionStorage.setItem(STORAGE_KEY, "true");
      setUnlocked(true);
    } else {
      setError(true);
      setShake(true);
      setTimeout(() => setShake(false), 500);
    }
  }

  function lock() {
    sessionStorage.setItem(STORAGE_KEY, "false");
    setUnlocked(false);
    setInput("");
  }

  if (unlocked === null) {
    return <div className="min-h-screen bg-amber-50" />;
  }

  if (!unlocked) {
    return (
      <main
        className="min-h-screen flex items-center justify-center px-4"
        style={{
          background:
            "repeating-linear-gradient(0deg, #fef9e7, #fef9e7 24px, #f5edd0 24px, #f5edd0 25px)",
        }}
      >
        <div className="max-w-md w-full text-center">
          <h1
            className="text-5xl sm:text-6xl font-black mb-2 text-amber-900"
            style={{ fontFamily: "'Caveat', 'Comic Sans MS', cursive", transform: "rotate(-2deg)" }}
          >
            Michael&apos;s Games
          </h1>
          <p
            className="text-xl text-amber-700 mb-8"
            style={{ fontFamily: "'Caveat', 'Comic Sans MS', cursive" }}
          >
            Enter the secret password
          </p>
          <form onSubmit={attemptUnlock} className={shake ? "animate-shake" : ""}>
            <input
              type="password"
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                setError(false);
              }}
              placeholder="password..."
              className="w-full text-2xl text-center px-6 py-4 rounded-2xl border-4 border-amber-700 bg-white text-amber-900 placeholder-amber-300 focus:outline-none focus:border-amber-500"
              style={{ fontFamily: "'Caveat', 'Comic Sans MS', cursive" }}
              autoFocus
            />
            {error && (
              <p
                className="text-red-600 text-xl mt-3"
                style={{ fontFamily: "'Caveat', 'Comic Sans MS', cursive" }}
              >
                Try again!
              </p>
            )}
            <button
              type="submit"
              className="mt-6 px-10 py-4 text-2xl font-bold rounded-2xl bg-amber-600 hover:bg-amber-500 text-white border-4 border-amber-800 shadow-lg active:translate-y-1 transition-all"
              style={{ fontFamily: "'Caveat', 'Comic Sans MS', cursive" }}
            >
              Unlock
            </button>
          </form>
        </div>
        <style jsx>{`
          @keyframes shake {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-8px); }
            75% { transform: translateX(8px); }
          }
          .animate-shake {
            animation: shake 0.4s ease-in-out;
          }
        `}</style>
      </main>
    );
  }

  return (
    <>
      {children}
      <button
        onClick={lock}
        aria-label="Lock section"
        className="fixed bottom-4 right-4 z-50 w-12 h-12 rounded-full bg-amber-700 text-white shadow-lg hover:bg-amber-600 flex items-center justify-center text-2xl"
        title="Lock"
      >
        🔒
      </button>
    </>
  );
}
