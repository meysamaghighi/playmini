import type { Metadata } from "next";
import TypingRace from "../components/TypingRace";
import MoreGames from "../components/MoreGames";

export const metadata: Metadata = {
  title: "Typing Race - Test Your Typing Speed Online | PlayMini",
  description:
    "Race against the clock in Typing Race! Test your typing speed and accuracy with varied difficulty levels. Track your WPM, beat your personal best, and share your results. Free online typing speed test!",
  keywords: [
    "typing race",
    "typing speed test",
    "WPM test",
    "typing game",
    "typing practice",
    "words per minute",
    "typing accuracy",
    "speed typing",
    "typing challenge",
    "typing trainer",
  ],
  openGraph: {
    title: "Typing Race - Test Your Typing Speed Online | PlayMini",
    description:
      "Race against the clock! Test your typing speed and accuracy with varied difficulty levels. Track your WPM and beat your personal best.",
    url: "https://playmini.fun/typing-race",
    siteName: "PlayMini",
    type: "website",
    images: [
      {
        url: "https://playmini.fun/og-image.png",
        width: 1200,
        height: 630,
        alt: "PlayMini - Typing Race Game",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Typing Race - Test Your Typing Speed Online | PlayMini",
    description:
      "Test your typing speed with varied difficulty levels. Track your WPM and beat your personal best!",
    images: ["https://playmini.fun/og-image.png"],
  },
};

export default function TypingRacePage() {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "How is WPM (Words Per Minute) calculated?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "WPM is calculated using the standard formula: total characters typed divided by 5 (one word = 5 characters), then divided by the time in minutes. For example, if you type 250 characters in 1 minute, your WPM is 50. The calculation updates in real-time as you type.",
        },
      },
      {
        "@type": "Question",
        name: "What do the different difficulty levels mean?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Typing Race includes four difficulty levels: Easy (20-30 words with simple vocabulary), Medium (35-50 words with everyday language), Hard (55-70 words with complex sentences), and Expert (75+ words with technical terminology). Each paragraph is randomly selected from the difficulty pool.",
        },
      },
      {
        "@type": "Question",
        name: "How do I improve my typing speed?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Practice regularly with Typing Race to build muscle memory. Focus on accuracy first—speed will follow naturally. Use proper finger positioning on the home row keys, look at the screen instead of your keyboard, and try progressively harder difficulty levels. Your personal best WPM is saved to track your progress.",
        },
      },
      {
        "@type": "Question",
        name: "Does accuracy affect my WPM score?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Your WPM reflects your raw typing speed, but accuracy is tracked separately as a percentage. To set a new personal best, you must complete the text with 100% accuracy. The game highlights correct characters in green and errors in red to help you spot mistakes immediately.",
        },
      },
    ],
  };

  const webAppSchema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Typing Race - Typing Speed Test",
    description:
      "Test your typing speed and accuracy with Typing Race. Choose from multiple difficulty levels, track your WPM in real-time, and beat your personal best.",
    url: "https://playmini.fun/typing-race",
    applicationCategory: "Game",
    operatingSystem: "Web Browser",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
  };

  return (
    <div className="min-h-screen bg-slate-900">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppSchema) }}
      />

      <TypingRace />

      {/* How to Play */}
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-slate-800 rounded-lg p-6 mb-8 border border-gray-700">
          <h2 className="text-2xl font-bold text-white mb-4">How to Play</h2>
          <ul className="space-y-3 text-gray-300">
            <li className="flex items-start">
              <span className="text-blue-400 mr-2">✓</span>
              <span>
                <strong>Start typing:</strong> Click the text box and begin
                typing the displayed text. The timer starts automatically on
                your first keystroke.
              </span>
            </li>
            <li className="flex items-start">
              <span className="text-green-400 mr-2">✓</span>
              <span>
                <strong>Green = Correct:</strong> Correctly typed characters
                appear in green. Focus on accuracy for the best results.
              </span>
            </li>
            <li className="flex items-start">
              <span className="text-red-400 mr-2">✓</span>
              <span>
                <strong>Red = Error:</strong> Mistakes are highlighted in red
                with a background. Backspace to fix errors before continuing.
              </span>
            </li>
            <li className="flex items-start">
              <span className="text-yellow-400 mr-2">✓</span>
              <span>
                <strong>Current position:</strong> The next character to type is
                highlighted with a yellow background.
              </span>
            </li>
            <li className="flex items-start">
              <span className="text-purple-400 mr-2">✓</span>
              <span>
                <strong>Real-time stats:</strong> Your WPM, accuracy, and time
                update as you type, giving instant feedback on your performance.
              </span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-400 mr-2">✓</span>
              <span>
                <strong>Personal best:</strong> Complete the text with 100%
                accuracy to set a new personal best WPM. Your record is saved
                locally.
              </span>
            </li>
          </ul>
        </div>

        {/* FAQ */}
        <div className="bg-slate-800 rounded-lg p-6 mb-8 border border-gray-700">
          <h2 className="text-2xl font-bold text-white mb-4">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">
                How is WPM (Words Per Minute) calculated?
              </h3>
              <p className="text-gray-300">
                WPM is calculated using the standard formula: total characters
                typed divided by 5 (one word = 5 characters), then divided by
                the time in minutes. For example, if you type 250 characters in
                1 minute, your WPM is 50. The calculation updates in real-time
                as you type.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">
                What do the different difficulty levels mean?
              </h3>
              <p className="text-gray-300">
                Typing Race includes four difficulty levels: Easy (20-30 words
                with simple vocabulary), Medium (35-50 words with everyday
                language), Hard (55-70 words with complex sentences), and Expert
                (75+ words with technical terminology). Each paragraph is
                randomly selected from the difficulty pool.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">
                How do I improve my typing speed?
              </h3>
              <p className="text-gray-300">
                Practice regularly with Typing Race to build muscle memory.
                Focus on accuracy first—speed will follow naturally. Use proper
                finger positioning on the home row keys, look at the screen
                instead of your keyboard, and try progressively harder
                difficulty levels. Your personal best WPM is saved to track your
                progress.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">
                Does accuracy affect my WPM score?
              </h3>
              <p className="text-gray-300">
                Your WPM reflects your raw typing speed, but accuracy is tracked
                separately as a percentage. To set a new personal best, you must
                complete the text with 100% accuracy. The game highlights
                correct characters in green and errors in red to help you spot
                mistakes immediately.
              </p>
            </div>
          </div>
        </div>

        {/* About */}
        <div className="bg-slate-800 rounded-lg p-6 mb-8 border border-gray-700">
          <h2 className="text-2xl font-bold text-white mb-4">
            About Typing Race
          </h2>
          <p className="text-gray-300 mb-4">
            Typing Race is a free online typing speed test that helps you
            measure and improve your typing skills. Type paragraphs of varying
            difficulty as fast and accurately as you can, with real-time
            feedback on every keystroke.
          </p>
          <p className="text-gray-300 mb-4">
            The game features 12+ carefully curated paragraphs across four
            difficulty levels: Easy, Medium, Hard, and Expert. Whether you're a
            beginner learning proper typing technique or an experienced typist
            pushing for higher WPM, Typing Race adapts to your skill level.
          </p>
          <p className="text-gray-300">
            Track your progress with detailed statistics including WPM, accuracy
            percentage, and time taken. Your personal best WPM (with 100%
            accuracy) is saved locally, allowing you to compete against yourself
            and watch your skills improve over time. Share your results with
            friends to compare typing speeds!
          </p>
        </div>
      </div>

      <MoreGames />
    </div>
  );
}
