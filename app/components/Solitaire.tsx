"use client";

import { useEffect, useState, useCallback } from "react";

type Suit = "♠" | "♥" | "♦" | "♣";
type Rank = "A" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "10" | "J" | "Q" | "K";
type Card = { suit: Suit; rank: Rank; faceUp: boolean };
type Pile = Card[];
type GameMode = "menu" | "campaign" | "endless" | "freeplay";
type GameState = "playing" | "won" | "lost" | "paused";

const SUITS: Suit[] = ["♠", "♥", "♦", "♣"];
const RANKS: Rank[] = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];

type Level = {
  id: number;
  name: string;
  description: string;
  parTime?: number; // seconds
  parMoves?: number;
  maxRedeals?: number; // undefined = unlimited
  drawCount: 1 | 3;
  tutorial?: boolean;
};

const LEVELS: Level[] = [
  { id: 1, name: "Tutorial", description: "Easy pre-arranged layout", parTime: 600, drawCount: 1, tutorial: true },
  { id: 2, name: "Classic Start", description: "Complete a standard game", drawCount: 1 },
  { id: 3, name: "Quick Hands", description: "Finish in under 5 minutes", parTime: 300, drawCount: 1 },
  { id: 4, name: "Minimum Moves", description: "Complete in under 100 moves", parMoves: 100, drawCount: 1 },
  { id: 5, name: "Three-Card Draw", description: "Draw 3 cards at once", drawCount: 3 },
  { id: 6, name: "Speed Challenge", description: "Finish in 3 minutes", parTime: 180, drawCount: 1 },
  { id: 7, name: "Limited Redeals", description: "Only 3 redeals allowed", maxRedeals: 3, drawCount: 1 },
  { id: 8, name: "Efficiency", description: "Under 70 moves + 5 minutes", parMoves: 70, parTime: 300, drawCount: 1 },
  { id: 9, name: "One Redeal", description: "Only 1 redeal allowed", maxRedeals: 1, drawCount: 1 },
  { id: 10, name: "No Redeals", description: "No redeals + 5 minute limit", maxRedeals: 0, parTime: 300, drawCount: 1 },
];

type MoveHistory = {
  tableau: Pile[];
  foundations: Pile[];
  waste: Pile;
  stock: Pile;
  redeals: number;
};

