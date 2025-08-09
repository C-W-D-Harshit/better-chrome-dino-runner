import { useCallback, useEffect, useRef } from "react";

export function useGameLoop(isRunning: boolean, onFrame: (deltaSeconds: number) => void) {
  const rafRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);

  const loop = useCallback(
    (timeMs: number) => {
      if (!isRunning) {
        lastTimeRef.current = null;
        rafRef.current = null;
        return;
      }

      const last = lastTimeRef.current ?? timeMs;
      const deltaSeconds = Math.min(0.05, (timeMs - last) / 1000); // clamp to avoid huge steps
      lastTimeRef.current = timeMs;

      onFrame(deltaSeconds);
      rafRef.current = requestAnimationFrame(loop);
    },
    [isRunning, onFrame]
  );

  useEffect(() => {
    if (!isRunning) {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      lastTimeRef.current = null;
      return;
    }

    rafRef.current = requestAnimationFrame(loop);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [isRunning, loop]);
}
