"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

const GAMES = [
  { slug: "space-invaders", name: "Space Invaders", category: "Arcade" },
  { slug: "car-racer", name: "Car Racer", category: "Arcade" },
  { slug: "dino-runner", name: "Dino Runner", category: "Arcade" },
  { slug: "flappy", name: "Flappy Bird", category: "Arcade" },
  { slug: "breakout", name: "Breakout", category: "Arcade" },
  { slug: "bubble-shooter", name: "Bubble Shooter", category: "Arcade" },
  { slug: "snake", name: "Snake", category: "Arcade" },
  { slug: "whack-a-mole", name: "Whack-a-Mole", category: "Arcade" },
  { slug: "tower-builder", name: "Tower Builder", category: "Arcade" },
  { slug: "maze", name: "Maze Runner", category: "Arcade" },
  { slug: "2048", name: "2048", category: "Puzzle" },
  { slug: "minesweeper", name: "Minesweeper", category: "Puzzle" },
  { slug: "memory", name: "Memory Match", category: "Puzzle" },
  { slug: "block-drop", name: "Block Drop", category: "Puzzle" },
  { slug: "sudoku", name: "Sudoku", category: "Puzzle" },
  { slug: "sliding-puzzle", name: "Sliding Puzzle", category: "Puzzle" },
  { slug: "tic-tac-toe", name: "Tic-Tac-Toe", category: "Strategy" },
  { slug: "connect4", name: "Connect 4", category: "Strategy" },
  { slug: "checkers", name: "Checkers", category: "Strategy" },
  { slug: "solitaire", name: "Solitaire", category: "Strategy" },
  { slug: "hangman", name: "Hangman", category: "Word" },
  { slug: "word-builder", name: "Word Builder", category: "Word" },
  { slug: "wordle", name: "Word Guess", category: "Word" },
  { slug: "crossword", name: "Crossword", category: "Word" },
  { slug: "typing-race", name: "Typing Race", category: "Word" },
  { slug: "word-search", name: "Word Search", category: "Word" },
  { slug: "music-trivia", name: "Music Trivia", category: "Word" },
  { slug: "soccer", name: "Penalty Kicks", category: "Sports" },
  { slug: "table-tennis", name: "Table Tennis", category: "Sports" },
  { slug: "simon", name: "Simon Says", category: "Puzzle" },
  { slug: "voxel", name: "Voxel Builder", category: "Creative" },
];

interface Votes {
  [slug: string]: number;
}

