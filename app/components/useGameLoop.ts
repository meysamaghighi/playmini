import { useEffect, useRef } from "react";

/**
 * Runs `callback(dtMs)` once per animation frame and cancels the RAF on unmount.
 * The cleanup is the point — calling requestAnimationFrame without
 * cancelAnimationFrame on unmount burns CPU after a user navigates away.
 *
 * The callback is held in a ref so it can close over fresh state without
 * restarting the loop on every render.
 *
 * @param callback  called each frame with the ms delta since the previous frame
 * @param enabled   when false, the loop does not run (defaults to true)
 */
export function useGameLoop(callback: (dtMs: number) => void, enabled = true) {
  const cbRef = useRef(callback);
  cbRef.current = callback;

  useEffect(() => {
    if (!enabled) return;
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = now - last;
      last = now;
      cbRef.current(dt);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [enabled]);
}
