/**
 * MovingSpike class
 *
 * Represents a spike that moves horizontally between two points
 * Used primarily for the ground hazards in level 2
 */
import { Spike } from "./spike";

export class MovingSpike extends Spike {
  startX: number; // Leftmost position
  endX: number; // Rightmost position
  speed: number; // Movement speed in pixels per second
  direction = 1; // 1 = moving right, -1 = moving left

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
   * Update moving spike position based on time and direction
   */
  update(deltaTime: number) {
    // Calculate movement
    const movement = this.speed * this.direction * deltaTime;

    // Update position
    this.x += movement;

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
