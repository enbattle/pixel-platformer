/**
 * Player class
 *
 * Represents the player character with:
 * - Position and size
 * - Movement properties (speed, velocity)
 * - Jump mechanics (variable height jumping)
 * - Grounded state tracking
 */
export class Player {
  // Position and dimensions
  x: number;
  y: number;
  width = 20;
  height = 30;

  // Physics properties
  vx = 0; // Horizontal velocity
  vy = 0; // Vertical velocity
  speed = 200; // Movement speed (pixels per second)
  jumpForce = 500; // Initial jump velocity

  // Jump mechanics
  grounded = false; // Whether player is on ground
  isJumping = false; // Whether player is actively jumping
  jumpTime = 0; // How long jump button has been held
  maxJumpTime = 0.3; // Maximum jump button hold time (seconds)

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }
}
