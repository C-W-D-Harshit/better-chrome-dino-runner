export const CANVAS_WIDTH = 800;
export const CANVAS_HEIGHT = 300;
export const GROUND_Y = 260; // baseline where player stands

export const GRAVITY = 1600; // px/s^2 (reduced for floatier jumps)
export const JUMP_VELOCITY = 750; // px/s upward
export const DUCK_HEIGHT = 30;
export const PLAYER_WIDTH = 44;
export const PLAYER_HEIGHT = 46;

// Advanced jump/air control
export const COYOTE_TIME_S = 0.1; // grace period after leaving ground to still allow jump
export const JUMP_BUFFER_S = 0.12; // queue jump input shortly before landing
export const MAX_FALL_SPEED = 1600; // clamp fall speed
export const JUMP_CUT_MULTIPLIER = 2.2; // higher => stronger early-release effect
export const AIR_FAST_FALL_MULTIPLIER = 1.6; // when holding down in air (faster drop)
export const FAST_FALL_MIN_DOWNWARD_VELOCITY = 700; // immediate downward speed when pressing down mid-air

export const INITIAL_SPEED = 320; // px/s
export const SPEED_INCREASE_PER_SECOND = 12; // px/s increase

// Player horizontal movement (left/right control)
export const HORIZONTAL_MOVE_SPEED = 380; // px/s

export const MIN_SPAWN_INTERVAL_S = 0.9;
export const MAX_SPAWN_INTERVAL_S = 1.6;

export const BIRD_UNLOCK_SCORE = 400; // introduce birds later
