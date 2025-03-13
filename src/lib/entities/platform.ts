/**
 * Platform classes
 *
 * Base Platform: Static rectangular platform
 * MovingPlatform: Platform that moves horizontally between two points
 */

/**
 * Base Platform class - represents a static platform
 */
export class Platform {
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
 * MovingPlatform class - extends Platform with horizontal movement
 */
export class MovingPlatform extends Platform {
  startX: number; // Leftmost position
  endX: number; // Rightmost position
  speed: number; // Movement speed in pixels per second
  direction = 1; // 1 = moving right, -1 = moving left
  vx = 0; // Current horizontal velocity

  constructor(
    x: number,
    y: number,
    width: number,
    height: number,
    startX: number,
    endX: number,
    speed: number
  ) {
    super(x, y, width, height);
    this.startX = startX;
    this.endX = endX;
    this.speed = speed;
  }

  /**
   * Update platform position based on time and direction
   */
  update(deltaTime: number) {
    // Calculate velocity
    this.vx = this.speed * this.direction * deltaTime;

    // Update position
    this.x += this.vx;

    // Change direction if reached endpoint
    if (this.x <= this.startX) {
      this.x = this.startX;
      this.direction = 1; // Start moving right
    } else if (this.x >= this.endX - this.width) {
      this.x = this.endX - this.width;
      this.direction = -1; // Start moving left
    }
  }
}
