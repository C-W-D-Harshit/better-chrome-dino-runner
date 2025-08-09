import { useCallback, useMemo, useRef, useState } from "react";
import GameCanvas from "./GameCanvas";
import GameUI from "./GameUI";
import { useGameLoop } from "@/hooks/useGameLoop";
import { usePageVisibility } from "@/hooks/useVisibility";
import { useInput } from "@/hooks/useInput";
import { aabbIntersects } from "@/utils/collision";
import {
  BIRD_UNLOCK_SCORE,
  CANVAS_HEIGHT,
  CANVAS_WIDTH,
  DUCK_HEIGHT,
  GROUND_Y,
  GRAVITY,
  INITIAL_SPEED,
  JUMP_VELOCITY,
  MAX_SPAWN_INTERVAL_S,
  MIN_SPAWN_INTERVAL_S,
  PLAYER_HEIGHT,
  PLAYER_WIDTH,
  SPEED_INCREASE_PER_SECOND,
} from "@/utils/gameConstants";
import type { Obstacle } from "@/types/obstacles";
import type { PlayerState } from "@/types/player";

function createInitialPlayer(): PlayerState {
  return {
    x: 60,
    y: GROUND_Y - PLAYER_HEIGHT,
    width: PLAYER_WIDTH,
    height: PLAYER_HEIGHT,
    velocityY: 0,
    isJumping: false,
    isDucking: false,
    onGround: true,
  };
}

function createCactus(speed: number): Obstacle {
  const sizeVariant = Math.random();
  const w = sizeVariant < 0.5 ? 20 : sizeVariant < 0.85 ? 30 : 45;
  const h = w * 1.6;
  return {
    id: Math.random().toString(36).slice(2),
    type: "cactus",
    x: CANVAS_WIDTH + 20,
    y: GROUND_Y - h,
    width: w,
    height: h,
    speed,
  };
}

function createBird(speed: number): Obstacle {
  const h = 24;
  const w = 34;
  const altitudeVariant = Math.random();
  const y = altitudeVariant < 0.5 ? GROUND_Y - h - 60 : GROUND_Y - h - 110;
  return {
    id: Math.random().toString(36).slice(2),
    type: "bird",
    x: CANVAS_WIDTH + 20,
    y,
    width: w,
    height: h,
    speed: speed + 40,
  };
}

function getStoredHighScore(): number {
  const raw = localStorage.getItem("bcd_highScore");
  const parsed = raw ? Number(raw) : 0;
  return Number.isFinite(parsed) ? parsed : 0;
}

function setStoredHighScore(score: number): void {
  localStorage.setItem("bcd_highScore", String(Math.floor(score)));
}

