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
          className="px-4 py-2 rounded-md bg-black text-white hover:bg-zinc-800 focus-visible:outline-2"
          onClick={onStart}
          aria-label="Start Game"
        >
          Start
        </button>
        <p className="text-xs text-zinc-500">Press Space/ArrowUp to jump, ArrowDown to duck</p>
      </div>
    );
  }

  if (gameOver) {
    return (
      <div className="mt-4 flex flex-col items-center gap-2">
        <div className="text-zinc-700">Game Over</div>
        <div className="text-xs text-zinc-500">High score: {Math.floor(highScore)}</div>
        <button
          className="px-4 py-2 rounded-md bg-black text-white hover:bg-zinc-800 focus-visible:outline-2"
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
