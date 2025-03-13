/**
 * Renderer class
 *
 * Handles all drawing operations for the game:
 * - Drawing the background and grid
 * - Rendering all game entities (player, platforms, spikes, etc.)
 * - Drawing UI elements (level indicators, win/lose messages)
 * - Visual effects and styling
 */
import type GameEngine from "./game-engine";
import { MovingPlatform } from "./entities/platform";

export default class Renderer {
  ctx: CanvasRenderingContext2D;
  engine: GameEngine;
  gridCanvas: OffscreenCanvas | HTMLCanvasElement; // For pre-rendering the grid
  gridCtx: CanvasRenderingContext2D | null;

  // Cache for frequently used values
  width: number;
  height: number;

  // Sprite cache
  spikeSprite: OffscreenCanvas | HTMLCanvasElement;
  spikeCtx: CanvasRenderingContext2D | null;
  movingSpikeSprite: OffscreenCanvas | HTMLCanvasElement;
  movingSpikeCtx: CanvasRenderingContext2D | null;

  constructor(ctx: CanvasRenderingContext2D, engine: GameEngine) {
    this.ctx = ctx;
    this.engine = engine;
    this.width = engine.width;
    this.height = engine.height;

    // Create offscreen canvas for grid (if supported)
    if (typeof OffscreenCanvas !== "undefined") {
      this.gridCanvas = new OffscreenCanvas(this.width, this.height);
      this.spikeSprite = new OffscreenCanvas(30, 20);
      this.movingSpikeSprite = new OffscreenCanvas(30, 20);
    } else {
      // Fallback for browsers without OffscreenCanvas
      this.gridCanvas = document.createElement("canvas");
      this.gridCanvas.width = this.width;
      this.gridCanvas.height = this.height;

      this.spikeSprite = document.createElement("canvas");
      this.spikeSprite.width = 30;
      this.spikeSprite.height = 20;

      this.movingSpikeSprite = document.createElement("canvas");
      this.movingSpikeSprite.width = 30;
      this.movingSpikeSprite.height = 20;
    }

    // Get contexts with proper type assertions
    this.gridCtx = this.gridCanvas.getContext("2d", {
      alpha: false,
    }) as CanvasRenderingContext2D | null;
    this.spikeCtx = this.spikeSprite.getContext(
      "2d"
    ) as CanvasRenderingContext2D | null;
    this.movingSpikeCtx = this.movingSpikeSprite.getContext(
      "2d"
    ) as CanvasRenderingContext2D | null;

    // Pre-render spike sprites
    this.createSpikeSprites();
  }

  /**
   * Pre-render the grid to an offscreen canvas for better performance
   */
  preRenderGrid() {
    if (!this.gridCtx) return;

    // Fill background
    this.gridCtx.fillStyle = "#1a1a2e";
    this.gridCtx.fillRect(0, 0, this.width, this.height);

    // Draw grid lines
    this.gridCtx.strokeStyle = "#2c2c44";
    this.gridCtx.lineWidth = 1;

    // Draw vertical lines
    for (let x = 0; x < this.width; x += 20) {
      this.gridCtx.beginPath();
      this.gridCtx.moveTo(x, 0);
      this.gridCtx.lineTo(x, this.height);
      this.gridCtx.stroke();
    }

    // Draw horizontal lines
    for (let y = 0; y < this.height; y += 20) {
      this.gridCtx.beginPath();
      this.gridCtx.moveTo(0, y);
      this.gridCtx.lineTo(this.width, y);
      this.gridCtx.stroke();
    }
  }

