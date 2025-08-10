import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import GameCanvas from "./GameCanvas";
import GameUI from "./GameUI";
import GameHUD from "./GameHUD";
import { MobileControls } from "./MobileControls";
import { useGameLoop } from "@/hooks/useGameLoop";
import { usePageVisibility } from "@/hooks/useVisibility";
import { useInput } from "@/hooks/useInput";
import { useElementSize } from "@/hooks/useElementSize";
import { useAudio } from "@/hooks/useAudio";
import { useTheme } from "@/components/ThemeProvider";
import { aabbIntersects } from "@/utils/collision";
import {
  CANVAS_HEIGHT,
  CANVAS_WIDTH,
  DUCK_HEIGHT,
  GROUND_Y,
  GRAVITY,
  INITIAL_SPEED,
  JUMP_VELOCITY,
  COYOTE_TIME_S,
  JUMP_BUFFER_S,
  MAX_FALL_SPEED,
  JUMP_CUT_MULTIPLIER,
  AIR_FAST_FALL_MULTIPLIER,
  FAST_FALL_MIN_DOWNWARD_VELOCITY,
  HORIZONTAL_MOVE_SPEED,
  PLAYER_HEIGHT,
  PLAYER_WIDTH,
  SPEED_INCREASE_PER_SECOND,
} from "@/utils/gameConstants";
import type { Obstacle } from "@/types/obstacles";
import type { PlayerState } from "@/types/player";
import type { Coin } from "@/types/collectibles";
import { ObstacleManager } from "@/components/Obstacles/ObstacleManager";
import { CoinManager } from "@/components/Collectibles/CoinManager";

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
    facing: "right",
  };
}

