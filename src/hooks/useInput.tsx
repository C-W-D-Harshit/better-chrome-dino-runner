import { useEffect, useState, useCallback } from "react";

export type InputState = {
  jumpPressed: boolean; // space/up
  duckHeld: boolean; // down
  leftHeld: boolean; // ArrowLeft / A
  rightHeld: boolean; // ArrowRight / D
  pauseToken: number; // increments on each 'P' press
};

export type TouchInputActions = {
  triggerJump: () => void;
  setDuckHeld: (held: boolean) => void;
  setLeftHeld: (held: boolean) => void;
  setRightHeld: (held: boolean) => void;
  triggerPause: () => void;
};

export function useInput(): InputState & { touchActions: TouchInputActions } {
  const [jumpPressed, setJumpPressed] = useState(false);
  const [duckHeld, setDuckHeld] = useState(false);
  const [leftHeld, setLeftHeld] = useState(false);
  const [rightHeld, setRightHeld] = useState(false);
  const [pauseToken, setPauseToken] = useState(0);

  // Touch input actions for mobile controls
  const touchActions: TouchInputActions = {
    triggerJump: useCallback(() => {
      setJumpPressed(true);
      // Auto-release jump after a short time for mobile
      setTimeout(() => setJumpPressed(false), 100);
    }, []),
    
    setDuckHeld: useCallback((held: boolean) => {
      setDuckHeld(held);
    }, []),
    
    setLeftHeld: useCallback((held: boolean) => {
      setLeftHeld(held);
    }, []),
    
    setRightHeld: useCallback((held: boolean) => {
      setRightHeld(held);
    }, []),
    
    triggerPause: useCallback(() => {
      setPauseToken((t) => t + 1);
    }, [])
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space" || e.code === "ArrowUp" || e.code === "KeyW") {
        e.preventDefault();
        setJumpPressed(true);
      }
      if (e.code === "ArrowDown" || e.code === "KeyS") {
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
      if (e.code === "KeyP") {
        e.preventDefault();
        setPauseToken((t) => t + 1);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === "Space" || e.code === "ArrowUp" || e.code === "KeyW") {
        e.preventDefault();
        setJumpPressed(false);
      }
      if (e.code === "ArrowDown" || e.code === "KeyS") {
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

  return { jumpPressed, duckHeld, leftHeld, rightHeld, pauseToken, touchActions };
}