  /**
   * Pre-render spike sprites for better performance
   */
  createSpikeSprites() {
    // Regular spike
    if (this.spikeCtx) {
      this.spikeCtx.fillStyle = "#f87171";
      this.spikeCtx.beginPath();
      this.spikeCtx.moveTo(0, 20);
      this.spikeCtx.lineTo(15, 0);
      this.spikeCtx.lineTo(30, 20);
      this.spikeCtx.fill();

      this.spikeCtx.strokeStyle = "#ffffff";
      this.spikeCtx.lineWidth = 1;
      this.spikeCtx.beginPath();
      this.spikeCtx.moveTo(0, 20);
      this.spikeCtx.lineTo(15, 0);
      this.spikeCtx.lineTo(30, 20);
      this.spikeCtx.closePath();
      this.spikeCtx.stroke();
    }

    // Moving spike
    if (this.movingSpikeCtx) {
      this.movingSpikeCtx.fillStyle = "#ff6b6b";
      this.movingSpikeCtx.beginPath();
      this.movingSpikeCtx.moveTo(0, 20);
      this.movingSpikeCtx.lineTo(15, 0);
      this.movingSpikeCtx.lineTo(30, 20);
      this.movingSpikeCtx.fill();

      this.movingSpikeCtx.strokeStyle = "#ffffff";
      this.movingSpikeCtx.lineWidth = 1;
      this.movingSpikeCtx.beginPath();
      this.movingSpikeCtx.moveTo(0, 20);
      this.movingSpikeCtx.lineTo(15, 0);
      this.movingSpikeCtx.lineTo(30, 20);
      this.movingSpikeCtx.closePath();
      this.movingSpikeCtx.stroke();
    }
  }

  /**
   * Main render method called every frame
   * Draws all game elements in the correct order
   */
  render(fps = 0) {
    // Draw pre-rendered grid (background + grid lines)
    this.ctx.drawImage(this.gridCanvas, 0, 0);

    // Draw level indicator
    this.drawLevelIndicator();

    // Draw platforms
    this.engine.platforms.forEach((platform) => {
      if (platform instanceof MovingPlatform) {
        this.ctx.fillStyle = "#4ade80"; // Bright green for moving platforms
      } else {
        this.ctx.fillStyle = "#94a3b8"; // Light gray for static platforms
      }
      this.ctx.fillRect(
        platform.x,
        platform.y,
        platform.width,
        platform.height
      );

      // Add platform border for better visibility
      this.ctx.strokeStyle = "#ffffff";
      this.ctx.lineWidth = 1;
      this.ctx.strokeRect(
        platform.x,
        platform.y,
        platform.width,
        platform.height
      );
    });

    // Draw static spikes using pre-rendered sprite
    this.engine.spikes.forEach((spike) => {
      // Scale the sprite if the spike size differs from the sprite size
      const scaleX = spike.width / 30;
      const scaleY = spike.height / 20;

      if (scaleX === 1 && scaleY === 1) {
        // Use the pre-rendered sprite directly
        this.ctx.drawImage(this.spikeSprite, spike.x, spike.y);
      } else {
        // Scale the sprite to match the spike size
        this.ctx.drawImage(
          this.spikeSprite,
          0,
          0,
          30,
          20,
          spike.x,
          spike.y,
          spike.width,
          spike.height
        );
      }
    });

    // Draw moving spikes using pre-rendered sprite
    this.engine.movingSpikes.forEach((spike) => {
      // Scale the sprite if the spike size differs from the sprite size
      const scaleX = spike.width / 30;
      const scaleY = spike.height / 20;

      if (scaleX === 1 && scaleY === 1) {
        // Use the pre-rendered sprite directly
        this.ctx.drawImage(this.movingSpikeSprite, spike.x, spike.y);
      } else {
        // Scale the sprite to match the spike size
        this.ctx.drawImage(
          this.movingSpikeSprite,
          0,
          0,
          30,
          20,
          spike.x,
          spike.y,
          spike.width,
          spike.height
        );
      }
    });

    // Draw falling spikes using pre-rendered sprite
    this.engine.fallingSpikes.forEach((spike) => {
      // Scale the sprite if the spike size differs from the sprite size
      const scaleX = spike.width / 30;
      const scaleY = spike.height / 20;

      if (scaleX === 1 && scaleY === 1) {
        // Use the pre-rendered sprite directly
        this.ctx.drawImage(this.spikeSprite, spike.x, spike.y);
      } else {
        // Scale the sprite to match the spike size
        this.ctx.drawImage(
          this.spikeSprite,
          0,
          0,
          30,
          20,
          spike.x,
          spike.y,
          spike.width,
          spike.height
        );
      }
    });

    // Draw checkpoint
    const checkpoint = this.engine.checkpoint;
    this.ctx.fillStyle = checkpoint.activated ? "#22c55e" : "#eab308"; // Green if activated, yellow if not
    this.ctx.fillRect(
      checkpoint.x,
      checkpoint.y,
      checkpoint.width,
      checkpoint.height
    );

    // Draw checkpoint flag
    this.ctx.fillStyle = checkpoint.activated ? "#15803d" : "#ca8a04";
    this.ctx.beginPath();
    this.ctx.moveTo(checkpoint.x + checkpoint.width / 2, checkpoint.y);
    this.ctx.lineTo(checkpoint.x + checkpoint.width / 2, checkpoint.y - 20);
    this.ctx.lineTo(
      checkpoint.x + checkpoint.width / 2 + 15,
      checkpoint.y - 15
    );
    this.ctx.lineTo(checkpoint.x + checkpoint.width / 2, checkpoint.y - 10);
    this.ctx.fill();

    // Draw door (if in level 2)
    if (this.engine.door) {
      this.drawDoor(
        this.engine.door.x,
        this.engine.door.y,
        this.engine.door.width,
        this.engine.door.height
      );
    }

    // Draw player
    this.ctx.fillStyle = "#ef4444"; // Bright red
    this.ctx.fillRect(
      this.engine.player.x,
      this.engine.player.y,
      this.engine.player.width,
      this.engine.player.height
    );

    // Draw player eyes (for character detail)
    this.ctx.fillStyle = "#ffffff";
    this.ctx.fillRect(this.engine.player.x + 5, this.engine.player.y + 5, 4, 4);
    this.ctx.fillRect(
      this.engine.player.x + this.engine.player.width - 9,
      this.engine.player.y + 5,
      4,
      4
    );

    // Draw level transition indicator in level 1
    if (this.engine.currentLevel === 1) {
      this.drawLevelTransition();
    }

    // Draw FPS counter (for debugging)
    if (fps > 0) {
      this.ctx.fillStyle = "#ffffff";
      this.ctx.font = "12px Arial";
      this.ctx.textAlign = "right";
      this.ctx.fillText(`FPS: ${fps}`, this.width - 10, 20);
    }
  }

