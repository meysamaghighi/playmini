import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 180,
          height: 180,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #6366f1, #a855f7)",
          borderRadius: 40,
        }}
      >
        <svg width="100" height="100" viewBox="0 0 32 32" fill="none">
          <polygon points="11,8 22,16 11,24" fill="white" />
        </svg>
      </div>
    ),
    { ...size }
  );
}
