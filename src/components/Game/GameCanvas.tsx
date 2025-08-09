import { useEffect, useRef } from "react";
import type { Obstacle } from "@/types/obstacles";
import type { PlayerState } from "@/types/player";

export type GameCanvasProps = {
  width: number; // logical width for game world
  height: number; // logical height for game world
  groundY: number;
  player: PlayerState;
  obstacles: Obstacle[];
  score: number;
  speed: number;
  gameOver: boolean;
  scale: number; // device-independent scale for responsive rendering
};

export function GameCanvas({ width, height, groundY, player, obstacles, score, speed, gameOver, scale }: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Configure canvas display size and internal scaling
    const displayWidth = Math.round(width * scale);
    const displayHeight = Math.round(height * scale);
    if (canvas.width !== displayWidth || canvas.height !== displayHeight) {
      canvas.width = displayWidth;
      canvas.height = displayHeight;
    }
    ctx.setTransform(scale, 0, 0, scale, 0, 0);

    // Clear & background using CSS variables via computed styles
    ctx.clearRect(0, 0, width, height);
    const styles = getComputedStyle(document.documentElement);
    const bg = styles.getPropertyValue("--color-background").trim() || "#ffffff";
    const fg = styles.getPropertyValue("--color-foreground").trim() || "#111827";
    const muted = styles.getPropertyValue("--color-muted").trim() || "#e5e7eb";
    const destructive = styles.getPropertyValue("--color-destructive").trim() || "#ef4444";

    // Background
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, width, height);

    // Ground line
    ctx.strokeStyle = muted;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, groundY + 0.5);
    ctx.lineTo(width, groundY + 0.5);
    ctx.stroke();

    // Parallax hints (simple)
    ctx.fillStyle = muted;
    for (let i = 0; i < 10; i++) {
      const x = ((i * 150 - (performance.now() / 10) % (width + 200)) + width + 200) % (width + 200) - 100;
      ctx.fillRect(x, groundY - 50, 40, 8);
    }

    // Player
    ctx.fillStyle = gameOver ? destructive : fg;
    ctx.fillRect(player.x, player.y, player.width, player.height);

    // Obstacles
    ctx.fillStyle = fg;
    for (const obs of obstacles) {
      ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
    }

    // HUD is rendered in DOM overlay for crisp UI
  }, [width, height, groundY, player, obstacles, score, speed, gameOver, scale]);

  return (
    <div className="w-full flex items-center justify-center">
      <canvas ref={canvasRef} className="h-auto w-full rounded-lg border border-border bg-card" />
    </div>
  );
}

export default GameCanvas;
