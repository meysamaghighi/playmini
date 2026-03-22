"use client";

import { useState, useEffect, useRef, useCallback } from "react";

const PARAGRAPHS = [
  // Easy (20-30 words)
  {
    text: "The quick brown fox jumps over the lazy dog near the old wooden fence in the park.",
    difficulty: "Easy",
  },
  {
    text: "A bird in the hand is worth two in the bush, but three in the tree is even better.",
    difficulty: "Easy",
  },
  {
    text: "Life is like a box of chocolates. You never know what you are going to get from it.",
    difficulty: "Easy",
  },
  // Medium (35-50 words)
  {
    text: "The art of programming is the art of organizing complexity, mastering multitude, and avoiding chaos. Good code is its own best documentation. Clean code always looks like it was written by someone who cares.",
    difficulty: "Medium",
  },
  {
    text: "Success is not final, failure is not fatal. It is the courage to continue that counts most in life. The only way to do great work is to love what you do and never give up on your dreams.",
    difficulty: "Medium",
  },
  {
    text: "Technology has changed the way we communicate, work, and live our daily lives. From smartphones to artificial intelligence, innovation continues to shape our future in ways we never imagined possible before.",
    difficulty: "Medium",
  },
  {
    text: "Reading is to the mind what exercise is to the body. Books open doors to new worlds and introduce us to ideas that challenge our thinking. Every book you read adds another tool to your mental toolbox.",
    difficulty: "Medium",
  },
  // Hard (55-70 words)
  {
    text: "In the realm of competitive typing, speed and accuracy must harmonize perfectly. Professional typists develop muscle memory through thousands of hours of practice, allowing their fingers to dance across the keyboard without conscious thought. The fastest typists can exceed two hundred words per minute while maintaining near-perfect accuracy, a feat that requires extraordinary dedication and natural talent.",
    difficulty: "Hard",
  },
  {
    text: "The scientific method represents humanity's most powerful tool for understanding the natural world. Through systematic observation, hypothesis formation, experimental testing, and peer review, scientists build knowledge that stands the test of time. This rigorous process has given us everything from modern medicine to space exploration, fundamentally transforming human civilization in profound ways.",
    difficulty: "Hard",
  },
  {
    text: "Artificial intelligence and machine learning algorithms are reshaping industries worldwide at an unprecedented pace. These technologies analyze vast datasets to identify patterns invisible to human observers, enabling breakthroughs in healthcare diagnosis, financial forecasting, autonomous vehicles, and countless other domains. The ethical implications of AI development demand careful consideration from policymakers and technologists alike.",
    difficulty: "Hard",
  },
  {
    text: "Climate change represents one of the most significant challenges facing humanity in the twenty-first century. Rising global temperatures, melting ice caps, and increasingly severe weather events threaten ecosystems and human communities worldwide. Addressing this crisis requires international cooperation, technological innovation, and fundamental changes to how we produce and consume energy.",
    difficulty: "Hard",
  },
  // Expert (75+ words)
  {
    text: "The evolution of human language remains one of the most fascinating mysteries in anthropology and linguistics. Scholars debate whether language emerged gradually over millions of years or appeared relatively suddenly in our evolutionary history. What is clear is that language fundamentally transformed human society, enabling complex cooperation, abstract thinking, and the transmission of knowledge across generations. Modern languages contain thousands of words and intricate grammatical structures that children somehow master with remarkable ease, suggesting that humans possess innate language acquisition capabilities.",
    difficulty: "Expert",
  },
  {
    text: "Quantum mechanics fundamentally challenges our intuitive understanding of physical reality at the smallest scales. Particles exist in superposition states, occupying multiple positions simultaneously until observation collapses the wave function. Entangled particles remain mysteriously connected across vast distances, instantly influencing each other in ways that Einstein famously called spooky action at a distance. These counterintuitive phenomena have been repeatedly confirmed through rigorous experimentation, yet their philosophical implications continue to puzzle physicists and philosophers alike. Quantum computing promises to harness these strange properties for revolutionary computational power.",
    difficulty: "Expert",
  },
];

