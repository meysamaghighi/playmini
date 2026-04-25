import StickWarsGame from "./StickWarsGame";
import Link from "next/link";

const FONT = "'Caveat', 'Comic Sans MS', cursive";

export default function StickWarsPage() {
  return (
    <main
      className="min-h-screen px-4 py-6"
      style={{
        background:
          "repeating-linear-gradient(0deg, #fef9e7, #fef9e7 24px, #f5edd0 24px, #f5edd0 25px)",
      }}
    >
      <div className="max-w-5xl mx-auto">
        <Link
          href="/michael"
          className="inline-block text-amber-800 hover:text-amber-600 text-lg mb-3"
          style={{ fontFamily: FONT }}
        >
          ← back to Michael&apos;s Games
        </Link>
        <StickWarsGame />
      </div>
    </main>
  );
}
