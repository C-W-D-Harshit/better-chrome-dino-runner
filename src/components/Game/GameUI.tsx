import React from "react";

/**
 * Minimal start/restart UI. Main HUD is handled in-canvas/overlay.
 */
export type GameUIProps = {
  running: boolean;
  gameOver: boolean;
  highScore: number;
  onStart: () => void;
  onRestart: () => void;
};

export function GameUI({
  running,
  gameOver,
  highScore,
  onStart,
  onRestart,
}: GameUIProps) {
  if (!running && !gameOver) {
    return (
      <div className="mt-6 flex flex-col items-center gap-3">
        <button
          className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          onClick={onStart}
          aria-label="Start Game"
        >
          Start
        </button>
        <p className="text-xs text-muted-foreground">
          Press Space/ArrowUp to jump, ArrowDown to duck
        </p>
      </div>
    );
  }

  if (gameOver) {
    return (
      <div className="mt-6 flex flex-col items-center gap-3">
        <div className="text-sm font-medium text-foreground">Game Over</div>
        <div className="text-xs text-muted-foreground">
          High score: {Math.floor(highScore)}
        </div>
        <button
          className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          onClick={onRestart}
          aria-label="Restart Game"
        >
          Restart
        </button>
      </div>
    );
  }

  return null;
}

export default GameUI;
