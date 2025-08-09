import { useEffect, useRef } from "react";
import type { Obstacle } from "@/types/obstacles";
import type { PlayerState } from "@/types/player";
import type { Coin } from "@/types/collectibles";

export type GameCanvasProps = {
  width: number; // logical width for game world
  height: number; // logical height for game world
  groundY: number;
  player: PlayerState;
  obstacles: Obstacle[];
  coins?: Coin[];
  score: number;
  speed: number;
  gameOver: boolean;
  scale: number; // device-independent scale for responsive rendering
  theme: "light" | "dark" | "system"; // used to re-render on theme change
};

export function GameCanvas({
  width,
  height,
  groundY,
  player,
  obstacles,
  coins = [],
  score,
  speed,
  gameOver,
  scale,
  theme,
}: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  // Preloaded SVG image for cactus rendering on canvas
  const cactusImageRef = useRef<HTMLImageElement | null>(null);
  const cactusImageLoadedRef = useRef<boolean>(false);
  // Cache bottom transparent padding by rendered size so cactus sits on ground
  const cactusBaselinePadCacheRef = useRef<Map<string, number>>(new Map());
  // Bird SVG resources
  const birdImageRef = useRef<HTMLImageElement | null>(null);
  const birdImageLoadedRef = useRef<boolean>(false);

  // Preload the cactus SVG once. We'll tint it on an offscreen canvas to avoid
  // touching the main canvas compositing state.
  useEffect(() => {
    const img = new Image();
    img.decoding = "async";
    img.crossOrigin = "anonymous";
    img.src = "/cactus-svgrepo-com.svg";
    img.onload = () => {
      cactusImageRef.current = img;
      cactusImageLoadedRef.current = true;
    };
    img.onerror = () => {
      cactusImageLoadedRef.current = false;
    };
  }, []);

  // Preload the bird SVG once
  useEffect(() => {
    const img = new Image();
    img.decoding = "async";
    img.crossOrigin = "anonymous";
    img.src = "/gull-bird-flying-shape-svgrepo-com.svg";
    img.onload = () => {
      birdImageRef.current = img;
      birdImageLoadedRef.current = true;
    };
    img.onerror = () => {
      birdImageLoadedRef.current = false;
    };
  }, []);

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
    const rootStyles = getComputedStyle(document.documentElement);
    // Resolve from the nearest themed scope; fall back to root.
    const themedScope =
      (canvas.closest(".dark") as Element | null) ?? document.documentElement;
    const themeStyles = getComputedStyle(themedScope);
    // Use base variables that hold real color values (not indirections)
    const bg =
      themeStyles.getPropertyValue("--background").trim() ||
      rootStyles.getPropertyValue("--background").trim() ||
      "#ffffff";
    const fg =
      themeStyles.getPropertyValue("--foreground").trim() ||
      rootStyles.getPropertyValue("--foreground").trim() ||
      "#111827";
    const muted =
      themeStyles.getPropertyValue("--muted").trim() ||
      rootStyles.getPropertyValue("--muted").trim() ||
      "#e5e7eb";
    const destructive =
      themeStyles.getPropertyValue("--destructive").trim() ||
      rootStyles.getPropertyValue("--destructive").trim() ||
      "#ef4444";
    const accent =
      themeStyles.getPropertyValue("--accent").trim() ||
      rootStyles.getPropertyValue("--accent").trim() ||
      "#eab308";

    // Background
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, width, height);

    // Subtle parallax lines (background strips)
    ctx.save();
    ctx.globalAlpha = 0.6;
    ctx.fillStyle = muted;
    const t = performance.now() * 0.0004;
    for (let i = 0; i < 4; i++) {
      const y = groundY - 110 - i * 22;
      const speedMult = 0.4 + i * 0.2;
      for (let j = 0; j < 6; j++) {
        const x =
          ((j * 180 - ((t * speed * speedMult) % (width + 240)) + width + 240) %
            (width + 240)) -
          120;
        ctx.fillRect(x, y, 60 + i * 10, 3);
      }
    }
    ctx.restore();

    // Ground line
    ctx.strokeStyle = muted;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, groundY + 0.5);
    ctx.lineTo(width, groundY + 0.5);
    ctx.stroke();

    // Helper: shadow ellipse
    const drawShadow = (cx: number, cy: number, w: number, h: number) => {
      ctx.save();
      ctx.fillStyle = fg;
      ctx.globalAlpha = 0.12;
      ctx.beginPath();
      ctx.ellipse(cx, cy, w, h, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    };

    // Player drawing (minimalist dino silhouette with eye)
    const drawPlayer = () => {
      const px = player.x;
      const py = player.y;
      const pw = player.width;
      const ph = player.height;

      // Shadow
      // Shift the center slightly right from 0.5 to better match the sprite's visual centroid
      // (head extends left while tail extends right). Also make it a touch wider for stability.
      const playerShadowCenterX = px + pw * 0.55;
      const playerShadowWidth = Math.max(12, pw * 0.48);
      drawShadow(playerShadowCenterX, groundY + 4, playerShadowWidth, 5);

      ctx.save();
      ctx.fillStyle = gameOver ? destructive : fg;
      ctx.strokeStyle = gameOver ? destructive : fg;
      ctx.lineJoin = "round";
      ctx.lineCap = "round";

      // Mirror across the center so position remains aligned with shadow
      const mirror = player.facing === "right" ? -1 : 1;
      const originX = px + pw * 0.5;
      ctx.translate(originX, 0);
      ctx.scale(mirror, 1);

      // Body block
      const bodyW = pw * 0.6;
      const bodyH = ph * 0.55;
      const bodyX = px + pw * 0.2 - originX;
      const bodyY = py + ph - bodyH;
      ctx.fillRect(bodyX, bodyY, bodyW, bodyH);

      // Head
      const headW = pw * 0.5;
      const headH = ph * 0.35;
      const headX = px + pw * 0.05 - originX;
      const headY = py + ph * 0.1;
      ctx.fillRect(headX, headY, headW, headH);

      // Eye (small hole)
      ctx.save();
      ctx.globalCompositeOperation = "destination-out";
      ctx.beginPath();
      ctx.arc(
        headX + headW * 0.75,
        headY + headH * 0.45,
        Math.max(1.5, pw * 0.04),
        0,
        Math.PI * 2
      );
      ctx.fill();
      ctx.restore();

      // Legs animation
      const runT = performance.now() * 0.008 * (0.6 + speed / 600);
      const phase = Math.sin(runT);
      const legW = Math.max(3, pw * 0.12);
      const legH = Math.max(6, ph * 0.28);
      const legYOffset = player.onGround ? 0 : 2;
      const leg1X = bodyX + bodyW * 0.2;
      const leg2X = bodyX + bodyW * 0.65;
      const legBaseY = py + ph - legH + legYOffset;
      const leg1Off = Math.max(-3, Math.min(3, phase * 3));
      const leg2Off = -leg1Off;
      ctx.fillRect(leg1X, legBaseY + leg1Off, legW, legH);
      ctx.fillRect(leg2X, legBaseY + leg2Off, legW, legH);

      // Tail
      ctx.beginPath();
      const tailX = bodyX + bodyW;
      const tailY = bodyY + bodyH * 0.4;
      ctx.moveTo(tailX, tailY);
      ctx.lineTo(tailX + pw * 0.25, tailY - ph * 0.18);
      ctx.lineWidth = Math.max(2, pw * 0.06);
      ctx.stroke();

      ctx.restore();
    };

    // Cactus drawing
    const drawCactus = (ox: number, oy: number, ow: number, oh: number) => {
      // Shadow centered under cactus base. Use 0.5 to visually align with trunk.
      drawShadow(ox + ow * 0.5, groundY + 3, Math.max(10, ow * 0.42), 4);

      const img = cactusImageRef.current;
      const imgReady =
        cactusImageLoadedRef.current &&
        img !== null &&
        img.complete &&
        img.naturalWidth > 0 &&
        img.naturalHeight > 0;

      if (imgReady) {
        // Render on an offscreen canvas then blit, so we never change the
        // compositing mode of the main context.
        const offscreen = document.createElement("canvas");
        offscreen.width = Math.max(1, Math.floor(ow));
        offscreen.height = Math.max(1, Math.floor(oh));
        const octx = offscreen.getContext("2d");
        if (octx) {
          // Draw the vector image at target size
          octx.clearRect(0, 0, offscreen.width, offscreen.height);
          octx.drawImage(
            img as HTMLImageElement,
            0,
            0,
            offscreen.width,
            offscreen.height
          );
          // Tint using source-in on the offscreen buffer only
          octx.globalCompositeOperation = "source-in";
          octx.fillStyle = fg;
          octx.fillRect(0, 0, offscreen.width, offscreen.height);
          // Compute bottom transparent padding once per size and cache
          const cacheKey = `${offscreen.width}x${offscreen.height}`;
          let baselinePad = cactusBaselinePadCacheRef.current.get(cacheKey);
          if (baselinePad === undefined) {
            const imgData = octx.getImageData(
              0,
              0,
              offscreen.width,
              offscreen.height
            );
            const data = imgData.data;
            const w = offscreen.width;
            const h = offscreen.height;
            let bottomRow = h - 1;
            let found = false;
            outer: for (let y = h - 1; y >= 0; y--) {
              const rowStart = y * w * 4;
              for (let x = 0; x < w; x++) {
                if (data[rowStart + x * 4 + 3] > 0) {
                  bottomRow = y;
                  found = true;
                  break outer;
                }
              }
            }
            baselinePad = found ? h - 1 - bottomRow : 0;
            cactusBaselinePadCacheRef.current.set(cacheKey, baselinePad);
          }
          // Draw with baseline compensation so base touches ground
          const drawY = oy + (baselinePad ?? 0);
          ctx.drawImage(offscreen, ox, drawY, ow, oh);
          return;
        }
      }

      // Fallback: simple cactus silhouette if image is not yet ready
      ctx.save();
      ctx.fillStyle = fg;

      const trunkW = ow * 0.4;
      ctx.beginPath();
      ctx.moveTo(ox + trunkW, oy);
      ctx.lineTo(ox + trunkW, oy + oh);
      ctx.lineTo(ox + trunkW - trunkW, oy + oh);
      ctx.lineTo(ox + trunkW - trunkW, oy + oh * 0.25);
      ctx.closePath();
      ctx.fill();

      ctx.fillRect(
        ox + trunkW - trunkW * 0.9,
        oy + oh * 0.35,
        trunkW * 0.7,
        trunkW * 0.5
      );
      ctx.fillRect(
        ox + trunkW + trunkW * 0.2,
        oy + oh * 0.5,
        trunkW * 0.8,
        trunkW * 0.5
      );
      ctx.restore();
    };

    // Bird drawing with wing flaps
    const drawBird = (ox: number, oy: number, ow: number, oh: number) => {
      drawShadow(ox + ow * 0.5, groundY + 2, Math.max(8, ow * 0.35), 4);

      const img = birdImageRef.current;
      const ready =
        birdImageLoadedRef.current &&
        img !== null &&
        img.complete &&
        img.naturalWidth > 0 &&
        img.naturalHeight > 0;

      if (ready) {
        const off = document.createElement("canvas");
        off.width = Math.max(1, Math.floor(ow));
        off.height = Math.max(1, Math.floor(oh));
        const octx = off.getContext("2d");
        if (octx) {
          octx.clearRect(0, 0, off.width, off.height);
          // Mirror horizontally so the bird flies to the left
          octx.save();
          octx.translate(off.width, 0);
          octx.scale(-1, 1);
          octx.drawImage(img as HTMLImageElement, 0, 0, off.width, off.height);
          octx.restore();
          octx.globalCompositeOperation = "source-in";
          octx.fillStyle = fg;
          octx.fillRect(0, 0, off.width, off.height);
          ctx.drawImage(off, ox, oy, ow, oh);
          return;
        }
      }

      // Fallback: simple bird
      ctx.save();
      ctx.fillStyle = fg;
      const flap = Math.sin(performance.now() * 0.02 + ox * 0.05);
      // Body
      ctx.beginPath();
      ctx.ellipse(
        ox + ow * 0.5,
        oy + oh * 0.55,
        ow * 0.45,
        oh * 0.35,
        0,
        0,
        Math.PI * 2
      );
      ctx.fill();
      // Wing
      ctx.beginPath();
      const wingY = oy + oh * (flap > 0 ? 0.25 : 0.05);
      ctx.moveTo(ox + ow * 0.45, oy + oh * 0.45);
      ctx.lineTo(ox + ow * 0.2, wingY);
      ctx.lineTo(ox + ow * 0.55, oy + oh * 0.35);
      ctx.closePath();
      ctx.fill();
      // Beak (small triangle)
      ctx.beginPath();
      ctx.moveTo(ox + ow * 0.92, oy + oh * 0.5);
      ctx.lineTo(ox + ow, oy + oh * 0.48);
      ctx.lineTo(ox + ow * 0.92, oy + oh * 0.54);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    };

    // Draw player
    drawPlayer();

    // Draw obstacles by type
    for (const obs of obstacles) {
      if (obs.type === "cactus") {
        drawCactus(obs.x, obs.y, obs.width, obs.height);
      } else {
        drawBird(obs.x, obs.y, obs.width, obs.height);
      }
    }

    // Coins with slight glow
    for (const coin of coins) {
      drawShadow(coin.x, groundY + 2, coin.radius * 0.8, 3);
      ctx.save();
      ctx.fillStyle = accent;
      ctx.strokeStyle = fg;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(coin.x, coin.y, coin.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 0.25;
      ctx.stroke();
      ctx.globalAlpha = 1;
      // highlight
      ctx.beginPath();
      ctx.strokeStyle = "#ffffff";
      ctx.globalAlpha = 0.3;
      ctx.arc(
        coin.x - coin.radius * 0.3,
        coin.y - coin.radius * 0.3,
        coin.radius * 0.6,
        Math.PI * 0.9,
        Math.PI * 1.8
      );
      ctx.stroke();
      ctx.restore();
    }

    // HUD is rendered in DOM overlay for crisp UI
  }, [
    width,
    height,
    groundY,
    player,
    obstacles,
    coins,
    score,
    speed,
    gameOver,
    scale,
    theme,
  ]);

  return (
    <div className="w-full flex items-center justify-center">
      <canvas
        ref={canvasRef}
        className="h-auto w-full rounded-lg border border-border bg-card"
      />
    </div>
  );
}

export default GameCanvas;
