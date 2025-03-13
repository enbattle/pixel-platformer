/**
 * Door class
 *
 * Represents the exit door that completes the game when reached
 * Only appears in the final level
 */
export class Door {
  x: number;
  y: number;
  width = 40;
  height = 60;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }
}
