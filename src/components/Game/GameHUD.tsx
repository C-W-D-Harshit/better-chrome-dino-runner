import { Pause, Play, Sun, Moon, Volume2, VolumeX } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
/**
 * Minimal, theme-aware HUD overlay for the Dino Runner.
 * Renders compact score and high-score at the top-right, and tiny control buttons at the top-left.
 * Uses shadcn/ui token classes via Tailwind v4.
 */
export type GameHUDProps = {
  /** Current score (non-negative finite number). */
  score: number;
  /** Persisted high score (non-negative finite number). */
  highScore: number;
  /** Current game speed (finite number). */
  speed: number;
  /** Whether the game is currently running. */
  running: boolean;
  /** Whether audio is currently enabled. */
  audioEnabled: boolean;
  /** Whether current theme is dark mode. */
  isDark: boolean;
  /** Toggle play/pause. */
  onToggleRunning: () => void;
  /** Toggle audio on/off. */
  onToggleAudio: () => void;
  /** Toggle theme light/dark. */
  onToggleTheme: () => void;
};

/**
 * Pads a non-negative finite integer to 5 digits for classic Dino-style look.
 */
function formatScore(value: number): string {
  const safe = Number.isFinite(value) && value >= 0 ? Math.floor(value) : 0;
  return String(safe).padStart(5, "0");
}

/**
 * Minimalist HUD with two regions:
 * - Top-left: round icon-only controls (Play/Pause, Audio, Theme)
 * - Top-right: compact score with high-score indicator
 */
export function GameHUD({
  score,
  highScore,
  speed,
  running,
  audioEnabled,
  isDark,
  onToggleRunning,
  onToggleAudio,
  onToggleTheme,
}: GameHUDProps) {
  // Defensive formatting to ensure stable UI regardless of internal state
  const scoreText = formatScore(score);
  const hiText = formatScore(highScore);
  const speedText = Number.isFinite(speed)
    ? String(Math.max(0, Math.round(speed)))
    : "0";

  return (
    <div className="pointer-events-none absolute inset-0">
      {/* Controls: top-left cluster */}
      <div className="pointer-events-auto absolute left-2 top-2 flex items-center gap-1.5 sm:gap-2">
        {/* Play/Pause */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              onClick={onToggleRunning}
              aria-label={running ? "Pause" : "Play"}
              className="h-8 w-8 rounded-full p-0 border-border bg-card text-foreground/80 hover:bg-card/80"
            >
              {running ? (
                <Pause className="size-4 sm:size-5" aria-hidden />
              ) : (
                <Play className="size-4 sm:size-5" aria-hidden />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent sideOffset={6}>
            {running ? "Pause" : "Play"}
          </TooltipContent>
        </Tooltip>

        {/* Audio */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              onClick={onToggleAudio}
              aria-label={audioEnabled ? "Mute" : "Unmute"}
              className="h-8 w-8 rounded-full p-0 border-border bg-card text-foreground/80 hover:bg-card/80"
            >
              {audioEnabled ? (
                <Volume2 className="size-4 sm:size-5" aria-hidden />
              ) : (
                <VolumeX className="size-4 sm:size-5" aria-hidden />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent sideOffset={6}>
            {audioEnabled ? "Mute" : "Unmute"}
          </TooltipContent>
        </Tooltip>

        {/* Theme */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              onClick={onToggleTheme}
              aria-label={isDark ? "Light mode" : "Dark mode"}
              className="h-8 w-8 rounded-full p-0 border-border bg-card text-foreground/80 hover:bg-card/80"
            >
              {isDark ? (
                <Sun className="size-4 sm:size-5" aria-hidden />
              ) : (
                <Moon className="size-4 sm:size-5" aria-hidden />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent sideOffset={6}>
            {isDark ? "Light mode" : "Dark mode"}
          </TooltipContent>
        </Tooltip>

        {/* Speed chip (subtle) */}
        <div className="hidden sm:inline-flex items-center gap-1 rounded-full border border-border bg-card/90 px-2 py-1 text-[10px] text-muted-foreground backdrop-blur">
          <span className="text-foreground/70">Spd</span>
          <span className="font-medium text-foreground tabular-nums font-mono">
            {speedText}
          </span>
        </div>
      </div>

      {/* Score: top-right minimal block */}
      <div className="pointer-events-none absolute right-2 top-2 select-none rounded-md border border-border bg-popover/80 px-2.5 py-1.5 backdrop-blur shadow-xs">
        <div className="flex items-baseline gap-2 font-mono">
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
            HI {hiText}
          </span>
          <span className="text-sm font-semibold tabular-nums text-foreground">
            {scoreText}
          </span>
        </div>
      </div>
    </div>
  );
}

export default GameHUD;