export default function TypingRace() {
  const [targetText, setTargetText] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [userInput, setUserInput] = useState("");
  const [startTime, setStartTime] = useState<number | null>(null);
  const [endTime, setEndTime] = useState<number | null>(null);
  const [gameActive, setGameActive] = useState(false);
  const [gameFinished, setGameFinished] = useState(false);
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const [personalBest, setPersonalBest] = useState<number | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem("pb-typing-race");
    if (saved) {
      setPersonalBest(parseInt(saved));
    }
    startNewGame();
  }, []);

  const startNewGame = () => {
    const randomParagraph =
      PARAGRAPHS[Math.floor(Math.random() * PARAGRAPHS.length)];
    setTargetText(randomParagraph.text);
    setDifficulty(randomParagraph.difficulty);
    setUserInput("");
    setStartTime(null);
    setEndTime(null);
    setGameActive(false);
    setGameFinished(false);
    setWpm(0);
    setAccuracy(100);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const calculateWPM = useCallback((chars: number, milliseconds: number) => {
    const minutes = milliseconds / 60000;
    const words = chars / 5; // Standard: 5 characters = 1 word
    return Math.round(words / minutes);
  }, []);

  const calculateAccuracy = useCallback(
    (input: string, target: string) => {
      if (input.length === 0) return 100;
      let correct = 0;
      const minLength = Math.min(input.length, target.length);
      for (let i = 0; i < minLength; i++) {
        if (input[i] === target[i]) correct++;
      }
      return Math.round((correct / target.length) * 100);
    },
    []
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const input = e.target.value;

    // Start timer on first keystroke
    if (!startTime && input.length > 0) {
      setStartTime(Date.now());
      setGameActive(true);
    }

    // Prevent typing beyond target text length
    if (input.length > targetText.length) return;

    setUserInput(input);

    // Calculate real-time stats
    if (startTime) {
      const elapsed = Date.now() - startTime;
      const currentWpm = calculateWPM(input.length, elapsed);
      const currentAccuracy = calculateAccuracy(input, targetText);
      setWpm(currentWpm);
      setAccuracy(currentAccuracy);
    }

    // Check if finished
    if (input === targetText) {
      const endTimeStamp = Date.now();
      setEndTime(endTimeStamp);
      setGameActive(false);
      setGameFinished(true);

      if (startTime) {
        const totalTime = endTimeStamp - startTime;
        const finalWpm = calculateWPM(targetText.length, totalTime);
        const finalAccuracy = calculateAccuracy(input, targetText);
        setWpm(finalWpm);
        setAccuracy(finalAccuracy);

        // Update personal best if accuracy is 100%
        if (
          finalAccuracy === 100 &&
          (!personalBest || finalWpm > personalBest)
        ) {
          setPersonalBest(finalWpm);
          localStorage.setItem("pb-typing-race", finalWpm.toString());
        }
      }
    }
  };

  const getCharClass = (index: number) => {
    if (index >= userInput.length) {
      // Not yet typed
      return index === userInput.length
        ? "bg-yellow-500/30 text-white" // Current position
        : "text-gray-400"; // Future chars
    }

    // Typed - check if correct or incorrect
    if (userInput[index] === targetText[index]) {
      return "text-green-400"; // Correct
    } else {
      return "text-red-400 bg-red-900/30"; // Incorrect
    }
  };

  const shareResults = () => {
    const timeTaken = endTime && startTime ? (endTime - startTime) / 1000 : 0;
    const text = `Typing Race Results\n\nWPM: ${wpm}\nAccuracy: ${accuracy}%\nTime: ${timeTaken.toFixed(1)}s\nDifficulty: ${difficulty}\n\nPlay at playmini.fun/typing-race`;

    if (navigator.share) {
      navigator.share({ text }).catch(() => {
        navigator.clipboard.writeText(text);
        alert("Results copied to clipboard!");
      });
    } else {
      navigator.clipboard.writeText(text);
      alert("Results copied to clipboard!");
    }
  };

  const formatTime = (ms: number) => {
    return (ms / 1000).toFixed(1);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
          Typing Race
        </h1>
        <p className="text-gray-400">
          Type the text as fast and accurately as you can!
        </p>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <div className="bg-slate-800 rounded-lg p-4 text-center border border-gray-700">
          <div className="text-2xl font-bold text-blue-400">{wpm}</div>
          <div className="text-gray-400 text-sm">WPM</div>
        </div>
        <div className="bg-slate-800 rounded-lg p-4 text-center border border-gray-700">
          <div className="text-2xl font-bold text-green-400">{accuracy}%</div>
          <div className="text-gray-400 text-sm">Accuracy</div>
        </div>
        <div className="bg-slate-800 rounded-lg p-4 text-center border border-gray-700">
          <div className="text-2xl font-bold text-purple-400">
            {startTime && !endTime
              ? formatTime(Date.now() - startTime)
              : endTime && startTime
              ? formatTime(endTime - startTime)
              : "0.0"}
            s
          </div>
          <div className="text-gray-400 text-sm">Time</div>
        </div>
        <div className="bg-slate-800 rounded-lg p-4 text-center border border-gray-700">
          <div className="text-2xl font-bold text-yellow-400">
            {personalBest || "—"}
          </div>
          <div className="text-gray-400 text-sm">Best WPM</div>
        </div>
      </div>

      {/* Difficulty Badge */}
      <div className="flex justify-center mb-4">
        <span
          className={`px-4 py-1 rounded-full text-sm font-bold ${
            difficulty === "Easy"
              ? "bg-green-900 text-green-300"
              : difficulty === "Medium"
              ? "bg-yellow-900 text-yellow-300"
              : difficulty === "Hard"
              ? "bg-orange-900 text-orange-300"
              : "bg-red-900 text-red-300"
          }`}
        >
          {difficulty}
        </span>
      </div>

      {/* Target Text Display */}
      <div className="bg-slate-800 rounded-lg p-6 mb-6 border border-gray-700">
        <div className="font-mono text-lg leading-relaxed whitespace-pre-wrap break-words">
          {targetText.split("").map((char, index) => (
            <span key={index} className={getCharClass(index)}>
              {char}
            </span>
          ))}
        </div>
      </div>

      {/* Input Area */}
      {!gameFinished && (
        <div className="bg-slate-800 rounded-lg p-6 mb-6 border border-gray-700">
          <textarea
            ref={inputRef}
            value={userInput}
            onChange={handleInputChange}
            className="w-full bg-slate-900 text-white font-mono text-lg p-4 rounded-lg border-2 border-gray-600 focus:border-blue-500 outline-none resize-none leading-relaxed"
            rows={6}
            placeholder="Start typing here..."
            spellCheck={false}
            autoCapitalize="off"
            autoCorrect="off"
          />
        </div>
      )}

      {/* Results Screen */}
      {gameFinished && (
        <div className="bg-slate-800 rounded-lg p-6 mb-6 border border-gray-700">
          <h2 className="text-3xl font-bold text-center mb-6">
            <span className="text-green-400">Race Complete!</span>
          </h2>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-400">{wpm}</div>
              <div className="text-gray-400">Words Per Minute</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-green-400">
                {accuracy}%
              </div>
              <div className="text-gray-400">Accuracy</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-purple-400">
                {endTime && startTime
                  ? formatTime(endTime - startTime)
                  : "0.0"}
                s
              </div>
              <div className="text-gray-400">Time Taken</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-yellow-400">
                {personalBest || "—"}
              </div>
              <div className="text-gray-400">Personal Best</div>
            </div>
          </div>

          {accuracy === 100 && personalBest === wpm && (
            <div className="text-center mb-6">
              <span className="text-yellow-400 font-bold text-lg">
                New Personal Best!
              </span>
            </div>
          )}

          <div className="flex gap-4">
            <button
              onClick={shareResults}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
            >
              Share Results
            </button>
            <button
              onClick={startNewGame}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
            >
              New Race
            </button>
          </div>
        </div>
      )}

      {/* Instructions */}
      {!gameActive && !gameFinished && (
        <div className="text-center text-gray-400">
          <p className="mb-2">Click the text box and start typing!</p>
          <p className="text-sm">
            Timer starts on your first keystroke. Type accurately for the best
            WPM score.
          </p>
        </div>
      )}
    </div>
  );
}
