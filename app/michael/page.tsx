import Link from "next/link";

const FONT = "'Caveat', 'Comic Sans MS', cursive";

const games = [
  {
    href: "/michael/stick-wars",
    title: "Stick Wars",
    description: "A war between sticks!",
    sketchPlaceholder: true,
    rotate: "-3deg",
    color: "#22c55e",
  },
  {
    href: "/michael/army-vs-army",
    title: "Army vs Army",
    description: "Launch airplanes, sink the enemy warship!",
    sketchPlaceholder: true,
    rotate: "2deg",
    color: "#1e40af",
  },
];

export default function MichaelHome() {
  return (
    <main
      className="min-h-screen px-4 py-8"
      style={{
        background:
          "repeating-linear-gradient(0deg, #fef9e7, #fef9e7 24px, #f5edd0 24px, #f5edd0 25px)",
      }}
    >
      <div className="max-w-4xl mx-auto">
        <Link
          href="/"
          className="inline-block text-amber-800 hover:text-amber-600 text-lg mb-4"
          style={{ fontFamily: FONT }}
        >
          ← back to PlayMini
        </Link>

        <header className="text-center mb-10">
          <h1
            className="text-6xl sm:text-7xl font-black text-amber-900 mb-2"
            style={{ fontFamily: FONT, transform: "rotate(-2deg)" }}
          >
            Michael&apos;s Games
          </h1>
          <p
            className="text-2xl text-amber-700"
            style={{ fontFamily: FONT }}
          >
            Designed by Michael. Built by Dad.
          </p>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
          {games.map((game) => (
            <Link
              key={game.href}
              href={game.href}
              className="block bg-white rounded-2xl p-6 border-4 border-amber-700 shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all"
              style={{ transform: `rotate(${game.rotate})` }}
            >
              <div
                className="aspect-square rounded-xl mb-4 flex items-center justify-center border-2 border-dashed border-amber-400 bg-amber-50"
                style={{ color: game.color }}
              >
                {game.sketchPlaceholder ? (
                  <div className="text-center px-4">
                    <div className="text-6xl mb-2">📷</div>
                    <p
                      className="text-xl text-amber-600"
                      style={{ fontFamily: FONT }}
                    >
                      Sketch coming soon
                    </p>
                  </div>
                ) : null}
              </div>
              <h2
                className="text-3xl font-bold text-amber-900 mb-1"
                style={{ fontFamily: FONT }}
              >
                {game.title}
              </h2>
              <p
                className="text-xl text-amber-700"
                style={{ fontFamily: FONT }}
              >
                {game.description}
              </p>
              <div
                className="mt-4 inline-block px-6 py-2 bg-amber-600 text-white rounded-full text-xl font-bold"
                style={{ fontFamily: FONT }}
              >
                Play →
              </div>
            </Link>
          ))}
        </div>

        <p
          className="text-center text-amber-600 text-xl mt-12"
          style={{ fontFamily: FONT }}
        >
          More games coming soon!
        </p>
      </div>
    </main>
  );
}
