import type { Obstacle } from "./obstacles";
import type { PlayerState } from "./player";

export type GameState = {
  running: boolean;
  gameOver: boolean;
  score: number;
  highScore: number;
  speed: number;
  player: PlayerState;
  obstacles: Obstacle[];
};
