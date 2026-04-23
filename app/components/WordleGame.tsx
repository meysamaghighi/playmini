"use client";

import { useCallback, useEffect, useState } from "react";
import { VALID_GUESSES } from "./wordlist";

const WORD_LENGTH = 5;
const MAX_GUESSES = 6;

const COMMON_ANSWERS = [
  "ABOUT", "ABOVE", "ABUSE", "ACTOR", "ACUTE", "ADMIT", "ADOPT", "ADULT",
  "AGENT", "AGREE", "AHEAD", "ALARM", "ALBUM", "ALERT", "ALIKE", "ALIVE",
  "ALLOW", "ALONE", "ALONG", "ALTER", "AMONG", "ANGER", "ANGLE", "ANGRY",
  "APART", "APPLE", "APPLY", "ARENA", "ARGUE", "ARISE", "ARRAY", "ARROW",
  "ASIDE", "ASSET", "AUDIO", "AUDIT", "AVOID", "AWAKE", "AWARD", "AWARE",
  "BADLY", "BASIC", "BEACH", "BEGAN", "BEGIN", "BEING", "BELOW", "BENCH",
  "BIRTH", "BLACK", "BLAME", "BLAND", "BLANK", "BLAST", "BLAZE", "BLEED",
  "BLEND", "BLESS", "BLIND", "BLINK", "BLOCK", "BLOOD", "BLOOM", "BLOWN",
  "BLUNT", "BOARD", "BOAST", "BOOST", "BOOTH", "BOUND", "BRAIN", "BRAKE",
  "BRAND", "BRAVE", "BREAD", "BREAK", "BREED", "BRICK", "BRIEF", "BRING",
  "BROAD", "BROKE", "BROWN", "BRUSH", "BUILD", "BUILT", "BURST", "CABLE",
  "CARRY", "CATCH", "CAUSE", "CHAIN", "CHAIR", "CHALK", "CHAOS", "CHARM",
  "CHART", "CHASE", "CHEAP", "CHECK", "CHEEK", "CHEER", "CHESS", "CHEST",
  "CHIEF", "CHILD", "CHILL", "CHOIR", "CHOKE", "CHOSE", "CLAIM", "CLASS",
  "CLEAN", "CLEAR", "CLICK", "CLIFF", "CLIMB", "CLOAK", "CLOCK", "CLOSE",
  "CLOTH", "CLOUD", "COACH", "COAST", "COULD", "COUNT", "COURT", "COVER",
  "CRACK", "CRAFT", "CRANE", "CRASH", "CRAZY", "CREAM", "CRIME", "CRISP",
  "CROSS", "CROWD", "CROWN", "CRUSH", "CURVE", "CYCLE", "DAILY", "DAIRY",
  "DANCE", "DEALT", "DEATH", "DELAY", "DEPTH", "DOING", "DOUBT", "DOZEN",
  "DRAFT", "DRAIN", "DRAMA", "DRANK", "DREAM", "DRESS", "DRIED", "DRIFT",
  "DRINK", "DRIVE", "DRONE", "DROWN", "DRUNK", "DUMMY", "DWARF", "EAGER",
  "EARLY", "EARTH", "EIGHT", "ELBOW", "ELDER", "EMPTY", "ENEMY", "ENJOY",
  "ENTER", "ENTRY", "EQUAL", "ERROR", "EVENT", "EVERY", "EXACT", "EXIST",
  "EXTRA", "FAITH", "FALSE", "FANCY", "FAULT", "FENCE", "FEWER", "FIBER",
  "FIELD", "FIGHT", "FINAL", "FIRST", "FLAIR", "FLAME", "FLASH", "FLEET",
  "FLESH", "FLIES", "FLOAT", "FLOCK", "FLOOD", "FLOOR", "FLOUR", "FLUSH",
  "FOCUS", "FORCE", "FORGE", "FORTH", "FORTY", "FORUM", "FOUND", "FRAME",
  "FRANK", "FRAUD", "FRESH", "FRONT", "FROST", "FROZE", "FRUIT", "GIANT",
  "GLARE", "GLASS", "GLEAM", "GLORY", "GRACE", "GRADE", "GRAIN", "GRAND",
  "GRANT", "GRAPE", "GRAPH", "GRASP", "GRASS", "GRAVE", "GREAT", "GREED",
  "GREEN", "GREET", "GRIEF", "GRILL", "GROSS", "GROUP", "GROWN", "GUARD",
  "GUESS", "GUEST", "GUIDE", "HABIT", "HAPPY", "HARSH", "HEART", "HEAVY",
  "HENCE", "HOBBY", "HORSE", "HOTEL", "HOUSE", "HUMAN", "HUMOR", "IDEAL",
  "IMAGE", "INDEX", "INNER", "INPUT", "IRONY", "ISSUE", "JOINT", "JUDGE",
  "JUICE", "KNOCK", "KNOWN", "LABEL", "LABOR", "LARGE", "LASER", "LATER",
  "LAUGH", "LAYER", "LEARN", "LEAST", "LEAVE", "LEGAL", "LEMON", "LEVEL",
  "LIGHT", "LIMIT", "LOCAL", "LODGE", "LOGIC", "LOYAL", "LUCKY", "LUNCH",
  "MAGIC", "MAJOR", "MAKER", "MARCH", "MATCH", "MAYBE", "MAYOR", "MEDAL",
  "MEDIA", "METAL", "METER", "MIGHT", "MINOR", "MIRTH", "MODEL", "MONEY",
  "MONTH", "MOTOR", "MOUNT", "MOUSE", "MOUTH", "MOVIE", "MUSIC", "NEVER",
  "NEWLY", "NIGHT", "NOBLE", "NOISE", "NORTH", "NOVEL", "NURSE", "OCEAN",
  "OFFER", "OFTEN", "ORDER", "OTHER", "OUGHT", "PAINT", "PANEL", "PAPER",
  "PARTY", "PEACE", "PEARL", "PHASE", "PHONE", "PHOTO", "PIANO", "PILOT",
  "PITCH", "PLACE", "PLAIN", "PLANT", "PLATE", "POINT", "POUND", "POWER",
  "PRESS", "PRICE", "PRIDE", "PRIME", "PRINT", "PRIOR", "PRIZE", "PROOF",
  "PROUD", "PROVE", "QUEEN", "QUICK", "QUIET", "QUITE", "RADIO", "RAISE",
  "RANGE", "RAPID", "RATIO", "REACT", "READY", "REALM", "REBEL", "REFER",
  "RELAX", "RELAY", "RENEW", "REPLY", "RIGHT", "RIVAL", "RIVER", "ROBOT",
  "ROUGH", "ROUND", "ROUTE", "ROYAL", "RURAL", "SALAD", "SAUCE", "SCALE",
  "SCENE", "SCOPE", "SCORE", "SEEMS", "SENSE", "SEVEN", "SHADE", "SHAKE",
  "SHALL", "SHAME", "SHAPE", "SHARE", "SHARP", "SHEET", "SHELF", "SHELL",
  "SHIFT", "SHINE", "SHIRT", "SHOCK", "SHOOT", "SHORE", "SHORT", "SHOWN",
  "SIGHT", "SINCE", "SIXTH", "SIXTY", "SKILL", "SLEEP", "SLIDE", "SMALL",
  "SMART", "SMILE", "SMOKE", "SNAKE", "SOLID", "SOLVE", "SORRY", "SOUND",
  "SOUTH", "SPACE", "SPARE", "SPEAK", "SPEED", "SPEND", "SPENT", "SPLIT",
  "SPOKE", "SPORT", "STAFF", "STAGE", "STAKE", "STAND", "START", "STATE",
  "STEAM", "STEEL", "STICK", "STILL", "STOCK", "STONE", "STOOD", "STORE",
  "STORM", "STORY", "STRIP", "STUDY", "STUFF", "STYLE", "SUGAR", "SUITE",
  "SUPER", "SWEET", "TABLE", "TAKEN", "TASTE", "TEACH", "THANK", "THEFT",
  "THEIR", "THEME", "THERE", "THESE", "THICK", "THING", "THINK", "THIRD",
  "THOSE", "THREE", "THREW", "THROW", "TIGHT", "TIMER", "TODAY", "TOPIC",
  "TOTAL", "TOUCH", "TOUGH", "TOWER", "TRACK", "TRADE", "TRAIN", "TREAT",
  "TREND", "TRIAL", "TRIBE", "TRICK", "TRIED", "TRUCK", "TRULY", "TRUNK",
  "TRUST", "TRUTH", "TWICE", "UNCLE", "UNDER", "UNDUE", "UNION", "UNITE",
  "UNITY", "UNTIL", "UPPER", "UPSET", "URBAN", "USAGE", "USUAL", "VALID",
  "VALUE", "VIDEO", "VIRUS", "VISIT", "VITAL", "VOCAL", "VOICE", "WASTE",
  "WATCH", "WATER", "WHEEL", "WHERE", "WHICH", "WHILE", "WHITE", "WHOLE",
  "WHOSE", "WOMAN", "WORLD", "WORRY", "WORSE", "WORSH", "WORTH", "WOULD",
  "WRITE", "WRONG", "WROTE", "YIELD", "YOUNG", "YOUTH",
] as const;

