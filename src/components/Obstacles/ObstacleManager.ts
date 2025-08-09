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

function createBird(currentSpeed: number): Obstacle {
  const height = 24;
  const width = 34;
  const altitudeVariant = Math.random();
  const y = altitudeVariant < 0.5 ? GROUND_Y - height - 60 : GROUND_Y - height - 110;
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
    if (this.spawnTimerS >= this.nextSpawnS) {
      this.spawnTimerS = 0;
      this.nextSpawnS = MIN_SPAWN_INTERVAL_S + Math.random() * (MAX_SPAWN_INTERVAL_S - MIN_SPAWN_INTERVAL_S);
      const canSpawnBird = score >= 400 && Math.random() < 0.3;
      const o = canSpawnBird ? createBird(speed) : createCactus(speed);
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
