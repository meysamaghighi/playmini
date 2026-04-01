import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "PlayMini - 31 Free Browser Games";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #0f172a 0%, #020617 100%)",
          position: "relative",
        }}
      >
        {/* Decorative game icons - top left */}
        <div
          style={{
            position: "absolute",
            top: 40,
            left: 60,
            fontSize: 48,
            opacity: 0.3,
            display: "flex",
          }}
        >
          🎮
        </div>

        {/* Decorative game icons - top right */}
        <div
          style={{
            position: "absolute",
            top: 50,
            right: 80,
            fontSize: 42,
            opacity: 0.3,
            display: "flex",
          }}
        >
          🧩
        </div>

        {/* Decorative game icons - bottom left */}
        <div
          style={{
            position: "absolute",
            bottom: 60,
            left: 80,
            fontSize: 40,
            opacity: 0.3,
            display: "flex",
          }}
        >
          🎯
        </div>

        {/* Decorative game icons - bottom right */}
        <div
          style={{
            position: "absolute",
            bottom: 70,
            right: 100,
            fontSize: 45,
            opacity: 0.3,
            display: "flex",
          }}
        >
          🎲
        </div>

        {/* Main content */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {/* Site name */}
          <div
            style={{
              fontSize: 96,
              fontWeight: 900,
              color: "white",
              letterSpacing: "-0.02em",
              marginBottom: 20,
              display: "flex",
            }}
          >
            PlayMini
          </div>

          {/* Tagline */}
          <div
            style={{
              fontSize: 36,
              color: "#9ca3af",
              letterSpacing: "-0.01em",
              display: "flex",
            }}
          >
            31 Free Browser Games
          </div>
        </div>

        {/* URL at bottom */}
        <div
          style={{
            position: "absolute",
            bottom: 40,
            fontSize: 24,
            color: "#6b7280",
            display: "flex",
          }}
        >
          playmini.fun
        </div>
      </div>
    ),
    { ...size }
  );
}