export default function GameShufflePage() {
  const [currentGame, setCurrentGame] = useState<typeof GAMES[0] | null>(null);
  const [votes, setVotes] = useState<Votes>({});
  const [history, setHistory] = useState<string[]>([]);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackType, setFeedbackType] = useState<"up" | "down" | null>(null);
  const [previousGame, setPreviousGame] = useState<string | null>(null);

  // Load votes and history from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedVotes = localStorage.getItem("gameshuffle-votes");
      const savedHistory = localStorage.getItem("gameshuffle-history");
      if (savedVotes) {
        setVotes(JSON.parse(savedVotes));
      }
      if (savedHistory) {
        setHistory(JSON.parse(savedHistory));
      }
    }
  }, []);

  // Save votes to localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("gameshuffle-votes", JSON.stringify(votes));
    }
  }, [votes]);

  // Save history to localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("gameshuffle-history", JSON.stringify(history));
    }
  }, [history]);

  const pickWeightedRandomGame = () => {
    // Calculate weights for all games
    const gameWeights = GAMES.map((game) => {
      const netScore = votes[game.slug] || 0;
      return Math.max(1, 5 + netScore);
    });

    // Filter out the previous game to avoid repeats
    const availableGames = GAMES.map((game, index) => ({
      game,
      weight: game.slug === previousGame ? 0 : gameWeights[index],
    }));

    const totalWeight = availableGames.reduce((sum, item) => sum + item.weight, 0);
    let random = Math.random() * totalWeight;

    for (const item of availableGames) {
      random -= item.weight;
      if (random <= 0) {
        return item.game;
      }
    }

    // Fallback (should never happen)
    return GAMES[0];
  };

  const handleShuffle = () => {
    const game = pickWeightedRandomGame();
    setCurrentGame(game);
    setPreviousGame(game.slug);
    setHistory([...history, game.slug]);

    // Track shuffle event
    if (typeof window !== "undefined" && window.gtag) {
      window.gtag("event", "game_shuffle", {
        game_name: game.slug,
        game_category: game.category,
      });
    }
  };

  const handleVote = (vote: "up" | "down") => {
    if (!currentGame) return;

    const newVotes = {
      ...votes,
      [currentGame.slug]: (votes[currentGame.slug] || 0) + (vote === "up" ? 1 : -1),
    };
    setVotes(newVotes);

    // Track vote event
    if (typeof window !== "undefined" && window.gtag) {
      window.gtag("event", "game_vote", {
        game_name: currentGame.slug,
        vote: vote,
        game_category: currentGame.category,
      });
    }

    // Show feedback and auto-advance
    setFeedbackType(vote);
    setShowFeedback(true);
    setTimeout(() => {
      setShowFeedback(false);
      setFeedbackType(null);
      handleShuffle();
    }, 1000);
  };

  const handleNext = () => {
    handleShuffle();
  };

  // Calculate stats
  const gamesPlayed = history.length;
  const totalVotes = Object.values(votes).reduce((sum, score) => sum + Math.abs(score), 0);
  const topFavorites = Object.entries(votes)
    .filter(([_, score]) => score > 0)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([slug]) => GAMES.find((g) => g.slug === slug))
    .filter(Boolean);

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">
      {/* Header */}
      <div className="border-b border-gray-800 bg-gray-950/90 backdrop-blur">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="font-black text-2xl">GameShuffle</h1>
            <p className="text-sm text-gray-400 mt-1">Discover your next favorite game</p>
          </div>
          <Link
            href="https://playmini.fun"
            className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
          >
            Back to PlayMini
          </Link>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-8">
        {!currentGame ? (
          // Landing state
          <div className="text-center">
            <button
              onClick={handleShuffle}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold text-xl px-12 py-6 rounded-xl shadow-lg transition-all transform hover:scale-105 flex items-center gap-3"
            >
              <svg
                className="w-8 h-8"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              Shuffle!
            </button>
          </div>
        ) : (
          // Game view
          <div className="w-full max-w-6xl">
            {/* Game info with animation */}
            <div className="text-center mb-4">
              <h2 className="text-3xl font-bold">{currentGame.name}</h2>
              <p className="text-gray-400 text-sm mt-1">{currentGame.category}</p>
            </div>

            {/* Game iframe */}
            <div className="relative w-full bg-gray-900 rounded-lg overflow-hidden shadow-2xl border border-gray-800">
              <iframe
                src={`https://playmini.fun/${currentGame.slug}`}
                className="w-full"
                style={{ height: "calc(100vh - 280px)", minHeight: "400px" }}
                title={currentGame.name}
              />
            </div>

            {/* Voting and navigation */}
            <div className="mt-6 flex items-center justify-center gap-4">
              {showFeedback ? (
                <div className="text-center">
                  <p className="text-xl font-semibold">
                    {feedbackType === "up" ? "Got it!" : "Got it!"}
                  </p>
                </div>
              ) : (
                <>
                  <button
                    onClick={() => handleVote("up")}
                    className="bg-green-600 hover:bg-green-700 text-white font-bold px-8 py-4 rounded-lg transition-all transform hover:scale-105 flex items-center gap-2"
                    title="Thumbs up"
                  >
                    <svg
                      className="w-6 h-6"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
                    </svg>
                    Thumbs Up
                  </button>

                  <button
                    onClick={handleNext}
                    className="bg-gray-700 hover:bg-gray-600 text-white font-bold px-8 py-4 rounded-lg transition-all transform hover:scale-105"
                  >
                    Next Game
                  </button>

                  <button
                    onClick={() => handleVote("down")}
                    className="bg-red-600 hover:bg-red-700 text-white font-bold px-8 py-4 rounded-lg transition-all transform hover:scale-105 flex items-center gap-2"
                    title="Thumbs down"
                  >
                    <svg
                      className="w-6 h-6"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M18 9.5a1.5 1.5 0 11-3 0v-6a1.5 1.5 0 013 0v6zM14 9.667v-5.43a2 2 0 00-1.105-1.79l-.05-.025A4 4 0 0011.055 2H5.64a2 2 0 00-1.962 1.608l-1.2 6A2 2 0 004.44 12H8v4a2 2 0 002 2 1 1 0 001-1v-.667a4 4 0 01.8-2.4l1.4-1.866a4 4 0 00.8-2.4z" />
                    </svg>
                    Thumbs Down
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Stats section */}
      {gamesPlayed > 0 && (
        <div className="border-t border-gray-800 bg-gray-900/50">
          <div className="max-w-6xl mx-auto px-4 py-8">
            <h3 className="text-xl font-bold mb-4">Your Stats</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="bg-gray-800 rounded-lg p-4 text-center">
                <p className="text-3xl font-bold text-blue-400">{gamesPlayed}</p>
                <p className="text-sm text-gray-400 mt-1">Games Played</p>
              </div>
              <div className="bg-gray-800 rounded-lg p-4 text-center">
                <p className="text-3xl font-bold text-purple-400">{totalVotes}</p>
                <p className="text-sm text-gray-400 mt-1">Total Votes</p>
              </div>
              <div className="bg-gray-800 rounded-lg p-4">
                <p className="text-sm text-gray-400 mb-2">Top Favorites:</p>
                {topFavorites.length > 0 ? (
                  <ul className="text-sm space-y-1">
                    {topFavorites.map((game, index) => (
                      <li key={game?.slug} className="text-green-400">
                        {index + 1}. {game?.name} (+{votes[game?.slug || ""]})
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-500">Vote to build your list!</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
