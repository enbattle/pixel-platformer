/**
 * Checkpoint class
 *
 * Represents a checkpoint that the player can activate
 * When activated, the player will respawn at this location after death
 */
export class Checkpoint {
  x: number;
  y: number;
  width: number;
  height: number;
  activated = false; // Whether checkpoint has been activated

  constructor(x: number, y: number, width: number, height: number) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
  }
}
