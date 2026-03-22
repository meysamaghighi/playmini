"use client";

import { useCallback } from "react";

interface DownloadButtonProps {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  filename?: string;
  className?: string;
  label?: string;
}

export default function DownloadButton({
  canvasRef,
  filename = "playmini",
  className,
  label = "Save Image",
}: DownloadButtonProps) {
  const handleDownload = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      // Try share API first (best for mobile — saves to gallery)
      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, "image/png")
      );
      if (!blob) return;

      const file = new File([blob], `${filename}.png`, { type: "image/png" });

      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: filename,
        });
        return;
      }
    } catch {
      // Share cancelled or not supported — fall through to download
    }

    // Fallback: trigger download
    const dataUrl = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.download = `${filename}.png`;
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [canvasRef, filename]);

  return (
    <button
      onClick={handleDownload}
      className={
        className ??
        "px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm rounded-xl transition-all hover:scale-105 active:scale-95 flex items-center gap-1.5"
      }
    >
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0">
        <path d="M8 2v8m0 0l-3-3m3 3l3-3M3 12h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      {label}
    </button>
  );
}