  /**
   * Draw the exit door
   * @param x - X position
   * @param y - Y position
   * @param width - Width of the door
   * @param height - Height of the door
   */
  drawDoor(x: number, y: number, width: number, height: number) {
    // Draw door frame
    this.ctx.fillStyle = "#8b5cf6"; // Purple
    this.ctx.fillRect(x, y, width, height);

    // Draw door border
    this.ctx.strokeStyle = "#ffffff";
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(x, y, width, height);

    // Draw door handle
    this.ctx.fillStyle = "#fcd34d"; // Gold
    this.ctx.beginPath();
    this.ctx.arc(x + width - 10, y + height / 2, 5, 0, Math.PI * 2);
    this.ctx.fill();

    // Add "EXIT" text above door
    this.ctx.fillStyle = "#ffffff";
    this.ctx.font = "16px Arial";
    this.ctx.textAlign = "center";
    this.ctx.fillText("EXIT", x + width / 2, y - 10);
  }

  /**
   * Draw the current level number
   */
  drawLevelIndicator() {
    this.ctx.fillStyle = "#ffffff";
    this.ctx.font = "16px Arial";
    this.ctx.textAlign = "left";
    this.ctx.fillText(`Level: ${this.engine.currentLevel}`, 20, 30);
  }

  /**
   * Draw the level transition indicator (arrow and text)
   */
  drawLevelTransition() {
    const x = this.engine.levelTransitionPoint.x;
    const y = this.engine.levelTransitionPoint.y;

    // Draw arrow pointing right
    this.ctx.fillStyle = "#60a5fa"; // Blue
    this.ctx.beginPath();
    this.ctx.moveTo(x - 20, y - 20);
    this.ctx.lineTo(x + 10, y);
    this.ctx.lineTo(x - 20, y + 20);
    this.ctx.closePath();
    this.ctx.fill();

    // Add "NEXT LEVEL" text
    this.ctx.fillStyle = "#ffffff";
    this.ctx.font = "14px Arial";
    this.ctx.textAlign = "center";
    this.ctx.fillText("NEXT LEVEL", x - 10, y - 30);
  }
}
