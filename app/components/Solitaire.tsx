"use client";

import { useEffect, useState, useCallback } from "react";

type Suit = "♠" | "♥" | "♦" | "♣";
type Rank = "A" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "10" | "J" | "Q" | "K";
type Card = { suit: Suit; rank: Rank; faceUp: boolean };
type Pile = Card[];

const SUITS: Suit[] = ["♠", "♥", "♦", "♣"];
const RANKS: Rank[] = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];

export default function Solitaire() {
  const [gameState, setGameState] = useState<"start" | "playing" | "won">("start");
  const [tableau, setTableau] = useState<Pile[]>([]);
  const [foundations, setFoundations] = useState<Pile[]>([[], [], [], []]);
  const [stock, setStock] = useState<Pile>([]);
  const [waste, setWaste] = useState<Pile>([]);
  const [selectedCard, setSelectedCard] = useState<{ pile: string; index: number } | null>(null);
  const [moves, setMoves] = useState(0);
  const [time, setTime] = useState(0);

  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (gameState === "playing") {
      timer = setInterval(() => setTime((prev) => prev + 1), 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [gameState]);

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

  const startGame = useCallback(() => {
    const deck = shuffleDeck(createDeck());
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
    setGameState("playing");
  }, [createDeck, shuffleDeck]);

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

  const handleStockClick = useCallback(() => {
    if (gameState !== "playing") return;
    if (stock.length === 0) {
      setStock(waste.map((c) => ({ ...c, faceUp: false })).reverse());
      setWaste([]);
    } else {
      const card = stock[stock.length - 1];
      setStock(stock.slice(0, -1));
      setWaste([...waste, { ...card, faceUp: true }]);
    }
    setMoves((m) => m + 1);
  }, [gameState, stock, waste]);

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
          }
        }

        if (placed) {
          setTableau(newTableau);
          setFoundations(newFoundations);
          setWaste(newWaste);
          setMoves((m) => m + 1);

          // Check win
          if (newFoundations.every((f) => f.length === 13)) {
            setGameState("won");
          }
        }
        setSelectedCard(null);
      } else {
        // Select card
        setSelectedCard({ pile, index });
      }
    },
    [gameState, selectedCard, tableau, foundations, waste]
  );

  const renderCard = (card: Card | undefined, pile: string, index: number, selectable: boolean) => {
    if (!card) {
      return (
        <div
          key={`${pile}-${index}`}
          onClick={() => selectable && handleCardClick(pile, index)}
          className={`w-16 h-24 border-2 border-dashed border-gray-700 rounded-lg ${
            selectable ? "cursor-pointer hover:border-gray-600" : ""
          }`}
        />
      );
    }

    const isSelected = selectedCard?.pile === pile && selectedCard?.index === index;
    const isRed = card.suit === "♥" || card.suit === "♦";

    return (
      <div
        key={`${pile}-${index}`}
        onClick={() => selectable && card.faceUp && handleCardClick(pile, index)}
        className={`w-16 h-24 border-2 rounded-lg flex flex-col items-center justify-center font-bold transition-all ${
          card.faceUp
            ? isRed
              ? "bg-white text-red-600 border-gray-300"
              : "bg-white text-gray-900 border-gray-300"
            : "bg-gradient-to-br from-blue-900 to-blue-950 border-blue-800"
        } ${
          selectable && card.faceUp
            ? "cursor-pointer hover:scale-105"
            : card.faceUp
            ? ""
            : "cursor-default"
        } ${isSelected ? "ring-4 ring-yellow-400 scale-105" : ""}`}
      >
        {card.faceUp ? (
          <>
            <div className="text-xs">{card.rank}</div>
            <div className="text-2xl">{card.suit}</div>
          </>
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-blue-900 to-blue-950 rounded-lg" />
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col items-center gap-6 py-8 max-w-6xl mx-auto">
      {gameState === "start" && (
        <div className="text-center mb-6">
          <h2 className="text-3xl font-black text-blue-400 mb-4">Solitaire</h2>
          <p className="text-gray-400 mb-6">Classic Klondike Solitaire</p>
          <button
            onClick={startGame}
            className="px-10 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-2xl transition-all hover:scale-105 active:scale-95"
          >
            Start
          </button>
        </div>
      )}

      {(gameState === "playing" || gameState === "won") && (
        <>
          <div className="flex items-center gap-6 flex-wrap justify-center">
            <div className="bg-gray-900 px-6 py-3 rounded-lg text-center">
              <div className="text-xs text-gray-500 uppercase">Time</div>
              <div className="text-2xl font-bold text-blue-400">{time}s</div>
            </div>
            <div className="bg-gray-900 px-6 py-3 rounded-lg text-center">
              <div className="text-xs text-gray-500 uppercase">Moves</div>
              <div className="text-2xl font-bold text-purple-400">{moves}</div>
            </div>
            <button
              onClick={startGame}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg transition-all hover:scale-105 active:scale-95"
            >
              New Game
            </button>
          </div>

          {gameState === "won" && (
            <div className="bg-green-900/50 border border-green-500 rounded-lg p-6 text-center max-w-md">
              <h2 className="text-2xl font-bold text-green-400 mb-2">🎉 You Won!</h2>
              <p className="text-gray-300">
                Time: {time}s | Moves: {moves}
              </p>
            </div>
          )}

          <div className="w-full">
            {/* Stock, Waste, and Foundations */}
            <div className="flex gap-2 mb-6 justify-between">
              <div className="flex gap-2">
                <div onClick={handleStockClick} className="cursor-pointer">
                  {stock.length > 0 ? (
                    renderCard(stock[stock.length - 1], "stock", 0, false)
                  ) : (
                    <div className="w-16 h-24 border-2 border-dashed border-gray-700 rounded-lg flex items-center justify-center text-gray-600 text-xs">
                      ↻
                    </div>
                  )}
                </div>
                {waste.length > 0
                  ? renderCard(waste[waste.length - 1], "waste", waste.length - 1, true)
                  : renderCard(undefined, "waste", 0, false)}
              </div>
              <div className="flex gap-2">
                {foundations.map((foundation, i) =>
                  foundation.length > 0
                    ? renderCard(
                        foundation[foundation.length - 1],
                        `foundation-${i}`,
                        foundation.length - 1,
                        false
                      )
                    : renderCard(undefined, `foundation-${i}`, 0, true)
                )}
              </div>
            </div>

            {/* Tableau */}
            <div className="grid grid-cols-7 gap-2">
              {tableau.map((pile, pileIndex) => (
                <div key={pileIndex} className="flex flex-col gap-1">
                  {pile.length === 0
                    ? renderCard(undefined, `tableau-${pileIndex}`, 0, true)
                    : pile.map((card, cardIndex) => (
                        <div key={cardIndex} className="-mt-16 first:mt-0">
                          {renderCard(card, `tableau-${pileIndex}`, cardIndex, true)}
                        </div>
                      ))}
                </div>
              ))}
            </div>
          </div>

          <div className="text-center text-xs text-gray-600 max-w-md mt-4">
            <p>Click stock to draw cards. Click cards to select, then click destination to move.</p>
            <p className="mt-1">Build foundations by suit from Ace to King.</p>
          </div>
        </>
      )}
    </div>
  );
}