type LetterState = "correct" | "present" | "absent";

function scoreGuess(guess: string, answer: string): LetterState[] {
  const states: LetterState[] = Array(WORD_LENGTH).fill("absent");
  const answerChars = answer.split("");
  const used = Array(WORD_LENGTH).fill(false);
  for (let i = 0; i < WORD_LENGTH; i++) {
    if (guess[i] === answerChars[i]) {
      states[i] = "correct";
      used[i] = true;
    }
  }
  for (let i = 0; i < WORD_LENGTH; i++) {
    if (states[i] === "correct") continue;
    for (let j = 0; j < WORD_LENGTH; j++) {
      if (!used[j] && guess[i] === answerChars[j]) {
        states[i] = "present";
        used[j] = true;
        break;
      }
    }
  }
  return states;
}

const KEY_ROWS = ["QWERTYUIOP", "ASDFGHJKL", "ZXCVBNM"];

export default function WordleGame() {
  const [answer, setAnswer] = useState<string>(() => COMMON_ANSWERS[Math.floor(Math.random() * COMMON_ANSWERS.length)]);
  const [guesses, setGuesses] = useState<string[]>([]);
  const [current, setCurrent] = useState("");
  const [state, setState] = useState<"playing" | "won" | "lost">("playing");
  const [flash, setFlash] = useState("");
  const [stats, setStats] = useState<{ wins: number; played: number; streak: number }>({
    wins: 0,
    played: 0,
    streak: 0,
  });

  useEffect(() => {
    try {
      const saved = localStorage.getItem("pb-wordle-stats");
      if (saved) setStats(JSON.parse(saved));
    } catch {}
  }, []);

  const newGame = useCallback(() => {
    setAnswer(COMMON_ANSWERS[Math.floor(Math.random() * COMMON_ANSWERS.length)]);
    setGuesses([]);
    setCurrent("");
    setState("playing");
    setFlash("");
  }, []);

  const submitGuess = useCallback(() => {
    if (state !== "playing") return;
    if (current.length !== WORD_LENGTH) {
      setFlash("Not enough letters");
      return;
    }
    if (!VALID_GUESSES.has(current) && !COMMON_ANSWERS.includes(current as (typeof COMMON_ANSWERS)[number])) {
      setFlash("Not in word list");
      return;
    }
    const newGuesses = [...guesses, current];
    setGuesses(newGuesses);
    setCurrent("");
    setFlash("");

    const updateStats = (result: "won" | "lost") => {
      setStats((prev) => {
        const won = result === "won";
        const next = {
          played: prev.played + 1,
          wins: prev.wins + (won ? 1 : 0),
          streak: won ? prev.streak + 1 : 0,
        };
        try {
          localStorage.setItem("pb-wordle-stats", JSON.stringify(next));
        } catch {}
        return next;
      });
    };

    if (current === answer) {
      setState("won");
      updateStats("won");
    } else if (newGuesses.length >= MAX_GUESSES) {
      setState("lost");
      updateStats("lost");
    }
  }, [answer, current, guesses, state]);

  const onKey = useCallback(
    (key: string) => {
      if (state !== "playing") return;
      if (key === "ENTER") {
        submitGuess();
      } else if (key === "BACKSPACE") {
        setCurrent((c) => c.slice(0, -1));
        setFlash("");
      } else if (/^[A-Z]$/.test(key) && current.length < WORD_LENGTH) {
        setCurrent((c) => c + key);
      }
    },
    [current, state, submitGuess]
  );

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Enter") onKey("ENTER");
      else if (e.key === "Backspace") onKey("BACKSPACE");
      else if (/^[a-zA-Z]$/.test(e.key)) onKey(e.key.toUpperCase());
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onKey]);

  // Keyboard letter states (best across all guesses)
  const keyStates = new Map<string, LetterState>();
  for (const g of guesses) {
    const states = scoreGuess(g, answer);
    for (let i = 0; i < WORD_LENGTH; i++) {
      const letter = g[i];
      const cur = keyStates.get(letter);
      const newState = states[i];
      if (!cur || (cur === "absent" && newState !== "absent") || (cur === "present" && newState === "correct")) {
        keyStates.set(letter, newState);
      }
    }
  }

  const tileColor = (s: LetterState): string =>
    s === "correct"
      ? "bg-green-600 text-white border-green-600"
      : s === "present"
      ? "bg-yellow-500 text-white border-yellow-500"
      : "bg-gray-600 text-white border-gray-600";

  const keyColor = (k: string): string => {
    const s = keyStates.get(k);
    if (!s) return "bg-gray-400 hover:bg-gray-300 text-gray-900";
    if (s === "correct") return "bg-green-600 text-white";
    if (s === "present") return "bg-yellow-500 text-white";
    return "bg-gray-700 text-gray-400";
  };

  const rows: { word: string; states?: LetterState[]; isCurrent?: boolean }[] = [];
  for (const g of guesses) rows.push({ word: g, states: scoreGuess(g, answer) });
  if (state === "playing") rows.push({ word: current.padEnd(WORD_LENGTH), isCurrent: true });
  while (rows.length < MAX_GUESSES) rows.push({ word: "     " });

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex items-center gap-6 text-white text-sm">
        <div>
          Played: <span className="font-bold">{stats.played}</span>
        </div>
        <div>
          Wins: <span className="font-bold text-green-400">{stats.wins}</span>
        </div>
        <div>
          Streak: <span className="font-bold text-yellow-400">{stats.streak}</span>
        </div>
      </div>

      {flash && <div className="bg-gray-800 text-white px-4 py-2 rounded text-sm">{flash}</div>}

      <div className="flex flex-col gap-1.5">
        {rows.map((row, i) => (
          <div key={i} className="flex gap-1.5">
            {Array.from({ length: WORD_LENGTH }, (_, j) => {
              const letter = row.word[j] || "";
              const s = row.states?.[j];
              const baseCls =
                "w-12 h-12 md:w-14 md:h-14 border-2 text-xl md:text-2xl font-bold flex items-center justify-center rounded";
              const cls = s
                ? tileColor(s)
                : letter.trim()
                ? "bg-gray-800 border-gray-400 text-white"
                : "bg-gray-900 border-gray-700 text-white";
              return (
                <div key={j} className={`${baseCls} ${cls}`}>
                  {letter.trim()}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {state !== "playing" && (
        <div className="bg-gray-900 text-white px-6 py-4 rounded-lg text-center">
          <div className="text-2xl font-bold mb-2">
            {state === "won" ? "You got it!" : "Game Over"}
          </div>
          <div className="mb-3">
            Word: <span className="font-bold text-yellow-400">{answer}</span>
          </div>
          <button
            onClick={newGame}
            className="px-6 py-2 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700"
          >
            New Word
          </button>
        </div>
      )}

      <div className="flex flex-col gap-1.5 mt-2">
        {KEY_ROWS.map((row, i) => (
          <div key={i} className="flex justify-center gap-1">
            {i === 2 && (
              <button
                onClick={() => onKey("ENTER")}
                className="px-2 md:px-3 py-3 bg-gray-400 hover:bg-gray-300 text-gray-900 font-bold rounded text-xs"
              >
                ENTER
              </button>
            )}
            {row.split("").map((k) => (
              <button
                key={k}
                onClick={() => onKey(k)}
                className={`w-7 h-10 md:w-9 md:h-12 font-bold rounded text-sm ${keyColor(k)}`}
              >
                {k}
              </button>
            ))}
            {i === 2 && (
              <button
                onClick={() => onKey("BACKSPACE")}
                className="px-2 md:px-3 py-3 bg-gray-400 hover:bg-gray-300 text-gray-900 font-bold rounded text-xs"
              >
                ⌫
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
