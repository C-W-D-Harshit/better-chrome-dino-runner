import { useCallback, useEffect, useRef, useState } from "react";

const STORAGE_KEY = "bcd_audioEnabled";

export function useAudio() {
  const [enabled, setEnabled] = useState<boolean>(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw == null) return true;
    return raw === "true";
  });

  const ctxRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, String(enabled));
  }, [enabled]);

  const ensureContext = useCallback(async (): Promise<AudioContext | null> => {
    if (!enabled) return null;
    if (!ctxRef.current) {
      const Ctx: typeof AudioContext | undefined =
        (window as unknown as { AudioContext?: typeof AudioContext }).AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!Ctx) return null;
      ctxRef.current = new Ctx();
    }
    if (ctxRef.current.state === "suspended") await ctxRef.current.resume();
    return ctxRef.current;
  }, [enabled]);

  const playBeep = useCallback(
    async (type: OscillatorType, freq: number, durationMs: number, volume = 0.05) => {
      const ctx = await ensureContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.value = freq;
      gain.gain.value = volume;
      osc.connect(gain).connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + durationMs / 1000);
    },
    [ensureContext]
  );

  const playJump = useCallback(() => playBeep("square", 650, 90, 0.06), [playBeep]);
  const playCoin = useCallback(() => playBeep("triangle", 880, 80, 0.06), [playBeep]);
  const playCrash = useCallback(() => playBeep("sawtooth", 180, 200, 0.08), [playBeep]);

  return { enabled, setEnabled, playJump, playCoin, playCrash };
}