// obstacle and coin creation are handled by managers

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
  const audio = useAudio();
  const { theme, setTheme } = useTheme();

  const [running, setRunning] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(getStoredHighScore);
  const [speed, setSpeed] = useState(INITIAL_SPEED);
  const [coinsCollected, setCoinsCollected] = useState(0);
  const [topSpeed, setTopSpeed] = useState(INITIAL_SPEED);

  const playerRef = useRef<PlayerState>(createInitialPlayer());
  const obstaclesRef = useRef<Obstacle[]>([]);
  const coinsRef = useRef<Coin[]>([]);
  const obstacleManagerRef = useRef(new ObstacleManager());
  const coinManagerRef = useRef(new CoinManager());
  // timers handled by managers

  // Advanced jump/air control state
  const coyoteTimerRef = useRef(0);
  const jumpBufferTimerRef = useRef(0);
  const jumpHeldRef = useRef(false);
  // Pause edge detection
  const lastPauseTokenRef = useRef(0);

  const resetGame = useCallback(() => {
    playerRef.current = createInitialPlayer();
    obstaclesRef.current = [];
    coinsRef.current = [];
    obstacleManagerRef.current.reset();
    coinManagerRef.current.reset();
    setScore(0);
    setSpeed(INITIAL_SPEED);
    setTopSpeed(INITIAL_SPEED);
    setCoinsCollected(0);
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
      setTopSpeed((ts) => (speed > ts ? speed : ts));

      const player = playerRef.current;
      const obstacles = obstaclesRef.current;

      // Pause toggle via 'P' key: only act on edges
      if (input.pauseToken !== lastPauseTokenRef.current) {
        lastPauseTokenRef.current = input.pauseToken;
        setRunning((r) => !r);
      }

      // Start/Retry mapping is handled by a dedicated key listener effect when not running or ended

      // Track jump press for jump-cut & buffer
      if (input.jumpPressed && !jumpHeldRef.current) {
        jumpHeldRef.current = true;
        jumpBufferTimerRef.current = JUMP_BUFFER_S;
      } else if (!input.jumpPressed) {
        jumpHeldRef.current = false;
      }

      // Coyote time window after leaving ground
      if (player.onGround) {
        coyoteTimerRef.current = COYOTE_TIME_S;
      } else if (coyoteTimerRef.current > 0) {
        coyoteTimerRef.current -= dt;
      }

      // Decrease jump buffer timer
      if (jumpBufferTimerRef.current > 0) {
        jumpBufferTimerRef.current -= dt;
      }

      // Execute buffered jump if allowed within coyote window
      const canJump = (player.onGround || coyoteTimerRef.current > 0) && jumpBufferTimerRef.current > 0;
      if (canJump) {
        player.velocityY = -JUMP_VELOCITY;
        player.onGround = false;
        player.isJumping = true;
        jumpBufferTimerRef.current = 0;
        coyoteTimerRef.current = 0;
        audio.playJump();
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
        // Gravity with fall speed clamp
        player.velocityY += GRAVITY * dt;
        if (player.velocityY > MAX_FALL_SPEED) player.velocityY = MAX_FALL_SPEED;

        // Early release cuts upward velocity for variable jump height
        if (!jumpHeldRef.current && player.velocityY < 0) {
          player.velocityY += GRAVITY * dt * (JUMP_CUT_MULTIPLIER - 1);
        }

        // Fast-fall when holding down mid-air
        if (input.duckHeld) {
          if (player.velocityY < FAST_FALL_MIN_DOWNWARD_VELOCITY) {
            player.velocityY = FAST_FALL_MIN_DOWNWARD_VELOCITY;
          }
          if (player.velocityY > 0) {
            player.velocityY += GRAVITY * dt * (AIR_FAST_FALL_MULTIPLIER - 1);
          }
        }

        player.y += player.velocityY * dt;
        if (player.y + player.height >= GROUND_Y) {
          player.y = GROUND_Y - player.height;
          player.velocityY = 0;
          player.onGround = true;
          player.isJumping = false;
        }
      }

      // Horizontal player movement with clamping
      if (input.leftHeld) {
        player.x -= HORIZONTAL_MOVE_SPEED * dt;
      } else if (input.rightHeld) {
        player.x += HORIZONTAL_MOVE_SPEED * dt;
      }
      // Facing logic: only face left while left is held; otherwise face right
      player.facing = input.leftHeld ? "left" : "right";
      if (player.x < 10) player.x = 10;
      const maxX = CANVAS_WIDTH - player.width - 10;
      if (player.x > maxX) player.x = maxX;

      // Update managers
      obstacleManagerRef.current.update(dt, speed, score);
      obstaclesRef.current = obstacleManagerRef.current.get();
      coinManagerRef.current.update(dt, speed);
      coinsRef.current = coinManagerRef.current.get();

      // Collisions
      for (const o of obstacles) {
        if (
          aabbIntersects(
            player.x + 6,
            player.y + 4,
            player.width - 12,
            player.height - 8,
            o.x + 4,
            o.y + 2,
            o.width - 8,
            o.height - 4
          )
        ) {
          audio.playCrash();
          endGame();
          break;
        }
      }

      // Coin collection
      for (const c of coinsRef.current) {
        const intersects = aabbIntersects(
          player.x,
          player.y,
          player.width,
          player.height,
          c.x - c.radius,
          c.y - c.radius,
          c.radius * 2,
          c.radius * 2
        );
        if (intersects) {
          audio.playCoin();
          // Score effect: coin value
          setScore((s) => s + 100);
          setCoinsCollected((n) => n + 1);
          coinManagerRef.current.markCollected();
          coinManagerRef.current.remove(c.id);
        }
      }
    },
    [
      audio,
      endGame,
      gameOver,
      input.duckHeld,
      input.jumpPressed,
      input.pauseToken,
      input.leftHeld,
      input.rightHeld,
      resetGame,
      running,
      score,
      speed,
      visible,
    ]
  );

  useGameLoop(running, onFrame);

  // Map Space to Start/Restart only when game is not running or is ended; remove mapping when running
  useEffect(() => {
    if (running && !gameOver) return; // active only when idle or ended
    const handler = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        e.preventDefault();
        if (!running && !gameOver) {
          setRunning(true);
        } else if (gameOver) {
          resetGame();
          setRunning(true);
        }
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [running, gameOver, resetGame]);

  // Derived values for canvas render
  const playerForRender = useMemo(
    () => ({ ...playerRef.current }),
    [score, speed, running, gameOver]
  );
  const obstaclesForRender = useMemo(
    () => [...obstaclesRef.current],
    [score, speed, running, gameOver]
  );
  const coinsForRender = useMemo(
    () => [...coinsRef.current],
    [score, speed, running, gameOver]
  );

  // Responsive sizing - more aggressive scaling for mobile
  const { ref: containerRef, width: containerWidth } =
    useElementSize<HTMLDivElement>();
  
  // Check if mobile
  const isMobile = containerWidth <= 768;
  
  // More aggressive scaling for mobile to use more screen space
  let targetWidth;
  if (isMobile) {
    // On mobile, use almost full width but also consider viewport height
    const viewportHeight = window.innerHeight;
    const availableHeight = viewportHeight - 120; // Account for controls and UI
    const maxWidthFromHeight = (availableHeight / CANVAS_HEIGHT) * CANVAS_WIDTH;
    const maxWidthFromContainer = containerWidth - 16;
    
    targetWidth = Math.min(maxWidthFromHeight, maxWidthFromContainer, containerWidth * 0.98);
  } else {
    targetWidth = Math.min(Math.max(320, containerWidth - 32), 1000);
  }
  
  const scale = targetWidth / CANVAS_WIDTH;

  return (
    <div className="w-full min-h-screen flex flex-col items-center justify-center p-2 sm:p-4 md:p-6" data-theme={theme}>
      <div ref={containerRef} className="w-full max-w-[1100px]">
        {/* Title - smaller on mobile */}
        <div className="mb-2 sm:mb-3 flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-primary" aria-hidden />
          <h1 className="text-xs sm:text-sm md:text-base font-semibold text-foreground select-none">
            Better Chrome Dino Runner
          </h1>
        </div>
        <div className="relative">
          {/* Canvas with tap-to-jump for mobile */}
          <div 
            className={`relative ${isMobile ? 'mobile-canvas-wrapper' : ''}`}
            style={{ touchAction: 'manipulation' }}
            onTouchStart={(e) => {
              // Simple tap-to-jump on canvas area
              e.preventDefault();
              input.touchActions.triggerJump();
            }}
            onClick={() => {
              // Also allow click-to-jump for testing
              input.touchActions.triggerJump();
            }}
          >
            <GameCanvas
              width={CANVAS_WIDTH}
              height={CANVAS_HEIGHT}
              groundY={GROUND_Y}
              player={playerForRender}
              obstacles={obstaclesForRender}
              coins={coinsForRender}
              score={score}
              speed={speed}
              gameOver={gameOver}
              scale={Number.isFinite(scale) && scale > 0 ? scale : 1}
              theme={theme}
              running={running}
            />
          </div>

          {/* Minimal HUD overlay */}
          <GameHUD
            score={score}
            highScore={highScore}
            speed={speed}
            running={running}
            audioEnabled={audio.enabled}
            isDark={theme === "dark"}
            onToggleRunning={() => setRunning((r) => !r)}
            onToggleAudio={() => audio.setEnabled(!audio.enabled)}
            onToggleTheme={() => setTheme(theme === "dark" ? "light" : "dark")}
          />

          {/* Controls hint - completely hidden on mobile */}
          {!isMobile && (
            <div className="pointer-events-none absolute inset-x-0 bottom-2 flex justify-center">
              <div className="pointer-events-auto rounded-md border border-border bg-popover/70 px-2.5 py-1 text-[10px] text-muted-foreground backdrop-blur">
                <span className="hidden sm:inline">W/Up: Jump · S/Down: Duck/Fall · A/Left & D/Right: Move · </span>
                <span>Space: Start/Retry · P: Pause · Coins: +100</span>
              </div>
            </div>
          )}

          {!running && !gameOver && (
            <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center p-2">
              <div className="pointer-events-auto rounded-md border border-border bg-popover/70 backdrop-blur px-3 py-2">
                <div className="text-xs sm:text-sm text-muted-foreground">
                  <span className="block md:hidden">Tap to start</span>
                  <span className="hidden md:block">Press Space to start</span>
                </div>
              </div>
            </div>
          )}

          {gameOver && (
            <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center p-2">
              <div className="pointer-events-auto rounded-md border border-border bg-popover/70 backdrop-blur px-3 py-2">
                <div className="text-xs sm:text-sm text-muted-foreground">
                  <span className="block md:hidden">Crashed! Tap to retry</span>
                  <span className="hidden md:block">Crashed! Press Space to retry</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Game UI (stats, etc.) - smaller on mobile */}
        <div className={isMobile ? "mt-2" : ""}>
          <GameUI
            running={running}
            gameOver={gameOver}
            highScore={highScore}
            score={score}
            topSpeed={topSpeed}
            coinsCollected={coinsCollected}
            onStart={() => setRunning(true)}
            onRestart={() => {
              resetGame();
              setRunning(true);
            }}
          />
        </div>
      </div>

      {/* Mobile Controls */}
      <MobileControls
        touchActions={input.touchActions}
        running={running}
        gameOver={gameOver}
        onStart={() => setRunning(true)}
        onRestart={() => {
          resetGame();
          setRunning(true);
        }}
      />
    </div>
  );
}

export default Game;
