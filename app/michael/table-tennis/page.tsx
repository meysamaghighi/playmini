"use client";

import Link from "next/link";

const FONT = "'Caveat', 'Comic Sans MS', cursive";

export default function TableTennisPage() {
  return (
    <div className="fixed inset-0 z-[60] bg-black">
      <Link
        href="/michael"
        className="fixed top-4 left-4 z-[65] inline-block px-5 py-2 rounded-full bg-amber-600/90 hover:bg-amber-500 text-white text-lg font-bold border-2 border-amber-800 shadow-lg backdrop-blur-sm"
        style={{ fontFamily: FONT }}
      >
        ← back to Michael&apos;s Games
      </Link>
      <iframe
        src="/michael/table-tennis/index.html"
        title="Table Tennis"
        className="w-full h-full border-0"
        style={{ width: "100vw", height: "100dvh" }}
        allow="autoplay; fullscreen; gamepad; accelerometer; gyroscope"
      />
    </div>
  );
}
