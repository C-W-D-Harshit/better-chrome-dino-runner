import { useEffect, useRef } from "react";
import type { Obstacle } from "@/types/obstacles";
import type { PlayerState } from "@/types/player";

export type GameCanvasProps = {
  width: number;
  height: number;
  groundY: number;
  player: PlayerState;
  obstacles: Obstacle[];
  score: number;
  speed: number;
  gameOver: boolean;
};

export function GameCanvas({ width, height, groundY, player, obstacles, score, speed, gameOver }: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear
    ctx.clearRect(0, 0, width, height);

    // Sky
    ctx.fillStyle = "#f6f7fb";
    ctx.fillRect(0, 0, width, height);

    // Ground line
    ctx.strokeStyle = "#b2b7c2";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, groundY + 0.5);
    ctx.lineTo(width, groundY + 0.5);
    ctx.stroke();

    // Parallax hints (simple)
    ctx.fillStyle = "#e3e7ef";
    for (let i = 0; i < 10; i++) {
      const x = ((i * 150 - (performance.now() / 10) % (width + 200)) + width + 200) % (width + 200) - 100;
      ctx.fillRect(x, groundY - 50, 40, 8);
    }

    // Player
    ctx.fillStyle = gameOver ? "#ef4444" : "#111827";
    ctx.fillRect(player.x, player.y, player.width, player.height);

    // Obstacles
    ctx.fillStyle = "#374151";
    for (const obs of obstacles) {
      ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
    }

    // HUD
    ctx.fillStyle = "#111827";
    ctx.font = "16px ui-sans-serif, system-ui";
    ctx.textAlign = "right";
    ctx.fillText(`SPEED ${Math.round(speed)}`, width - 12, 22);
    ctx.fillText(`${Math.floor(score).toString().padStart(5, "0")}`, width - 12, 42);
  }, [width, height, groundY, player, obstacles, score, speed, gameOver]);

  return (
    <div className="w-full flex items-center justify-center">
      <canvas ref={canvasRef} width={width} height={height} className="rounded-md shadow-sm bg-white" />
    </div>
  );
}

export default GameCanvas;
