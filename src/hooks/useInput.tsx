import { useEffect, useState } from "react";

export type InputState = {
  jumpPressed: boolean; // space/up
  duckHeld: boolean; // down
  leftHeld: boolean; // ArrowLeft / A
  rightHeld: boolean; // ArrowRight / D
};

export function useInput(): InputState {
  const [jumpPressed, setJumpPressed] = useState(false);
  const [duckHeld, setDuckHeld] = useState(false);
  const [leftHeld, setLeftHeld] = useState(false);
  const [rightHeld, setRightHeld] = useState(false);

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
      if (e.code === "ArrowLeft" || e.code === "KeyA") {
        e.preventDefault();
        setLeftHeld(true);
      }
      if (e.code === "ArrowRight" || e.code === "KeyD") {
        e.preventDefault();
        setRightHeld(true);
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
      if (e.code === "ArrowLeft" || e.code === "KeyA") {
        e.preventDefault();
        setLeftHeld(false);
      }
      if (e.code === "ArrowRight" || e.code === "KeyD") {
        e.preventDefault();
        setRightHeld(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  return { jumpPressed, duckHeld, leftHeld, rightHeld };
}
