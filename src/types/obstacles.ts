export type ObstacleType = "cactus" | "bird";

export type Obstacle = {
  id: string;
  type: ObstacleType;
  x: number;
  y: number;
  width: number;
  height: number;
  speed: number;
};
