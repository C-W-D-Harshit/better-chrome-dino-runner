import type { Coin } from "@/types/collectibles";
import { CANVAS_WIDTH, GROUND_Y } from "@/utils/gameConstants";

export class CoinManager {
  private coins: Coin[] = [];
  private spawnTimerS = 0;
  private nextSpawnS = 1.2 + Math.random() * 1.4;
  private collectedThisRun = 0;

  reset() {
    this.coins = [];
    this.spawnTimerS = 0;
    this.nextSpawnS = 1.2 + Math.random() * 1.4;
    this.collectedThisRun = 0;
  }

  update(deltaS: number, speed: number) {
    this.spawnTimerS += deltaS;
    if (this.spawnTimerS >= this.nextSpawnS) {
      this.spawnTimerS = 0;
      this.nextSpawnS = 1.0 + Math.random() * 1.8;
      const radius = 6;
      const altitudeVariant = Math.random();
      const y = altitudeVariant < 0.5 ? GROUND_Y - 90 : GROUND_Y - 140;
      this.coins.push({ id: Math.random().toString(36).slice(2), x: CANVAS_WIDTH + 20, y, radius, speed });
    }

    for (let i = this.coins.length - 1; i >= 0; i--) {
      const c = this.coins[i];
      c.x -= speed * deltaS;
      if (c.x + c.radius < -50) {
        this.coins.splice(i, 1);
      }
    }
  }

  get(): Coin[] {
    return this.coins;
  }

  remove(id: string) {
    const idx = this.coins.findIndex((c) => c.id === id);
    if (idx >= 0) this.coins.splice(idx, 1);
  }

  markCollected() {
    this.collectedThisRun += 1;
  }

  getCollectedThisRun() {
    return this.collectedThisRun;
  }
}
