export type PlayerState = {
  x: number;
  y: number;
  width: number;
  height: number;
  velocityY: number;
  isJumping: boolean;
  isDucking: boolean;
  onGround: boolean;
  facing: "left" | "right";
};
