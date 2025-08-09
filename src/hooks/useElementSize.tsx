import { useCallback, useLayoutEffect, useRef, useState } from "react";

export function useElementSize<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });

  const observe = useCallback((element: T) => {
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const box = entry.contentRect;
        setSize({ width: Math.round(box.width), height: Math.round(box.height) });
      }
    });
    ro.observe(element);
    return () => ro.disconnect();
  }, []);

  useLayoutEffect(() => {
    const element = ref.current;
    if (!element) return;
    const cleanup = observe(element as T);
    return cleanup;
  }, [observe]);

  return { ref, ...size } as { ref: React.RefObject<T>; width: number; height: number };
}
