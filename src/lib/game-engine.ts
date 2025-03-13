/**
 * GameEngine class
 *
 * Core game logic that handles:
 * - Physics and movement
 * - Collision detection
 * - Level management
 * - Game state (player death, level transition, winning)
 * - Input processing
 * - Entity management (player, platforms, spikes, etc.)
 */
import { Player } from "./entities/player";
import { Platform, MovingPlatform } from "./entities/platform";
import { Spike, FallingSpike } from "./entities/spike";
import { MovingSpike } from "./entities/moving-spike";
import { Checkpoint } from "./entities/checkpoint";
import { Door } from "./entities/door";

// Object pool for falling spikes to reduce garbage collection
class FallingSpikePool {
  private pool: FallingSpike[] = [];
  private maxSize = 20;

  constructor(initialSize = 10) {
    // Pre-populate the pool
    for (let i = 0; i < initialSize; i++) {
      this.pool.push(new FallingSpike(0, 0, 30, 20));
    }
  }

  get(): FallingSpike {
    if (this.pool.length > 0) {
      return this.pool.pop()!;
    } else {
      return new FallingSpike(0, 0, 30, 20);
    }
  }

  release(spike: FallingSpike): void {
    if (this.pool.length < this.maxSize) {
      this.pool.push(spike);
    }
  }
}

export default class GameEngine {
  // Canvas dimensions
  width: number;
  height: number;

  // Game entities - initialize with empty arrays/objects to avoid TypeScript errors
  player: Player;
  platforms: (Platform | MovingPlatform)[] = [];
  spikes: Spike[] = [];
  fallingSpikes: FallingSpike[] = [];
  movingSpikes: MovingSpike[] = [];
  checkpoint: Checkpoint;
  door?: Door;

  // Object pool for falling spikes
  private spikePool: FallingSpikePool = new FallingSpikePool();

  // Game state
  gravity = 980; // pixels per second squared
  playerDied = false;
  gameWon = false;
  spawnPoint: { x: number; y: number };
  checkpointActivated = false;
  currentLevel = 1;
  levelTransitionPoint = { x: 750, y: 450 };

  // Input state
  keys: { [key: string]: boolean } = {};

  // Spike spawning
  spikeSpawnTimer = 0;
  spikeSpawnInterval = 2; // seconds

  // Spatial partitioning for collision detection optimization
  private spatialGrid: Map<string, any[]> = new Map();
  private gridCellSize = 100; // Size of each grid cell

  /**
   * Initialize the game engine with canvas dimensions
   */
  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;

    // Initialize default spawn point (will be overwritten in initializeLevel1)
    this.spawnPoint = { x: 0, y: 0 };

    // Create a temporary player and checkpoint (will be overwritten in initializeLevel1)
    this.player = new Player(0, 0);
    this.checkpoint = new Checkpoint(0, 0, 0, 0);

    // Initialize the first level
    this.initializeLevel1();

