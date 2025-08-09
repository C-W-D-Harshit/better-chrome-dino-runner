import { useEffect, useState } from "react";

export type InputState = {
  jumpPressed: boolean; // space/up
  duckHeld: boolean; // down
};

export function useInput(): InputState {
  const [jumpPressed, setJumpPressed] = useState(false);
  const [duckHeld, setDuckHeld] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space" || e.code === "ArrowUp") {
        e.preventDefault();
        setJumpPressed(true);
      }
      if (e.code === "ArrowDown") {
        e.preventDefault();
        setDuckHeld(true);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === "Space" || e.code === "ArrowUp") {
        e.preventDefault();
        setJumpPressed(false);
      }
      if (e.code === "ArrowDown") {
        e.preventDefault();
        setDuckHeld(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  return { jumpPressed, duckHeld };
}
