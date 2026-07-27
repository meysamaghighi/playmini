"use client";

import GameShell from "../components/GameShell";
import Solitaire from "../components/Solitaire";

const HOW_TO = (
  <div>
    <p className="mb-3">
      Classic Klondike: build all four foundations from Ace to King, one suit
      at a time.
    </p>
    <p className="mb-1 font-semibold text-ink">Controls</p>
    <ul className="list-disc list-inside space-y-1">
      <li>Tap/click a card to select it, then tap/click where it should go</li>
      <li>Tap the stock pile to draw a new card</li>
    </ul>
  </div>
);

export default function SolitairePlay() {
  return (
    <GameShell id="solitaire" title="Solitaire" howTo={HOW_TO} status="idle">
      <div className="py-4">
        <Solitaire />
      </div>
    </GameShell>
  );
}
