"use client";

import { useCallback, useEffect, useState } from "react";

type Suit = "♠" | "♥" | "♦" | "♣";
type Card = { suit: Suit; rank: number; faceUp: boolean; id: string };
type Selection =
  | { type: "tableau"; col: number; index: number }
  | { type: "waste" }
  | { type: "foundation"; index: number }
  | null;

const SUITS: Suit[] = ["♠", "♥", "♦", "♣"];
const RED: Set<Suit> = new Set(["♥", "♦"]);

function rankToStr(r: number): string {
  if (r === 1) return "A";
  if (r === 11) return "J";
  if (r === 12) return "Q";
  if (r === 13) return "K";
  return String(r);
}

function makeDeck(): Card[] {
  const deck: Card[] = [];
  for (const s of SUITS) {
    for (let r = 1; r <= 13; r++) {
      deck.push({ suit: s, rank: r, faceUp: false, id: `${s}-${r}` });
    }
  }
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

function dealNew() {
  const deck = makeDeck();
  const tableau: Card[][] = [[], [], [], [], [], [], []];
  for (let col = 0; col < 7; col++) {
    for (let row = 0; row <= col; row++) {
      const card = deck.pop()!;
      card.faceUp = row === col;
      tableau[col].push(card);
    }
  }
  return {
    tableau,
    stock: deck,
    waste: [] as Card[],
    foundations: [[], [], [], []] as Card[][],
  };
}

function isOpposite(a: Suit, b: Suit) {
  return RED.has(a) !== RED.has(b);
}

export default function Solitaire() {
  const [tableau, setTableau] = useState<Card[][]>([]);
  const [stock, setStock] = useState<Card[]>([]);
  const [waste, setWaste] = useState<Card[]>([]);
  const [foundations, setFoundations] = useState<Card[][]>([]);
  const [selection, setSelection] = useState<Selection>(null);
  const [moves, setMoves] = useState(0);
  const [won, setWon] = useState(false);

  const newGame = useCallback(() => {
    const g = dealNew();
    setTableau(g.tableau);
    setStock(g.stock);
    setWaste(g.waste);
    setFoundations(g.foundations);
    setSelection(null);
    setMoves(0);
    setWon(false);
  }, []);

  useEffect(() => {
    newGame();
  }, [newGame]);

  useEffect(() => {
    if (foundations.length === 4 && foundations.every((f) => f.length === 13)) setWon(true);
  }, [foundations]);

  const getSelectedCards = (sel: Exclude<Selection, null>): Card[] => {
    if (sel.type === "tableau") {
      return tableau[sel.col].slice(sel.index);
    }
    if (sel.type === "waste") {
      return waste.length ? [waste[waste.length - 1]] : [];
    }
    return foundations[sel.index].length
      ? [foundations[sel.index][foundations[sel.index].length - 1]]
      : [];
  };

  const removeSource = (sel: Exclude<Selection, null>): {
    tableau: Card[][];
    waste: Card[];
    foundations: Card[][];
  } => {
    const tab = tableau.map((col) => col.slice());
    const wst = waste.slice();
    const found = foundations.map((f) => f.slice());
    if (sel.type === "tableau") {
      tab[sel.col] = tab[sel.col].slice(0, sel.index);
      const top = tab[sel.col][tab[sel.col].length - 1];
      if (top && !top.faceUp) top.faceUp = true;
    } else if (sel.type === "waste") {
      wst.pop();
    } else {
      found[sel.index].pop();
    }
    return { tableau: tab, waste: wst, foundations: found };
  };

  const canPlaceOnTableau = (col: Card[], cards: Card[]) => {
    const first = cards[0];
    if (col.length === 0) return first.rank === 13;
    const top = col[col.length - 1];
    if (!top.faceUp) return false;
    return isOpposite(top.suit, first.suit) && top.rank === first.rank + 1;
  };

  const canPlaceOnFoundation = (foundation: Card[], cards: Card[]) => {
    if (cards.length !== 1) return false;
    const card = cards[0];
    if (foundation.length === 0) return card.rank === 1;
    const top = foundation[foundation.length - 1];
    return top.suit === card.suit && top.rank === card.rank - 1;
  };

  const tryMove = (target: Exclude<Selection, null>) => {
    if (!selection) return false;
    const cards = getSelectedCards(selection);
    if (!cards.length || !cards.every((c) => c.faceUp)) return false;
    const after = removeSource(selection);

    if (target.type === "tableau") {
      const targetCol = after.tableau[target.col];
      if (!canPlaceOnTableau(targetCol, cards)) return false;
      after.tableau[target.col] = targetCol.concat(cards);
    } else if (target.type === "foundation") {
      const f = after.foundations[target.index];
      if (!canPlaceOnFoundation(f, cards)) return false;
      after.foundations[target.index] = f.concat(cards);
    } else {
      return false;
    }

    setTableau(after.tableau);
    setWaste(after.waste);
    setFoundations(after.foundations);
    setSelection(null);
    setMoves((m) => m + 1);
    return true;
  };

  const handleStockClick = () => {
    if (stock.length === 0) {
      const replenished = waste
        .slice()
        .reverse()
        .map((c) => ({ ...c, faceUp: false }));
      setStock(replenished);
      setWaste([]);
    } else {
      const next = stock.slice();
      const card = next.pop()!;
      card.faceUp = true;
      setStock(next);
      setWaste(waste.concat([card]));
    }
    setSelection(null);
    setMoves((m) => m + 1);
  };

  const handleClick = (sel: Exclude<Selection, null>) => {
    if (!selection) {
      // Pick a source if it has a face-up card
      if (sel.type === "tableau") {
        const card = tableau[sel.col][sel.index];
        if (!card || !card.faceUp) return;
      }
      if (sel.type === "waste" && waste.length === 0) return;
      if (sel.type === "foundation" && foundations[sel.index].length === 0) return;
      setSelection(sel);
      return;
    }
    if (
      selection.type === sel.type &&
      ((selection.type === "tableau" &&
        sel.type === "tableau" &&
        selection.col === sel.col &&
        selection.index === sel.index) ||
        (selection.type === "waste" && sel.type === "waste") ||
        (selection.type === "foundation" &&
          sel.type === "foundation" &&
          selection.index === sel.index))
    ) {
      setSelection(null);
      return;
    }
    if (sel.type === "tableau" || sel.type === "foundation") {
      if (!tryMove(sel)) setSelection(sel);
    } else {
      setSelection(sel);
    }
  };

  const isSelected = (sel: Exclude<Selection, null>): boolean => {
    if (!selection) return false;
    if (selection.type !== sel.type) return false;
    if (selection.type === "tableau" && sel.type === "tableau") {
      return selection.col === sel.col && selection.index === sel.index;
    }
    if (selection.type === "foundation" && sel.type === "foundation") {
      return selection.index === sel.index;
    }
    return selection.type === "waste" && sel.type === "waste";
  };

  const renderCard = (card: Card, sel: Exclude<Selection, null>, offsetClass = "") => (
    <button
      key={card.id}
      onClick={() => handleClick(sel)}
      className={`w-12 h-16 md:w-14 md:h-20 rounded shadow text-sm md:text-base font-bold flex flex-col items-center justify-between p-1 ${
        card.faceUp
          ? RED.has(card.suit)
            ? "bg-white text-red-600"
            : "bg-white text-gray-900"
          : "bg-blue-700 text-blue-700"
      } ${offsetClass} ${isSelected(sel) ? "ring-2 ring-yellow-400 -translate-y-1" : ""}`}
    >
      {card.faceUp && (
        <>
          <span className="self-start">{rankToStr(card.rank)}</span>
          <span className="text-xl">{card.suit}</span>
        </>
      )}
    </button>
  );

  return (
    <div className="flex flex-col items-center gap-4 text-white">
      <div className="flex items-center gap-6">
        <div>
          Moves: <span className="font-bold">{moves}</span>
        </div>
        <button
          onClick={newGame}
          className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-sm font-bold"
        >
          New Game
        </button>
      </div>

      <div className="flex gap-2">
        <button
          onClick={handleStockClick}
          className="w-12 h-16 md:w-14 md:h-20 rounded shadow bg-blue-700 text-white font-bold flex items-center justify-center"
        >
          {stock.length > 0 ? "↺" : "♻"}
        </button>
        <div className="w-12 h-16 md:w-14 md:h-20">
          {waste.length > 0 && renderCard(waste[waste.length - 1], { type: "waste" })}
        </div>
        <div className="w-2" />
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="w-12 h-16 md:w-14 md:h-20 border-2 border-dashed border-white/30 rounded flex items-center justify-center"
          >
            {foundations[i] && foundations[i].length > 0
              ? renderCard(foundations[i][foundations[i].length - 1], { type: "foundation", index: i })
              : (
                <button
                  onClick={() => handleClick({ type: "foundation", index: i })}
                  className="w-full h-full text-2xl text-white/40"
                >
                  {SUITS[i]}
                </button>
              )}
          </div>
        ))}
      </div>

      <div className="flex gap-2 items-start">
        {tableau.map((col, ci) => (
          <div key={ci} className="flex flex-col gap-0">
            {col.length === 0 ? (
              <button
                onClick={() => handleClick({ type: "tableau", col: ci, index: 0 })}
                className="w-12 h-16 md:w-14 md:h-20 border-2 border-dashed border-white/30 rounded"
              />
            ) : (
              col.map((card, idx) =>
                renderCard(
                  card,
                  { type: "tableau", col: ci, index: idx },
                  idx > 0 ? "-mt-12 md:-mt-14" : ""
                )
              )
            )}
          </div>
        ))}
      </div>

      {won && (
        <div className="bg-gray-900 px-6 py-4 rounded-lg text-center">
          <div className="text-2xl font-bold mb-2 text-yellow-400">You won!</div>
          <div className="mb-3">Moves: {moves}</div>
          <button
            onClick={newGame}
            className="px-6 py-2 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-700"
          >
            New Game
          </button>
        </div>
      )}

      <p className="text-sm text-gray-400 text-center max-w-md">
        Click a card, then click where to move it. Build foundations A→K by suit, tableau K→A
        alternating colors.
      </p>
    </div>
  );
}
