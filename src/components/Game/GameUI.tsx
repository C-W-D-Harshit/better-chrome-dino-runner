// React import retained for JSX runtime and type context in some tooling
import { Button } from "@/components/ui/button";
import { RotateCcw, Play } from "lucide-react";

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
        <Button onClick={onStart} aria-label="Start Game" className="h-10 px-6">
          <Play className="size-4" />
          Start
        </Button>
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
        <Button
          onClick={onRestart}
          aria-label="Restart Game"
          className="h-10 px-6"
        >
          <RotateCcw className="size-4" />
          Restart
        </Button>
      </div>
    );
  }

  return null;
}

export default GameUI;
