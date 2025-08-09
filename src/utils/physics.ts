export function applyGravity(velocityY: number, gravity: number, deltaSeconds: number): number {
  return velocityY + gravity * deltaSeconds;
}

export function clamp(value: number, min: number, max: number): number {
  if (value < min) return min;
  if (value > max) return max;
  return value;
}