export function Game() {
  const visible = usePageVisibility();
  const input = useInput();

  const [running, setRunning] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(getStoredHighScore);
  const [speed, setSpeed] = useState(INITIAL_SPEED);

  const playerRef = useRef<PlayerState>(createInitialPlayer());
  const obstaclesRef = useRef<Obstacle[]>([]);
  const spawnTimerRef = useRef(0);
  const nextSpawnIntervalRef = useRef(
    MIN_SPAWN_INTERVAL_S + Math.random() * (MAX_SPAWN_INTERVAL_S - MIN_SPAWN_INTERVAL_S)
  );

  const resetGame = useCallback(() => {
    playerRef.current = createInitialPlayer();
    obstaclesRef.current = [];
    spawnTimerRef.current = 0;
    nextSpawnIntervalRef.current = MIN_SPAWN_INTERVAL_S + Math.random() * (MAX_SPAWN_INTERVAL_S - MIN_SPAWN_INTERVAL_S);
    setScore(0);
    setSpeed(INITIAL_SPEED);
    setGameOver(false);
  }, []);

  const endGame = useCallback(() => {
    setRunning(false);
    setGameOver(true);
    setHighScore((prev) => {
      const newHigh = Math.max(prev, score);
      setStoredHighScore(newHigh);
      return newHigh;
    });
  }, [score]);

  const onFrame = useCallback(
    (dt: number) => {
      // Pause if not visible
      if (!visible) return;

      // Increase speed and score
      setSpeed((s) => s + SPEED_INCREASE_PER_SECOND * dt);
      setScore((sc) => sc + (speed * dt) / 10);

      const player = playerRef.current;
      const obstacles = obstaclesRef.current;

      // Handle input: Jump
      if (input.jumpPressed && player.onGround && !player.isJumping) {
        player.velocityY = -JUMP_VELOCITY;
        player.onGround = false;
        player.isJumping = true;
      }

      // Ducking
      player.isDucking = input.duckHeld && player.onGround;
      if (player.isDucking) {
        // Adjust height while ducking
        const prevBottom = player.y + player.height;
        player.height = DUCK_HEIGHT;
        player.y = prevBottom - player.height;
      } else {
        const prevBottom = player.y + player.height;
        player.height = PLAYER_HEIGHT;
        player.y = prevBottom - player.height;
      }

      // Physics integration for vertical motion
      if (!player.onGround) {
        player.velocityY += GRAVITY * dt;
        player.y += player.velocityY * dt;
        if (player.y + player.height >= GROUND_Y) {
          player.y = GROUND_Y - player.height;
          player.velocityY = 0;
          player.onGround = true;
          player.isJumping = false;
        }
      }

      // Spawn obstacles
      spawnTimerRef.current += dt;
      const currentSpawnInterval = nextSpawnIntervalRef.current;
      if (spawnTimerRef.current >= currentSpawnInterval) {
        spawnTimerRef.current = 0;
        nextSpawnIntervalRef.current = MIN_SPAWN_INTERVAL_S + Math.random() * (MAX_SPAWN_INTERVAL_S - MIN_SPAWN_INTERVAL_S);
        const canSpawnBird = score >= BIRD_UNLOCK_SCORE && Math.random() < 0.3;
        const newObstacle = canSpawnBird ? createBird(speed) : createCactus(speed);
        obstacles.push(newObstacle);
      }

      // Move obstacles and recycle
      for (let i = obstacles.length - 1; i >= 0; i--) {
        const o = obstacles[i];
        o.x -= speed * dt;
        if (o.x + o.width < -50) {
          obstacles.splice(i, 1);
        }
      }

      // Collisions
      for (const o of obstacles) {
        if (
          aabbIntersects(player.x + 6, player.y + 4, player.width - 12, player.height - 8, o.x + 4, o.y + 2, o.width - 8, o.height - 4)
        ) {
          endGame();
          break;
        }
      }
    },
    [endGame, input.duckHeld, input.jumpPressed, score, speed, visible]
  );

  useGameLoop(running, onFrame);

  // Derived values for canvas render
  const playerForRender = useMemo(() => ({ ...playerRef.current }), [score, speed, running, gameOver]);
  const obstaclesForRender = useMemo(() => [...obstaclesRef.current], [score, speed, running, gameOver]);

  return (
    <div className="w-full min-h-screen flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-[900px]">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-primary" />
            <h1 className="text-lg font-semibold text-foreground">Better Chrome Dino Runner</h1>
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-3 py-1.5">
              <span className="text-foreground/70">Speed</span>
              <span className="font-medium text-foreground tabular-nums">{Math.round(speed)}</span>
            </div>
            <div className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-3 py-1.5">
              <span className="text-foreground/70">Score</span>
              <span className="font-medium text-foreground tabular-nums">{Math.floor(score).toString().padStart(5, "0")}</span>
            </div>
            <div className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-3 py-1.5">
              <span className="text-foreground/70">High</span>
              <span className="font-medium text-foreground tabular-nums">{Math.floor(highScore).toString().padStart(5, "0")}</span>
            </div>
          </div>
        </div>

        <div className="relative">
          <GameCanvas
            width={CANVAS_WIDTH}
            height={CANVAS_HEIGHT}
            groundY={GROUND_Y}
            player={playerForRender}
            obstacles={obstaclesForRender}
            score={score}
            speed={speed}
            gameOver={gameOver}
          />

          {!running && !gameOver && (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <div className="pointer-events-auto rounded-md border border-border bg-popover/70 backdrop-blur px-4 py-3">
                <div className="text-sm text-muted-foreground">Press Space to start</div>
              </div>
            </div>
          )}

          {gameOver && (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <div className="pointer-events-auto rounded-md border border-border bg-popover/70 backdrop-blur px-4 py-3">
                <div className="text-sm text-muted-foreground">Crashed! Press Space to retry</div>
              </div>
            </div>
          )}
        </div>

        <GameUI
          running={running}
          gameOver={gameOver}
          highScore={highScore}
          onStart={() => setRunning(true)}
          onRestart={() => {
            resetGame();
            setRunning(true);
          }}
        />
      </div>
    </div>
  );
}

export default Game;
