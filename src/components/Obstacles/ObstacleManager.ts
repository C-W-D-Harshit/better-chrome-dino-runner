import type { Obstacle } from "@/types/obstacles";
import { CANVAS_WIDTH, GROUND_Y, MAX_SPAWN_INTERVAL_S, MIN_SPAWN_INTERVAL_S } from "@/utils/gameConstants";

function createCactus(currentSpeed: number): Obstacle {
  const sizeVariant = Math.random();
  const width = sizeVariant < 0.5 ? 20 : sizeVariant < 0.85 ? 30 : 45;
  const height = Math.round(width * 1.6);
  return {
    id: Math.random().toString(36).slice(2),
    type: "cactus",
    x: CANVAS_WIDTH + 20,
    y: GROUND_Y - height,
    width,
    height,
    speed: currentSpeed,
  };
}

function createBird(currentSpeed: number, score: number): Obstacle {
  const height = 24;
  const width = 34;
  const altitudeVariant = Math.random();
  // Lower flight over time so ducking matters more
  // As score increases, reduce altitude by up to ~35px
  const lowerBy = Math.min(35, Math.floor(score / 300) * 7);
  const y = (altitudeVariant < 0.5 ? GROUND_Y - height - 60 : GROUND_Y - height - 110) + lowerBy;
  return {
    id: Math.random().toString(36).slice(2),
    type: "bird",
    x: CANVAS_WIDTH + 20,
    y,
    width,
    height,
    speed: currentSpeed + 40,
  };
}

export class ObstacleManager {
  private obstacles: Obstacle[] = [];
  private spawnTimerS = 0;
  private nextSpawnS = MIN_SPAWN_INTERVAL_S + Math.random() * (MAX_SPAWN_INTERVAL_S - MIN_SPAWN_INTERVAL_S);

  reset() {
    this.obstacles = [];
    this.spawnTimerS = 0;
    this.nextSpawnS = MIN_SPAWN_INTERVAL_S + Math.random() * (MAX_SPAWN_INTERVAL_S - MIN_SPAWN_INTERVAL_S);
  }

  update(deltaS: number, speed: number, score: number) {
    this.spawnTimerS += deltaS;
    // Dynamic spawn frequency scaling with score
    const difficultyBoost = Math.min(0.6, Math.floor(score / 300) * 0.06);
    if (this.spawnTimerS >= this.nextSpawnS * (1 - difficultyBoost)) {
      this.spawnTimerS = 0;
      // Decrease intervals gradually as score rises
      const minInt = Math.max(0.55, MIN_SPAWN_INTERVAL_S - difficultyBoost * 0.5);
      const maxInt = Math.max(0.85, MAX_SPAWN_INTERVAL_S - difficultyBoost * 0.6);
      this.nextSpawnS = minInt + Math.random() * (maxInt - minInt);
      const canSpawnBird = score >= 400 && Math.random() < 0.3;
      const o = canSpawnBird ? createBird(speed, score) : createCactus(speed);
      this.obstacles.push(o);
    }

    // Move and recycle
    for (let i = this.obstacles.length - 1; i >= 0; i--) {
      const o = this.obstacles[i];
      o.x -= speed * deltaS;
      if (o.x + o.width < -50) {
        this.obstacles.splice(i, 1);
      }
    }
  }

  get(): Obstacle[] {
    return this.obstacles;
  }
}