export default function Solitaire() {
  const [mode, setMode] = useState<GameMode>("menu");
  const [gameState, setGameState] = useState<GameState>("playing");
  const [currentLevel, setCurrentLevel] = useState<Level | null>(null);
  const [tableau, setTableau] = useState<Pile[]>([]);
  const [foundations, setFoundations] = useState<Pile[]>([[], [], [], []]);
  const [stock, setStock] = useState<Pile>([]);
  const [waste, setWaste] = useState<Pile>([]);
  const [selectedCard, setSelectedCard] = useState<{ pile: string; index: number } | null>(null);
  const [moves, setMoves] = useState(0);
  const [time, setTime] = useState(0);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [redeals, setRedeals] = useState(0);
  const [moveHistory, setMoveHistory] = useState<MoveHistory[]>([]);
  const [undosLeft, setUndosLeft] = useState(2);
  const [hintsLeft, setHintsLeft] = useState(2);
  const [autoCompleteLeft, setAutoCompleteLeft] = useState(1);
  const [hintMove, setHintMove] = useState<{ from: string; to: string } | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);
  const [endlessStreak, setEndlessStreak] = useState(0);

  // Load progress
  const [levelStars, setLevelStars] = useState<Record<number, number>>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("pb-solitaire-campaign");
      return saved ? JSON.parse(saved) : {};
    }
    return {};
  });

  const [bestScore, setBestScore] = useState<number>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("pb-solitaire-best");
      return saved ? parseInt(saved) : 0;
    }
    return 0;
  });

  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (gameState === "playing") {
      timer = setInterval(() => {
        setTime((prev) => {
          const newTime = prev + 1;
          // Check time limit
          if (currentLevel?.parTime && newTime >= currentLevel.parTime) {
            if (mode === "campaign") {
              setLives((l) => l - 1);
              setGameState(lives <= 1 ? "lost" : "paused");
              return prev;
            }
          }
          return newTime;
        });
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [gameState, currentLevel, mode, lives]);

  const createDeck = useCallback((): Card[] => {
    const deck: Card[] = [];
    for (const suit of SUITS) {
      for (const rank of RANKS) {
        deck.push({ suit, rank, faceUp: false });
      }
    }
    return deck;
  }, []);

  const shuffleDeck = useCallback((deck: Card[]): Card[] => {
    const shuffled = [...deck];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }, []);

  const createTutorialDeck = useCallback((): Card[] => {
    // Pre-arranged easy deck for tutorial
    const easyDeck: Card[] = [
      // Tableau setup - already in ascending/descending order
      { suit: "♠", rank: "7", faceUp: false },
      { suit: "♥", rank: "6", faceUp: false },
      { suit: "♠", rank: "5", faceUp: false },
      { suit: "♥", rank: "4", faceUp: false },
      { suit: "♠", rank: "3", faceUp: false },
      { suit: "♥", rank: "2", faceUp: false },
      { suit: "♠", rank: "A", faceUp: true },

      { suit: "♥", rank: "7", faceUp: false },
      { suit: "♠", rank: "6", faceUp: false },
      { suit: "♥", rank: "5", faceUp: false },
      { suit: "♠", rank: "4", faceUp: false },
      { suit: "♥", rank: "3", faceUp: false },
      { suit: "♠", rank: "2", faceUp: true },

      { suit: "♦", rank: "7", faceUp: false },
      { suit: "♣", rank: "6", faceUp: false },
      { suit: "♦", rank: "5", faceUp: false },
      { suit: "♣", rank: "4", faceUp: false },
      { suit: "♦", rank: "3", faceUp: true },

      { suit: "♣", rank: "7", faceUp: false },
      { suit: "♦", rank: "6", faceUp: false },
      { suit: "♣", rank: "5", faceUp: false },
      { suit: "♦", rank: "4", faceUp: true },

      { suit: "♦", rank: "2", faceUp: false },
      { suit: "♣", rank: "3", faceUp: false },
      { suit: "♦", rank: "A", faceUp: true },

      { suit: "♥", rank: "A", faceUp: false },
      { suit: "♣", rank: "2", faceUp: true },

      { suit: "♣", rank: "A", faceUp: true },
    ];

    // Fill remaining cards
    const remaining: Card[] = [];
    for (const suit of SUITS) {
      for (const rank of RANKS) {
        const value = rankValue(rank as Rank);
        if (value >= 8 && value <= 13) {
          remaining.push({ suit, rank, faceUp: false });
        }
      }
    }

    return [...easyDeck, ...shuffleDeck(remaining)];
  }, [shuffleDeck]);

  const startGame = useCallback((level?: Level) => {
    const isEndless = mode === "endless";
    const isTutorial = level?.tutorial;
    const deck = isTutorial ? createTutorialDeck() : shuffleDeck(createDeck());
    const newTableau: Pile[] = [[], [], [], [], [], [], []];

    let deckIndex = 0;
    for (let i = 0; i < 7; i++) {
      for (let j = i; j < 7; j++) {
        const card = deck[deckIndex++];
        if (i === j) card.faceUp = true;
        newTableau[j].push(card);
      }
    }

    setTableau(newTableau);
    setFoundations([[], [], [], []]);
    setStock(deck.slice(deckIndex).map((c) => ({ ...c, faceUp: false })));
    setWaste([]);
    setSelectedCard(null);
    setMoves(0);
    setTime(0);
    setScore(0);
    setRedeals(0);
    setMoveHistory([]);
    setHintMove(null);

    if (level) {
      setCurrentLevel(level);
      setUndosLeft(level.tutorial ? 999 : 2);
      setHintsLeft(2);
      setAutoCompleteLeft(1);
    }

    if (mode === "campaign" && !lives) {
      setLives(3);
    }

    setGameState("playing");
  }, [createDeck, shuffleDeck, createTutorialDeck, mode, lives]);

  const rankValue = (rank: Rank): number => {
    return RANKS.indexOf(rank) + 1;
  };

  const isRed = (suit: Suit): boolean => suit === "♥" || suit === "♦";

  const canPlaceOnTableau = (card: Card, targetPile: Pile): boolean => {
    if (targetPile.length === 0) return rankValue(card.rank) === 13;
    const topCard = targetPile[targetPile.length - 1];
    return (
      rankValue(card.rank) === rankValue(topCard.rank) - 1 &&
      isRed(card.suit) !== isRed(topCard.suit)
    );
  };

  const canPlaceOnFoundation = (card: Card, foundationPile: Pile): boolean => {
    if (foundationPile.length === 0) return rankValue(card.rank) === 1;
    const topCard = foundationPile[foundationPile.length - 1];
    return (
      card.suit === topCard.suit && rankValue(card.rank) === rankValue(topCard.rank) + 1
    );
  };

  const saveHistory = useCallback(() => {
    setMoveHistory((prev) => [
      ...prev,
      {
        tableau: tableau.map((p) => [...p]),
        foundations: foundations.map((f) => [...f]),
        waste: [...waste],
        stock: [...stock],
        redeals,
      },
    ]);
  }, [tableau, foundations, waste, stock, redeals]);

  const handleStockClick = useCallback(() => {
    if (gameState !== "playing") return;

    const drawCount = currentLevel?.drawCount || 1;

    if (stock.length === 0) {
      // Redeal check
      if (currentLevel?.maxRedeals !== undefined && redeals >= currentLevel.maxRedeals) {
        return; // No more redeals allowed
      }
      saveHistory();
      setStock(waste.map((c) => ({ ...c, faceUp: false })).reverse());
      setWaste([]);
      setRedeals((r) => r + 1);
    } else {
      saveHistory();
      const toDraw = Math.min(drawCount, stock.length);
      const drawnCards = stock.slice(-toDraw);
      setStock(stock.slice(0, -toDraw));
      setWaste([...waste, ...drawnCards.map((c) => ({ ...c, faceUp: true }))]);
    }
    setMoves((m) => m + 1);
  }, [gameState, stock, waste, currentLevel, redeals, saveHistory]);

  const handleCardClick = useCallback(
    (pile: string, index: number) => {
      if (gameState !== "playing") return;

      if (selectedCard) {
        // Try to place selected card
        let newTableau = [...tableau];
        let newFoundations = [...foundations];
        let newWaste = [...waste];
        let placed = false;

        const sourceIsWaste = selectedCard.pile === "waste";
        const sourceIsTableau = selectedCard.pile.startsWith("tableau");
        const sourceIsFoundation = selectedCard.pile.startsWith("foundation");

        let cards: Card[] = [];
        if (sourceIsWaste) {
          cards = [waste[waste.length - 1]];
        } else if (sourceIsTableau) {
          const tableauIndex = parseInt(selectedCard.pile.split("-")[1]);
          cards = newTableau[tableauIndex].slice(selectedCard.index);
        } else if (sourceIsFoundation) {
          const foundationIndex = parseInt(selectedCard.pile.split("-")[1]);
          cards = [newFoundations[foundationIndex][newFoundations[foundationIndex].length - 1]];
        }

        const targetIsTableau = pile.startsWith("tableau");
        const targetIsFoundation = pile.startsWith("foundation");

        if (targetIsTableau && cards.length > 0) {
          const tableauIndex = parseInt(pile.split("-")[1]);
          if (canPlaceOnTableau(cards[0], newTableau[tableauIndex])) {
            saveHistory();
            newTableau[tableauIndex] = [...newTableau[tableauIndex], ...cards];

            if (sourceIsWaste) {
              newWaste = newWaste.slice(0, -1);
            } else if (sourceIsTableau) {
              const sourceTableauIndex = parseInt(selectedCard.pile.split("-")[1]);
              newTableau[sourceTableauIndex] = newTableau[sourceTableauIndex].slice(
                0,
                selectedCard.index
              );
              if (
                newTableau[sourceTableauIndex].length > 0 &&
                !newTableau[sourceTableauIndex][newTableau[sourceTableauIndex].length - 1].faceUp
              ) {
                newTableau[sourceTableauIndex][newTableau[sourceTableauIndex].length - 1].faceUp =
                  true;
              }
            } else if (sourceIsFoundation) {
              const sourceFoundationIndex = parseInt(selectedCard.pile.split("-")[1]);
              newFoundations[sourceFoundationIndex] = newFoundations[sourceFoundationIndex].slice(
                0,
                -1
              );
            }
            placed = true;
          }
        } else if (targetIsFoundation && cards.length === 1) {
          const foundationIndex = parseInt(pile.split("-")[1]);
          if (canPlaceOnFoundation(cards[0], newFoundations[foundationIndex])) {
            saveHistory();
            newFoundations[foundationIndex] = [...newFoundations[foundationIndex], cards[0]];

            if (sourceIsWaste) {
              newWaste = newWaste.slice(0, -1);
            } else if (sourceIsTableau) {
              const sourceTableauIndex = parseInt(selectedCard.pile.split("-")[1]);
              newTableau[sourceTableauIndex] = newTableau[sourceTableauIndex].slice(0, -1);
              if (
                newTableau[sourceTableauIndex].length > 0 &&
                !newTableau[sourceTableauIndex][newTableau[sourceTableauIndex].length - 1].faceUp
              ) {
                newTableau[sourceTableauIndex][newTableau[sourceTableauIndex].length - 1].faceUp =
                  true;
              }
            }
            placed = true;
            // Score for foundation placement
            setScore((s) => s + 10);
          }
        }

        if (placed) {
          setTableau(newTableau);
          setFoundations(newFoundations);
          setWaste(newWaste);
          setMoves((m) => m + 1);

          // Check win
          if (newFoundations.every((f) => f.length === 13)) {
            handleWin(newFoundations);
          }
        }
        setSelectedCard(null);
      } else {
        // Select card
        setSelectedCard({ pile, index });
      }
    },
    [gameState, selectedCard, tableau, foundations, waste, saveHistory]
  );

  const handleWin = useCallback((finalFoundations: Pile[]) => {
    setGameState("won");

    let finalScore = score;

    // Time bonus
    if (currentLevel?.parTime) {
      const timeBonus = Math.max(0, (currentLevel.parTime - time) * 5);
      finalScore += timeBonus;
    }

    // Move efficiency bonus
    if (currentLevel?.parMoves) {
      const moveBonus = Math.max(0, (currentLevel.parMoves - moves) * 10);
      finalScore += moveBonus;
    }

    // Completion bonus
    finalScore += 500;

    // Endless streak bonus
    if (mode === "endless") {
      const streakBonus = endlessStreak * 100;
      finalScore += streakBonus;
      setEndlessStreak((s) => s + 1);
    }

    setScore(finalScore);

    // Calculate stars for campaign
    if (mode === "campaign" && currentLevel) {
      let stars = 1;
      if (currentLevel.parMoves && moves <= currentLevel.parMoves) stars++;
      if (currentLevel.parTime && time <= currentLevel.parTime) stars++;
      if (!currentLevel.parMoves && !currentLevel.parTime) stars = 3; // Levels without pars get 3 stars for completion

      const newStars = { ...levelStars, [currentLevel.id]: Math.max(stars, levelStars[currentLevel.id] || 0) };
      setLevelStars(newStars);
      localStorage.setItem("pb-solitaire-campaign", JSON.stringify(newStars));
    }

    // Check personal best
    if (finalScore > bestScore) {
      setBestScore(finalScore);
      localStorage.setItem("pb-solitaire-best", finalScore.toString());
      setShowCelebration(true);
      setTimeout(() => setShowCelebration(false), 3000);
    }
  }, [score, time, moves, currentLevel, mode, endlessStreak, levelStars, bestScore]);

  const handleUndo = useCallback(() => {
    if (undosLeft <= 0 || moveHistory.length === 0) return;

    const lastState = moveHistory[moveHistory.length - 1];
    setTableau(lastState.tableau.map((p) => [...p]));
    setFoundations(lastState.foundations.map((f) => [...f]));
    setWaste([...lastState.waste]);
    setStock([...lastState.stock]);
    setRedeals(lastState.redeals);
    setMoveHistory((prev) => prev.slice(0, -1));
    setUndosLeft((u) => u - 1);
    setSelectedCard(null);
  }, [undosLeft, moveHistory]);

  const findBestMove = useCallback((): { from: string; to: string } | null => {
    // Priority 1: Move Aces to foundation
    for (let i = 0; i < tableau.length; i++) {
      const pile = tableau[i];
      if (pile.length > 0) {
        const topCard = pile[pile.length - 1];
        if (topCard.faceUp && topCard.rank === "A") {
          return { from: `tableau-${i}`, to: `foundation-${SUITS.indexOf(topCard.suit)}` };
        }
      }
    }
    if (waste.length > 0) {
      const topCard = waste[waste.length - 1];
      if (topCard.rank === "A") {
        return { from: "waste", to: `foundation-${SUITS.indexOf(topCard.suit)}` };
      }
    }

    // Priority 2: Move to foundation if possible
    for (let i = 0; i < tableau.length; i++) {
      const pile = tableau[i];
      if (pile.length > 0) {
        const topCard = pile[pile.length - 1];
        if (topCard.faceUp) {
          for (let f = 0; f < foundations.length; f++) {
            if (canPlaceOnFoundation(topCard, foundations[f])) {
              return { from: `tableau-${i}`, to: `foundation-${f}` };
            }
          }
        }
      }
    }

    // Priority 3: Reveal face-down cards
    for (let i = 0; i < tableau.length; i++) {
      const pile = tableau[i];
      if (pile.length > 1) {
        const topCard = pile[pile.length - 1];
        if (topCard.faceUp) {
          for (let j = 0; j < tableau.length; j++) {
            if (i !== j && canPlaceOnTableau(topCard, tableau[j])) {
              return { from: `tableau-${i}`, to: `tableau-${j}` };
            }
          }
        }
      }
    }

    return null;
  }, [tableau, waste, foundations]);

  const handleHint = useCallback(() => {
    if (hintsLeft <= 0) return;

    const move = findBestMove();
    if (move) {
      setHintMove(move);
      setHintsLeft((h) => h - 1);
      setTimeout(() => setHintMove(null), 3000);
    }
  }, [hintsLeft, findBestMove]);

  const handleAutoComplete = useCallback(() => {
    if (autoCompleteLeft <= 0) return;

    // Check if all cards are face-up
    const allFaceUp = tableau.every((pile) => pile.every((card) => card.faceUp));
    if (!allFaceUp) return;

    // Auto-move all possible cards to foundations
    let newTableau = tableau.map((p) => [...p]);
    let newFoundations = foundations.map((f) => [...f]);
    let newWaste = [...waste];
    let moved = true;

    while (moved) {
      moved = false;

      // Check tableau
      for (let i = 0; i < newTableau.length; i++) {
        const pile = newTableau[i];
        if (pile.length > 0) {
          const topCard = pile[pile.length - 1];
          for (let f = 0; f < newFoundations.length; f++) {
            if (canPlaceOnFoundation(topCard, newFoundations[f])) {
              newFoundations[f] = [...newFoundations[f], topCard];
              newTableau[i] = pile.slice(0, -1);
              moved = true;
              break;
            }
          }
        }
        if (moved) break;
      }

      if (!moved && newWaste.length > 0) {
        const topCard = newWaste[newWaste.length - 1];
        for (let f = 0; f < newFoundations.length; f++) {
          if (canPlaceOnFoundation(topCard, newFoundations[f])) {
            newFoundations[f] = [...newFoundations[f], topCard];
            newWaste = newWaste.slice(0, -1);
            moved = true;
            break;
          }
        }
      }
    }

    setTableau(newTableau);
    setFoundations(newFoundations);
    setWaste(newWaste);
    setAutoCompleteLeft(0);

    // Check win
    if (newFoundations.every((f) => f.length === 13)) {
      handleWin(newFoundations);
    }
  }, [autoCompleteLeft, tableau, foundations, waste, handleWin]);

  const handleGiveUp = useCallback(() => {
    if (mode === "campaign") {
      setLives((l) => l - 1);
      if (lives <= 1) {
        setGameState("lost");
      } else {
        setMode("menu");
      }
    } else {
      setMode("menu");
    }
  }, [mode, lives]);

  const renderCard = (card: Card | undefined, pile: string, index: number, selectable: boolean) => {
    if (!card) {
      // Empty pile
      const isFoundation = pile.startsWith("foundation");
      const foundationIndex = isFoundation ? parseInt(pile.split("-")[1]) : -1;
      const foundationSuit = foundationIndex >= 0 ? SUITS[foundationIndex] : null;

      return (
        <div
          key={`${pile}-${index}`}
          onClick={() => selectable && handleCardClick(pile, index)}
          className={`w-14 h-20 sm:w-16 sm:h-24 border-2 border-dashed rounded-lg flex items-center justify-center transition-all ${
            hintMove?.to === pile ? "border-yellow-400 bg-yellow-400/20 ring-2 ring-yellow-400" : "border-gray-700"
          } ${
            selectable ? "cursor-pointer hover:border-gray-600" : ""
          }`}
        >
          {foundationSuit && (
            <div className="text-4xl text-gray-800 opacity-30">
              {foundationSuit}
            </div>
          )}
        </div>
      );
    }

    const isSelected = selectedCard?.pile === pile && selectedCard?.index === index;
    const cardIsRed = card.suit === "♥" || card.suit === "♦";
    const isHinted = hintMove?.from === pile || hintMove?.to === pile;

    return (
      <div
        key={`${pile}-${index}`}
        onClick={() => selectable && card.faceUp && handleCardClick(pile, index)}
        className={`w-14 h-20 sm:w-16 sm:h-24 border-2 rounded-lg flex flex-col items-center justify-center font-bold transition-all ${
          card.faceUp
            ? cardIsRed
              ? "bg-gradient-to-br from-white to-gray-50 text-red-600 border-gray-300"
              : "bg-gradient-to-br from-white to-gray-50 text-gray-900 border-gray-300"
            : "bg-gradient-to-br from-blue-900 to-blue-950 border-blue-800"
        } ${
          selectable && card.faceUp
            ? "cursor-pointer hover:scale-105 hover:shadow-lg"
            : card.faceUp
            ? ""
            : "cursor-default"
        } ${isSelected ? "ring-4 ring-yellow-400 scale-105 z-10" : ""} ${
          isHinted ? "ring-4 ring-yellow-400 animate-pulse" : ""
        }`}
        style={{ transformStyle: "preserve-3d" }}
      >
        {card.faceUp ? (
          <>
            <div className="text-xs sm:text-sm">{card.rank}</div>
            <div className="text-xl sm:text-2xl">{card.suit}</div>
          </>
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-blue-900 to-blue-950 rounded-lg" />
        )}
      </div>
    );
  };

  if (mode === "menu") {
    return (
      <div className="flex flex-col items-center gap-6 py-8 max-w-4xl mx-auto px-4">
        <div className="text-center mb-6">
          <h2 className="text-4xl sm:text-5xl font-black text-blue-400 mb-4">Solitaire</h2>
          <p className="text-gray-400 mb-2">Classic Klondike Solitaire</p>
          {bestScore > 0 && (
            <p className="text-sm text-purple-400">Best Score: {bestScore}</p>
          )}
        </div>

        <div className="grid gap-4 w-full max-w-md">
          <button
            onClick={() => setMode("campaign")}
            className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold rounded-2xl transition-all hover:scale-105 active:scale-95 text-lg"
          >
            Campaign Mode
          </button>
          <button
            onClick={() => {
              setMode("endless");
              setEndlessStreak(0);
              startGame();
            }}
            className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold rounded-2xl transition-all hover:scale-105 active:scale-95 text-lg"
          >
            Endless Mode
          </button>
          <button
            onClick={() => {
              setMode("freeplay");
              startGame();
            }}
            className="px-8 py-4 bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700 text-white font-bold rounded-2xl transition-all hover:scale-105 active:scale-95 text-lg"
          >
            Free Play
          </button>
        </div>
      </div>
    );
  }

  if (mode === "campaign" && !currentLevel) {
    return (
      <div className="flex flex-col items-center gap-6 py-8 max-w-5xl mx-auto px-4">
        <div className="text-center mb-4">
          <h2 className="text-3xl sm:text-4xl font-black text-blue-400 mb-2">Campaign</h2>
          <div className="flex items-center gap-4 justify-center flex-wrap">
            <div className="text-gray-400">Lives: {"❤️".repeat(lives)}</div>
            <button
              onClick={() => setMode("menu")}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-all text-sm"
            >
              Back
            </button>
          </div>
        </div>

        {lives === 0 && (
          <div className="bg-red-900/50 border border-red-500 rounded-lg p-6 text-center max-w-md mb-4">
            <h3 className="text-2xl font-bold text-red-400 mb-2">Game Over</h3>
            <p className="text-gray-300 mb-4">You ran out of lives!</p>
            <button
              onClick={() => {
                setLives(3);
                setMode("menu");
              }}
              className="px-6 py-2 bg-red-600 hover:bg-red-500 text-white font-bold rounded-lg transition-all"
            >
              Restart Campaign
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
          {LEVELS.map((level) => {
            const stars = levelStars[level.id] || 0;
            const unlocked = level.id === 1 || (levelStars[level.id - 1] || 0) > 0;

            return (
              <div
                key={level.id}
                className={`border-2 rounded-xl p-4 transition-all ${
                  unlocked
                    ? "border-blue-500 bg-gray-900 hover:bg-gray-800 cursor-pointer"
                    : "border-gray-700 bg-gray-950 opacity-50 cursor-not-allowed"
                }`}
                onClick={() => unlocked && lives > 0 && startGame(level)}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-bold text-blue-400">Level {level.id}</h3>
                  <div className="text-yellow-400">
                    {"⭐".repeat(stars)}
                    {"☆".repeat(3 - stars)}
                  </div>
                </div>
                <p className="text-white font-bold mb-1">{level.name}</p>
                <p className="text-sm text-gray-400 mb-2">{level.description}</p>
                <div className="text-xs text-gray-500 space-y-1">
                  {level.parTime && <div>Time: {level.parTime}s</div>}
                  {level.parMoves && <div>Moves: {level.parMoves}</div>}
                  {level.maxRedeals !== undefined && <div>Redeals: {level.maxRedeals}</div>}
                  {level.drawCount === 3 && <div>Draw: 3 cards</div>}
                </div>
                {!unlocked && (
                  <div className="mt-2 text-xs text-red-400">🔒 Complete Level {level.id - 1}</div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4 py-4 sm:py-8 max-w-6xl mx-auto px-2 sm:px-4">
      {/* Header */}
      <div className="flex items-center gap-2 sm:gap-4 flex-wrap justify-center w-full">
        <div className="bg-gray-900 px-3 sm:px-6 py-2 sm:py-3 rounded-lg text-center">
          <div className="text-xs text-gray-500 uppercase">Time</div>
          <div className="text-lg sm:text-2xl font-bold text-blue-400">{time}s</div>
          {currentLevel?.parTime && (
            <div className="text-xs text-gray-500">/ {currentLevel.parTime}s</div>
          )}
        </div>
        <div className="bg-gray-900 px-3 sm:px-6 py-2 sm:py-3 rounded-lg text-center">
          <div className="text-xs text-gray-500 uppercase">Moves</div>
          <div className="text-lg sm:text-2xl font-bold text-purple-400">{moves}</div>
          {currentLevel?.parMoves && (
            <div className="text-xs text-gray-500">/ {currentLevel.parMoves}</div>
          )}
        </div>
        <div className="bg-gray-900 px-3 sm:px-6 py-2 sm:py-3 rounded-lg text-center">
          <div className="text-xs text-gray-500 uppercase">Score</div>
          <div className="text-lg sm:text-2xl font-bold text-green-400">{score}</div>
        </div>
        {mode === "campaign" && (
          <div className="bg-gray-900 px-3 sm:px-6 py-2 sm:py-3 rounded-lg text-center">
            <div className="text-xs text-gray-500 uppercase">Lives</div>
            <div className="text-lg sm:text-2xl">{"❤️".repeat(lives)}</div>
          </div>
        )}
        {mode === "endless" && (
          <div className="bg-gray-900 px-3 sm:px-6 py-2 sm:py-3 rounded-lg text-center">
            <div className="text-xs text-gray-500 uppercase">Streak</div>
            <div className="text-lg sm:text-2xl font-bold text-orange-400">{endlessStreak}</div>
          </div>
        )}
      </div>

      {/* Power-ups */}
      {mode !== "freeplay" && (
        <div className="flex items-center gap-2 flex-wrap justify-center">
          <button
            onClick={handleUndo}
            disabled={undosLeft === 0 || moveHistory.length === 0}
            className="px-3 sm:px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-bold rounded-lg transition-all text-xs sm:text-sm"
          >
            ↶ Undo ({undosLeft})
          </button>
          <button
            onClick={handleHint}
            disabled={hintsLeft === 0}
            className="px-3 sm:px-4 py-2 bg-yellow-600 hover:bg-yellow-500 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-bold rounded-lg transition-all text-xs sm:text-sm"
          >
            💡 Hint ({hintsLeft})
          </button>
          <button
            onClick={handleAutoComplete}
            disabled={autoCompleteLeft === 0 || !tableau.every((pile) => pile.every((card) => card.faceUp))}
            className="px-3 sm:px-4 py-2 bg-green-600 hover:bg-green-500 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-bold rounded-lg transition-all text-xs sm:text-sm"
          >
            ⚡ Auto ({autoCompleteLeft})
          </button>
          <button
            onClick={handleGiveUp}
            className="px-3 sm:px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-bold rounded-lg transition-all text-xs sm:text-sm"
          >
            Give Up
          </button>
        </div>
      )}

      {mode === "freeplay" && (
        <div className="flex gap-2">
          <button
            onClick={() => startGame()}
            className="px-4 sm:px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg transition-all text-sm"
          >
            New Game
          </button>
          <button
            onClick={() => setMode("menu")}
            className="px-4 sm:px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white font-bold rounded-lg transition-all text-sm"
          >
            Menu
          </button>
        </div>
      )}

      {/* Win state */}
      {gameState === "won" && (
        <div className="bg-green-900/50 border border-green-500 rounded-lg p-4 sm:p-6 text-center max-w-md">
          <h2 className="text-xl sm:text-2xl font-bold text-green-400 mb-2">🎉 Victory!</h2>
          <p className="text-gray-300 mb-2">
            Time: {time}s | Moves: {moves}
          </p>
          <p className="text-xl sm:text-2xl font-bold text-yellow-400 mb-4">Score: {score}</p>
          {showCelebration && (
            <p className="text-lg font-bold text-yellow-400 animate-pulse mb-2">🏆 New Best! 🏆</p>
          )}
          {mode === "campaign" && currentLevel && (
            <div className="text-2xl sm:text-3xl text-yellow-400 mb-4">
              {"⭐".repeat(Math.min(3, (currentLevel.parMoves && moves <= currentLevel.parMoves ? 1 : 0) + (currentLevel.parTime && time <= currentLevel.parTime ? 1 : 0) + 1))}
            </div>
          )}
          <div className="flex gap-2 justify-center flex-wrap">
            {mode === "campaign" && currentLevel && currentLevel.id < LEVELS.length && (
              <button
                onClick={() => startGame(LEVELS[currentLevel.id])}
                className="px-4 sm:px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg transition-all text-sm"
              >
                Next Level
              </button>
            )}
            <button
              onClick={() => currentLevel ? startGame(currentLevel) : startGame()}
              className="px-4 sm:px-6 py-2 bg-green-600 hover:bg-green-500 text-white font-bold rounded-lg transition-all text-sm"
            >
              Play Again
            </button>
            <button
              onClick={() => {
                setCurrentLevel(null);
                setMode(mode === "freeplay" ? "menu" : mode);
              }}
              className="px-4 sm:px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white font-bold rounded-lg transition-all text-sm"
            >
              {mode === "campaign" ? "Level Select" : "Menu"}
            </button>
          </div>
        </div>
      )}

      {/* Lost state */}
      {gameState === "lost" && (
        <div className="bg-red-900/50 border border-red-500 rounded-lg p-4 sm:p-6 text-center max-w-md">
          <h2 className="text-xl sm:text-2xl font-bold text-red-400 mb-2">Game Over</h2>
          <p className="text-gray-300 mb-4">You ran out of lives!</p>
          <button
            onClick={() => {
              setLives(3);
              setCurrentLevel(null);
              setMode("campaign");
              setGameState("playing");
            }}
            className="px-4 sm:px-6 py-2 bg-red-600 hover:bg-red-500 text-white font-bold rounded-lg transition-all"
          >
            Restart Campaign
          </button>
        </div>
      )}

      {/* Paused state (time limit exceeded but lives remain) */}
      {gameState === "paused" && (
        <div className="bg-orange-900/50 border border-orange-500 rounded-lg p-4 sm:p-6 text-center max-w-md">
          <h2 className="text-xl sm:text-2xl font-bold text-orange-400 mb-2">Time's Up!</h2>
          <p className="text-gray-300 mb-4">
            You lost a life. Lives remaining: {lives}
          </p>
          <div className="flex gap-2 justify-center">
            <button
              onClick={() => {
                setCurrentLevel(null);
                setGameState("playing");
              }}
              className="px-4 sm:px-6 py-2 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-lg transition-all"
            >
              Level Select
            </button>
            {currentLevel && (
              <button
                onClick={() => startGame(currentLevel)}
                className="px-4 sm:px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg transition-all"
              >
                Try Again
              </button>
            )}
          </div>
        </div>
      )}

      {/* Game board */}
      {gameState === "playing" && (
        <div className="w-full">
          {/* Stock, Waste, and Foundations */}
          <div className="flex gap-1 sm:gap-2 mb-4 sm:mb-6 justify-between">
            <div className="flex gap-1 sm:gap-2">
              <div onClick={handleStockClick} className="cursor-pointer relative">
                {stock.length > 0 ? (
                  renderCard(stock[stock.length - 1], "stock", 0, false)
                ) : (
                  <div className="w-14 h-20 sm:w-16 sm:h-24 border-2 border-dashed border-gray-700 rounded-lg flex items-center justify-center text-gray-600 text-2xl hover:border-gray-600">
                    ↻
                  </div>
                )}
                {currentLevel?.maxRedeals !== undefined && (
                  <div className="absolute -bottom-5 left-0 right-0 text-xs text-center text-gray-500">
                    {redeals}/{currentLevel.maxRedeals}
                  </div>
                )}
              </div>
              {waste.length > 0
                ? renderCard(waste[waste.length - 1], "waste", waste.length - 1, true)
                : renderCard(undefined, "waste", 0, false)}
            </div>
            <div className="flex gap-1 sm:gap-2">
              {foundations.map((foundation, i) =>
                foundation.length > 0
                  ? renderCard(
                      foundation[foundation.length - 1],
                      `foundation-${i}`,
                      foundation.length - 1,
                      true
                    )
                  : renderCard(undefined, `foundation-${i}`, 0, true)
              )}
            </div>
          </div>

          {/* Tableau */}
          <div className="grid grid-cols-7 gap-1 sm:gap-2">
            {tableau.map((pile, pileIndex) => (
              <div key={pileIndex} className="flex flex-col">
                {pile.length === 0
                  ? renderCard(undefined, `tableau-${pileIndex}`, 0, true)
                  : pile.map((card, cardIndex) => (
                      <div key={cardIndex} className="-mt-14 sm:-mt-16 first:mt-0">
                        {renderCard(card, `tableau-${pileIndex}`, cardIndex, true)}
                      </div>
                    ))}
              </div>
            ))}
          </div>
        </div>
      )}

      {gameState === "playing" && (
        <div className="text-center text-xs text-gray-600 max-w-md mt-2">
          {currentLevel && (
            <p className="font-bold text-blue-400 mb-1">
              Level {currentLevel.id}: {currentLevel.name}
            </p>
          )}
          <p>Click stock to draw cards. Click cards to select, then click destination to move.</p>
          <p className="mt-1">Build foundations by suit from Ace to King.</p>
        </div>
      )}
    </div>
  );
}
