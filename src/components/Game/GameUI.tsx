type GameUIProps = {
  running: boolean;
  gameOver: boolean;
  highScore: number;
  onStart: () => void;
  onRestart: () => void;
};

export function GameUI({ running, gameOver, highScore, onStart, onRestart }: GameUIProps) {
  if (!running && !gameOver) {
    return (
      <div className="mt-4 flex flex-col items-center gap-2">
        <button
          className="px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          onClick={onStart}
          aria-label="Start Game"
        >
          Start
        </button>
        <p className="text-xs text-muted-foreground">Press Space/ArrowUp to jump, ArrowDown to duck</p>
      </div>
    );
  }

  if (gameOver) {
    return (
      <div className="mt-4 flex flex-col items-center gap-2">
        <div className="text-foreground">Game Over</div>
        <div className="text-xs text-muted-foreground">High score: {Math.floor(highScore)}</div>
        <button
          className="px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
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
