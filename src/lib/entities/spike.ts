/**
 * Spike classes
 *
 * Base Spike: Static triangular hazard
 * FallingSpike: Spike that falls from the top of the screen
 */

/**
 * Base Spike class - represents a static spike hazard
 */
export class Spike {
  x: number;
  y: number;
  width: number;
  height: number;

  constructor(x: number, y: number, width: number, height: number) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
  }
}

/**
 * FallingSpike class - extends Spike with vertical falling movement
 */
export class FallingSpike extends Spike {
  vy = 0; // Vertical velocity

  /**
   * Update falling spike position based on gravity
   */
  update(deltaTime: number, gravity: number) {
    // Apply gravity to vertical velocity
    this.vy += gravity * deltaTime;

    // Update position
    this.y += this.vy * deltaTime;
  }
}
