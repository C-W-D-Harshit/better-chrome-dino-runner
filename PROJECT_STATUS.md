# Better Chrome Dino Runner — Project Status

Updated: 2025-08-09

## Overview

A modern, minimalist, theme-aware Dino Runner built with React + TypeScript + Vite and TailwindCSS (shadcn/ui tokens). The app has evolved from an MVP to a more production-ready architecture with game managers, audio, responsive canvas scaling, and a clean UI.

## Tech & Repo Context

- Framework: React 19 + TypeScript
- Build: Vite + SWC
- Styling: TailwindCSS v4 with shadcn/ui token system
- Icons/Components: (ready to integrate) lucide-react, shadcn/ui
- Package manager: pnpm
- Aliases: `@ → ./src`
- Theme: light/dark via CSS variables; `.dark` class on `documentElement`
- Useful docs: `CLAUDE.md`, `PWD.md`

## Implemented Features (so far)

- Core game loop (60fps) with `requestAnimationFrame`
- Physics: gravity, jump, duck, ground collision
- Obstacles: cactus/bird with a dedicated manager and difficulty unlock for birds
- Collectibles: coins with a simple manager, two altitude lanes, +10 score on pickup
- Collision detection: AABB with slight hitbox padding
- Score & speed progression: acceleration over time; score scales with distance and coins
- Game states: running, game over; high score persistence
- Input: Space/ArrowUp jump; ArrowDown duck; Space to start/retry with browser scrolling prevented
- Audio: Web Audio beeps for jump/coin/crash; persisted mute toggle
- UI: minimal top bar with stat chips (Speed/Score/High), Play/Pause, Mute/Unmute, Theme toggle
- Canvas: theme-aware rendering using CSS variables (background/foreground/muted/destructive/accent)
- Responsiveness: container-measured, scale-adjusted canvas; compact stat chips and overlays on small screens
- Theming: full replacement of static colors with shadcn tokens (`bg-card`, `bg-background`, `text-foreground`, etc.)

## Current Controls

- Jump: Space or ArrowUp
- Duck: ArrowDown (hold)
- Start: Space (from idle)
- Retry: Space (from game over)
- Top bar: Play/Pause, Mute/Unmute, Dark/Light toggle

## Persistence Keys

- High score: `bcd_highScore` (number)
- Audio enabled: `bcd_audioEnabled` ("true" | "false")
- Theme: `bcd_theme` ("dark" | "light")

## Files Added/Updated

- Components
  - Added: `src/components/Game/Game.tsx` (main controller)
  - Added: `src/components/Game/GameCanvas.tsx` (canvas renderer, theme-aware)
  - Added: `src/components/Game/GameUI.tsx` (start/retry overlays)
  - Added: `src/components/Obstacles/ObstacleManager.ts`
  - Added: `src/components/Collectibles/CoinManager.ts`
- Hooks
  - Added: `src/hooks/useGameLoop.tsx`
  - Added: `src/hooks/useInput.tsx` (prevents page scroll on Space/Arrows)
  - Added: `src/hooks/useVisibility.tsx`
  - Added: `src/hooks/useAudio.tsx` (Web Audio; persisted)
  - Added: `src/hooks/useElementSize.tsx` (responsive container sizing)
  - Added: `src/hooks/useTheme.tsx` (dark/light persisted; syncs with system)
- Types
  - Added: `src/types/player.ts`, `src/types/obstacles.ts`, `src/types/game.ts`, `src/types/collectibles.ts`
- Utils
  - Added: `src/utils/gameConstants.ts`, `src/utils/collision.ts`, `src/utils/physics.ts`
- App
  - Updated: `src/App.tsx` to render `Game`
  - Tailwind/theme: `src/index.css` uses shadcn tokens; `antialiased`

## UI/UX Notes

- Design language: minimalist, theme-first, high contrast, token-driven colors
- Stats: tabular numerals; subtle card chips with borders for clarity
- Overlays: glassy `bg-popover/70` with `backdrop-blur`, compact text for mobile
- Canvas: rounded, bordered, and inherits theme via CSS variables

## Build/Lint

- Dev: `pnpm dev`
- Build: `pnpm build` (verified)
- Lint: `pnpm lint` (passes; minor hook dependency warnings remain)

## Known Warnings

- `react-hooks/exhaustive-deps` warnings for `useMemo` in `Game.tsx` (safe; memo inputs tied to broader UI refresh triggers).

## Remaining Work (Roadmap)

1. Visual polish
   - Replace rectangles with sprite art (player run/duck/jump, cacti, birds, coins)
   - Basic particles (dust trail, coin sparkle, crash puff) with simple pooling
   - Parallax backgrounds (foreground/midground/background) using theme-aware palettes
2. UX & Settings
   - Settings modal/drawer: difficulty presets, keybindings, audio volume, reduced motion, color theme
   - In-canvas HUD toggle; optional frame-time/debug overlay
   - Pause menu with resume/restart/quit
3. Gameplay depth
   - Power-ups (shield, speed boost, slow-mo, magnet) with icons and timers
   - Combo/multiplier logic and subtle feedback
   - Achievements + toasts (distance, survival streaks, coin milestones)
4. Performance & Stability
   - Object pooling for coins/obstacles/particles
   - Frame budget tuning on low-end/mobile; adaptive effect quality
   - Battery/visibility strategies (already pause on hidden; add reduced motion)
5. Audio
   - Replace beeps with proper SFX; add BGM with volume control
   - Audio sprite or buffer pooling to minimize start latency
6. PWA / Distribution
   - Add Vite PWA plugin, manifest (name/icons/theme_color), and service worker for offline
   - Install prompt and app icon set; iOS splash/background handling
7. Data & Persistence
   - Extend storage (`bcd_*`) schema for settings, achievements, last run snapshot
   - Optional cloud sync hooks (future)
8. Testing & QA
   - Unit tests: utils/managers/hooks (physics, collision, spawn logic)
   - Integration tests: input → state → render assertions (e.g., Playwright)
   - Performance tests: consistent 60fps on typical devices; memory leak checks
   - Accessibility checks: focus order, ARIA labels, color contrast, reduced motion

## Suggested Implementation Order

1. PWA + settings shell → 2) sprites + particles → 3) power-ups/achievements → 4) perf/pooling → 5) tests/QA → 6) polish & release

## Notes/Decisions

- Chosen theme-first approach using shadcn tokens; no raw colors in UI
- Canvas respects theme via CSS variables read at draw time
- Space/Arrow keys prevent default scrolling to prioritize gameplay
- Simple Web Audio beeps for low friction; replaceable with assets later

## Quick Start

```bash
pnpm install
pnpm dev
# open the local URL; press Space to start
```