    // Initialize keys object
    this.keys = {};
  }

  /**
   * Set up all entities and state for level 1
   */
  initializeLevel1() {
    // Initial spawn point for level 1
    this.spawnPoint = { x: 50, y: 400 };

    // Create player
    this.player = new Player(this.spawnPoint.x, this.spawnPoint.y);

    // Create platforms
    this.platforms = [
      // Ground platforms
      new Platform(0, 450, 200, 20),
      new Platform(250, 450, 200, 20),
      new Platform(500, 450, 300, 20),

      // Elevated platforms
      new Platform(150, 350, 100, 20),
      new Platform(350, 300, 100, 20),
      new Platform(550, 250, 100, 20),

      // Moving platform
      new MovingPlatform(300, 200, 100, 20, 200, 400, 100),
    ];

    // Create spikes
    this.spikes = [
      // Ground spikes
      new Spike(220, 430, 30, 20),
      new Spike(470, 430, 30, 20),

      // Platform spikes
      new Spike(200, 330, 20, 20),
      new Spike(400, 280, 20, 20),
    ];

    // Create falling spikes array (will be populated during gameplay)
    this.fallingSpikes = [];

    // Create moving spikes array (empty for level 1)
    this.movingSpikes = [];

    // Create checkpoint
    this.checkpoint = new Checkpoint(600, 230, 20, 20);

    // No door in level 1
    this.door = undefined;

    // Reset game state
    this.playerDied = false;
    this.gameWon = false;
    this.checkpointActivated = false;
    this.currentLevel = 1;

    // Update spatial grid
    this.updateSpatialGrid();
  }

  /**
   * Set up all entities and state for level 2
   */
  initializeLevel2() {
    // Initial spawn point for level 2
    this.spawnPoint = { x: 50, y: 400 };

    // Reset player position
    this.player.x = this.spawnPoint.x;
    this.player.y = this.spawnPoint.y;
    this.player.vx = 0;
    this.player.vy = 0;

    // Create platforms for level 2
    this.platforms = [
      // Ground platforms
      new Platform(0, 450, 150, 20),
      new Platform(200, 450, 150, 20),
      new Platform(400, 450, 150, 20),
      new Platform(600, 450, 200, 20),

      // Elevated platforms
      new Platform(100, 350, 80, 20),
      new Platform(250, 300, 80, 20),
      new Platform(400, 250, 80, 20),
      new Platform(550, 200, 80, 20),

      // Moving platforms
      new MovingPlatform(200, 200, 80, 20, 150, 350, 120),
      new MovingPlatform(500, 350, 80, 20, 450, 650, 150),
    ];

    // Create spikes for level 2
    this.spikes = [
      // Platform spikes
      new Spike(130, 330, 20, 20),
      new Spike(280, 280, 20, 20),
      new Spike(430, 230, 20, 20),
    ];

    // Create moving spikes for level 2 - these are the ground spikes that move horizontally
    this.movingSpikes = [
      new MovingSpike(150, 430, 30, 20, 150, 350, 100),
      new MovingSpike(350, 430, 30, 20, 350, 550, 120),
      new MovingSpike(550, 430, 30, 20, 550, 750, 150),
    ];

    // Reset falling spikes
    this.fallingSpikes = [];

    // Create checkpoint for level 2
    this.checkpoint = new Checkpoint(400, 230, 20, 20);

    // Create door (win condition)
    this.door = new Door(700, 390);

    // Reset game state
    this.playerDied = false;
    this.checkpointActivated = false;
    this.currentLevel = 2;

    // Update spatial grid
    this.updateSpatialGrid();
  }

  /**
   * Update the spatial grid for optimized collision detection
   */
  private updateSpatialGrid() {
    // Clear the grid
    this.spatialGrid.clear();

    // Add platforms to the grid
    for (const platform of this.platforms) {
      this.addToSpatialGrid(platform);
    }

    // Add spikes to the grid
    for (const spike of this.spikes) {
      this.addToSpatialGrid(spike);
    }

    // Add checkpoint to the grid
    this.addToSpatialGrid(this.checkpoint);

    // Add door to the grid if it exists
    if (this.door) {
      this.addToSpatialGrid(this.door);
    }
  }

  /**
   * Add an entity to the spatial grid
   */
  private addToSpatialGrid(entity: any) {
    const startX = Math.floor(entity.x / this.gridCellSize);
    const startY = Math.floor(entity.y / this.gridCellSize);
    const endX = Math.floor((entity.x + entity.width) / this.gridCellSize);
    const endY = Math.floor((entity.y + entity.height) / this.gridCellSize);

    for (let x = startX; x <= endX; x++) {
      for (let y = startY; y <= endY; y++) {
        const key = `${x},${y}`;
        if (!this.spatialGrid.has(key)) {
          this.spatialGrid.set(key, []);
        }
        this.spatialGrid.get(key)!.push(entity);
      }
    }
  }

  /**
   * Get entities from the spatial grid that could potentially collide with the given entity
   */
  private getPotentialCollisions(entity: any): any[] {
    const startX = Math.floor(entity.x / this.gridCellSize);
    const startY = Math.floor(entity.y / this.gridCellSize);
    const endX = Math.floor((entity.x + entity.width) / this.gridCellSize);
    const endY = Math.floor((entity.y + entity.height) / this.gridCellSize);

    const potentialCollisions: any[] = [];

    for (let x = startX; x <= endX; x++) {
      for (let y = startY; y <= endY; y++) {
        const key = `${x},${y}`;
        const cellEntities = this.spatialGrid.get(key);
        if (cellEntities) {
          for (const otherEntity of cellEntities) {
            if (
              otherEntity !== entity &&
              !potentialCollisions.includes(otherEntity)
            ) {
              potentialCollisions.push(otherEntity);
            }
          }
        }
      }
    }

    return potentialCollisions;
  }

  /**
   * Main update method called every frame
   * Updates all game entities and checks game conditions
   */
  update(deltaTime: number) {
    // Ensure deltaTime is reasonable to prevent physics issues
    deltaTime = Math.min(deltaTime, 0.1);

    // Update player
    this.updatePlayer(deltaTime);

    // Update moving platforms
    this.platforms.forEach((platform) => {
      if (platform instanceof MovingPlatform) {
        platform.update(deltaTime);
      }
    });

    // Update moving spikes
    this.movingSpikes.forEach((spike) => {
      spike.update(deltaTime);
    });

    // Update falling spikes
    this.updateFallingSpikes(deltaTime);

    // Spawn new falling spikes at regular intervals
    this.spikeSpawnTimer += deltaTime;
    if (this.spikeSpawnTimer >= this.spikeSpawnInterval) {
      this.spawnFallingSpike();
      this.spikeSpawnTimer = 0;
    }

    // Check checkpoint
    this.checkCheckpoint();

    // Check level transition
    this.checkLevelTransition();

    // Check win condition
    this.checkWinCondition();

    // Update spatial grid for moving entities
    if (this.currentLevel === 2 || this.movingSpikes.length > 0) {
      this.updateSpatialGrid();
    }
  }

  /**
   * Update player position, apply physics, and handle input
   */
  updatePlayer(deltaTime: number) {
    // Apply horizontal movement based on input
    this.player.vx = 0;
    if (this.keys["ArrowLeft"] || this.keys["a"] || this.keys["A"]) {
      this.player.vx = -this.player.speed;
    }
    if (this.keys["ArrowRight"] || this.keys["d"] || this.keys["D"]) {
      this.player.vx = this.player.speed;
    }

    // Apply gravity
    this.player.vy += this.gravity * deltaTime;

    // Handle jumping - variable jump height based on how long the jump button is held
    if (
      this.player.isJumping &&
      (this.keys["ArrowUp"] ||
        this.keys["w"] ||
        this.keys["W"] ||
        this.keys[" "])
    ) {
      // Variable jump height - continue applying upward force if jump button is held
      if (this.player.jumpTime < this.player.maxJumpTime) {
        this.player.vy = -this.player.jumpForce;
        this.player.jumpTime += deltaTime;
      }
    } else {
      // Jump button released or max jump time reached
      this.player.isJumping = false;
    }

    // Apply velocity to position
    this.player.x += this.player.vx * deltaTime;
    this.player.y += this.player.vy * deltaTime;

    // Check for collisions
    this.handleCollisions();

    // Check if player fell off the bottom of the screen
    if (this.player.y > this.height) {
      this.killPlayer();
    }
  }

  /**
   * Handle all collision detection and resolution
   */
  handleCollisions() {
    let onGround = false;

    // Platform collisions - using spatial partitioning for optimization
    const potentialPlatforms = this.platforms.filter((platform) =>
      this.checkCollision(this.player, platform)
    );

    for (const platform of potentialPlatforms) {
      // Determine collision direction by finding the smallest overlap
      const overlapX = Math.min(
        this.player.x + this.player.width - platform.x,
        platform.x + platform.width - this.player.x
      );
      const overlapY = Math.min(
        this.player.y + this.player.height - platform.y,
        platform.y + platform.height - this.player.y
      );

      // Resolve collision based on the smallest overlap direction
      if (overlapX < overlapY) {
        // Horizontal collision
        if (this.player.x < platform.x) {
          this.player.x = platform.x - this.player.width;
        } else {
          this.player.x = platform.x + platform.width;
        }
      } else {
        // Vertical collision
        if (this.player.y < platform.y) {
          // Landing on top of platform
          this.player.y = platform.y - this.player.height;
          this.player.vy = 0;
          onGround = true;

          // If it's a moving platform, move with it
          if (platform instanceof MovingPlatform) {
            this.player.x += platform.vx * 0.016; // Approximate for one frame
          }
        } else {
          // Hitting bottom of platform
          this.player.y = platform.y + platform.height;
          this.player.vy = 0;
        }
      }
    }

    // Update player's grounded state
    this.player.grounded = onGround;

    // Reset jump time and ability to jump if on ground
    if (onGround) {
      this.player.jumpTime = 0;
    }

    // Spike collisions - instant death
    // Check static spikes
    for (const spike of this.spikes) {
      if (this.checkCollision(this.player, spike)) {
        this.killPlayer();
        return; // Exit early after death
      }
    }

    // Check moving spikes
    for (const spike of this.movingSpikes) {
      if (this.checkCollision(this.player, spike)) {
        this.killPlayer();
        return; // Exit early after death
      }
    }

    // Check falling spikes
    for (const spike of this.fallingSpikes) {
      if (this.checkCollision(this.player, spike)) {
        this.killPlayer();
        return; // Exit early after death
      }
    }

    // Keep player within horizontal bounds of the screen
    if (this.player.x < 0) {
      this.player.x = 0;
    } else if (this.player.x + this.player.width > this.width) {
      this.player.x = this.width - this.player.width;
    }
  }

  /**
   * Update all falling spikes and remove those that have fallen off screen
   */
  updateFallingSpikes(deltaTime: number) {
    for (let i = this.fallingSpikes.length - 1; i >= 0; i--) {
      const spike = this.fallingSpikes[i];
      spike.update(deltaTime, this.gravity);

      // Remove spikes that have fallen off the screen
      if (spike.y > this.height) {
        // Return spike to the pool instead of just removing it
        this.spikePool.release(spike);
        this.fallingSpikes.splice(i, 1);
      }
    }
  }

  /**
   * Create a new falling spike at a random x position
   */
  spawnFallingSpike() {
    // Get a spike from the pool instead of creating a new one
    const spike = this.spikePool.get();

    // Random x position
    spike.x = Math.random() * (this.width - 30);
    spike.y = -20;
    spike.vy = 0; // Reset velocity

    this.fallingSpikes.push(spike);
  }

  /**
   * Check if player has reached the checkpoint and activate it
   */
  checkCheckpoint() {
    if (
      !this.checkpointActivated &&
      this.checkCollision(this.player, this.checkpoint)
    ) {
      this.checkpoint.activated = true;
      this.checkpointActivated = true;
      this.spawnPoint = {
        x: this.checkpoint.x,
        y: this.checkpoint.y - this.player.height,
      };
    }
  }

  /**
   * Check if player should transition to the next level
   */
  checkLevelTransition() {
    // Check if player is at the right edge of level 1
    if (
      this.currentLevel === 1 &&
      this.player.x > this.levelTransitionPoint.x &&
      this.player.y > this.levelTransitionPoint.y - 50 &&
      this.player.y < this.levelTransitionPoint.y + 50
    ) {
      this.initializeLevel2();
    }
  }

  /**
   * Check if player has reached the door to win the game
   */
  checkWinCondition() {
    // Check if player reached the door in level 2
    if (
      this.currentLevel === 2 &&
      this.door &&
      this.checkCollision(this.player, this.door)
    ) {
      this.gameWon = true;
    }
  }

  /**
   * Handle player death and respawn
   */
  killPlayer() {
    this.playerDied = true;
    this.player.x = this.spawnPoint.x;
    this.player.y = this.spawnPoint.y;
    this.player.vx = 0;
    this.player.vy = 0;
  }

  /**
   * Simple AABB (Axis-Aligned Bounding Box) collision detection
   */
  checkCollision(a: any, b: any) {
    return (
      a.x < b.x + b.width &&
      a.x + a.width > b.x &&
      a.y < b.y + b.height &&
      a.y + a.height > b.y
    );
  }

  /**
   * Handle keyboard key down events
   */
  handleKeyDown(e: KeyboardEvent) {
    this.keys[e.key] = true;

    // Start jumping if on ground
    if (
      (e.key === "ArrowUp" ||
        e.key === "w" ||
        e.key === "W" ||
        e.key === " ") &&
      this.player.grounded
    ) {
      this.player.isJumping = true;
      this.player.jumpTime = 0;
      this.player.vy = -this.player.jumpForce;
    }

    // Prevent default browser actions for game controls
    if (
      ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " "].includes(e.key)
    ) {
      e.preventDefault();
    }
  }

  /**
   * Handle keyboard key up events
   */
  handleKeyUp(e: KeyboardEvent) {
    this.keys[e.key] = false;

    // Stop variable height jumping when key is released
    if (
      e.key === "ArrowUp" ||
      e.key === "w" ||
      e.key === "W" ||
      e.key === " "
    ) {
      this.player.isJumping = false;
    }
  }
}
