"use client";

import { useEffect, useRef, useState, useCallback } from "react";

type Color = "red" | "blue" | "green" | "yellow";

const COLORS: Color[] = ["red", "blue", "green", "yellow"];

const COLOR_MAP = {
  red: { bg: "bg-red-600", active: "bg-red-400", dark: "bg-red-900" },
  blue: { bg: "bg-blue-600", active: "bg-blue-400", dark: "bg-blue-900" },
  green: { bg: "bg-green-600", active: "bg-green-400", dark: "bg-green-900" },
  yellow: { bg: "bg-yellow-600", active: "bg-yellow-400", dark: "bg-yellow-900" },
};

export default function SimonSays() {
  const [gameState, setGameState] = useState<"start" | "playing" | "showing" | "gameover">("start");
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const [activeColor, setActiveColor] = useState<Color | null>(null);

  const sequenceRef = useRef<Color[]>([]);
  const userInputRef = useRef<Color[]>([]);
  const scoreRef = useRef(0);
  const bestScoreRef = useRef(0);
  const showingIndexRef = useRef(0);

  useEffect(() => {
    const saved = localStorage.getItem("pb-simon");
    if (saved) {
      const val = parseInt(saved, 10);
      setBestScore(val);
      bestScoreRef.current = val;
    }
  }, []);

  const playSequence = useCallback(async () => {
    setGameState("showing");
    showingIndexRef.current = 0;

    for (let i = 0; i < sequenceRef.current.length; i++) {
      await new Promise((resolve) => setTimeout(resolve, 600));
      setActiveColor(sequenceRef.current[i]);
      await new Promise((resolve) => setTimeout(resolve, 400));
      setActiveColor(null);
    }

    await new Promise((resolve) => setTimeout(resolve, 200));
    setGameState("playing");
  }, []);

  const addToSequence = useCallback(() => {
    const nextColor = COLORS[Math.floor(Math.random() * COLORS.length)];
    sequenceRef.current.push(nextColor);
    userInputRef.current = [];
  }, []);

  const startGame = useCallback(() => {
    sequenceRef.current = [];
    userInputRef.current = [];
    scoreRef.current = 0;
    setScore(0);
    addToSequence();
    playSequence();
  }, [addToSequence, playSequence]);

  const handleColorClick = useCallback(
    (color: Color) => {
      if (gameState !== "playing") return;

      setActiveColor(color);
      setTimeout(() => setActiveColor(null), 200);

      userInputRef.current.push(color);
      const currentIndex = userInputRef.current.length - 1;

      // Check if correct
      if (userInputRef.current[currentIndex] !== sequenceRef.current[currentIndex]) {
        setGameState("gameover");
        return;
      }

      // Check if sequence complete
      if (userInputRef.current.length === sequenceRef.current.length) {
        scoreRef.current = sequenceRef.current.length;
        setScore(scoreRef.current);

        if (scoreRef.current > bestScoreRef.current) {
          bestScoreRef.current = scoreRef.current;
          setBestScore(scoreRef.current);
          localStorage.setItem("pb-simon", scoreRef.current.toString());
        }

        setTimeout(() => {
          addToSequence();
          playSequence();
        }, 800);
      }
    },
    [gameState, addToSequence, playSequence]
  );

  const handleShare = async () => {
    const text = `I reached ${scoreRef.current} rounds in Simon Says! Can you beat me? https://playmini.fun/simon`;
    if (navigator.share) {
      try {
        await navigator.share({ text });
      } catch {}
    } else {
      try {
        await navigator.clipboard.writeText(text);
        alert("Copied!");
      } catch {}
    }
  };

  return (
    <div className="flex flex-col items-center gap-6 py-8">
      <div className="flex gap-8 text-center">
        <div>
          <div className="text-xs text-gray-500 uppercase tracking-wider">Round</div>
          <div className="text-3xl font-black text-blue-400 tabular-nums">{score}</div>
        </div>
        <div>
          <div className="text-xs text-gray-500 uppercase tracking-wider">Best</div>
          <div className="text-3xl font-black text-amber-400 tabular-nums">{bestScore}</div>
        </div>
      </div>

      {gameState === "start" && (
        <div className="text-center mb-6">
          <h2 className="text-3xl font-black text-blue-400 mb-4">Simon Says</h2>
          <p className="text-gray-400 mb-6">Watch the sequence, then repeat it!</p>
          <button
            onClick={startGame}
            className="px-10 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-2xl transition-all hover:scale-105 active:scale-95"
          >
            Play
          </button>
        </div>
      )}

      {gameState === "gameover" && (
        <div className="bg-red-900/30 border border-red-500 rounded-lg p-6 text-center max-w-md mb-6">
          <h2 className="text-2xl font-bold text-red-400 mb-2">Game Over</h2>
          <p className="text-gray-300 mb-4">
            You reached round {score}!
            {score >= bestScore && score > 0 && (
              <span className="block text-yellow-400 font-bold mt-1">New Best! 🏆</span>
            )}
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={startGame}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all hover:scale-105 active:scale-95"
            >
              Play Again
            </button>
            <button
              onClick={handleShare}
              className="px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl transition-all hover:scale-105 active:scale-95"
            >
              Share
            </button>
          </div>
        </div>
      )}

      {gameState === "showing" && (
        <div className="text-center text-yellow-400 font-bold text-lg mb-4">Watch...</div>
      )}

      {gameState === "playing" && (
        <div className="text-center text-green-400 font-bold text-lg mb-4">Your Turn!</div>
      )}

      <div className="grid grid-cols-2 gap-4 w-80 h-80">
        {COLORS.map((color) => {
          const isActive = activeColor === color;
          const colorStyle = COLOR_MAP[color];
          return (
            <button
              key={color}
              onClick={() => handleColorClick(color)}
              disabled={gameState !== "playing"}
              className={`rounded-2xl transition-all transform active:scale-95 ${
                isActive ? colorStyle.active : gameState === "playing" ? colorStyle.bg : colorStyle.dark
              } ${gameState === "playing" ? "hover:opacity-80" : "cursor-not-allowed"}`}
            />
          );
        })}
      </div>

      <div className="text-center text-xs text-gray-600 max-w-md mt-4">
        <p>Watch the color sequence, then click the colors in the same order.</p>
        <p className="mt-1">Each round adds one more color to the sequence!</p>
      </div>
    </div>
  );
}
