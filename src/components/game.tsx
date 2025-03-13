/**
 * Main Game component that handles:
 * - Canvas setup and game initialization
 * - Game loop management
 * - User interface states (start screen, game screen, win screen)
 * - Input handling
 * - Death counting
 */
"use client";

import { useEffect, useRef, useState } from "react";
import GameEngine from "@/lib/game-engine";
import Renderer from "@/lib/renderer";

export default function Game() {
  // Canvas reference for drawing the game
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Game state management
  const gameEngineRef = useRef<GameEngine | null>(null);
  const [deaths, setDeaths] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameWon, setGameWon] = useState(false);

  useEffect(() => {
    // Only initialize the game if canvas exists, game has started, and hasn't been won yet
    if (!canvasRef.current || !gameStarted || gameWon) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d", { alpha: false }); // Disable alpha for better performance
    if (!ctx) return;

    // Set canvas size
    canvas.width = 800;
    canvas.height = 500;

    // Create game engine and renderer
    const engine = new GameEngine(canvas.width, canvas.height);
    const renderer = new Renderer(ctx, engine);
    gameEngineRef.current = engine;

    // Pre-render static elements like the grid
    renderer.preRenderGrid();

    // Set up game loop variables
    let animationFrameId: number;
    let lastTime = 0;
    let frameCount = 0;
    let lastFpsUpdateTime = 0;
    let fps = 0;

    /**
     * Main game loop function
     * Handles timing, updates game state, and renders each frame
     */
    const gameLoop = (timestamp: number) => {
      if (!lastTime) lastTime = timestamp;

      // Calculate time since last frame, cap at 0.1s to prevent physics issues during lag
      const deltaTime = Math.min((timestamp - lastTime) / 1000, 0.1);
      lastTime = timestamp;

      // FPS calculation (for debugging)
      frameCount++;
      if (timestamp - lastFpsUpdateTime >= 1000) {
        fps = frameCount;
        frameCount = 0;
        lastFpsUpdateTime = timestamp;
      }

      // Update game state
      engine.update(deltaTime);

      // Render game
      renderer.render(fps);

      // Update death counter if player died
      if (engine.playerDied) {
        setDeaths((prev) => prev + 1);
        engine.playerDied = false;
      }

      // Check if game is won
      if (engine.gameWon) {
        setGameWon(true);
        return; // Stop the game loop
      }

      // Continue game loop
      animationFrameId = requestAnimationFrame(gameLoop);
    };

    // Start game loop
    lastTime = 0;
    animationFrameId = requestAnimationFrame(gameLoop);

    // Set up keyboard event listeners
    const handleKeyDown = (e: KeyboardEvent) => engine.handleKeyDown(e);
    const handleKeyUp = (e: KeyboardEvent) => engine.handleKeyUp(e);

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    // Clean up function to prevent memory leaks
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      gameEngineRef.current = null;
    };
  }, [gameStarted, gameWon]); // Re-run effect if game started or won state changes

  // Handler functions for game state changes
  const startGame = () => {
    setGameStarted(true);
    setGameWon(false);
    setDeaths(0);
  };

  const restartGame = () => {
    setGameWon(false);
    setDeaths(0);
  };

  return (
    <div className="flex flex-col items-center">
      {/* Start Screen */}
      {!gameStarted ? (
        <div className="flex flex-col items-center justify-center bg-gray-800 rounded-lg p-8 mb-4">
          <h2 className="text-2xl font-bold text-white mb-4">Ready to Play?</h2>
          <p className="text-gray-300 mb-6 text-center max-w-md">
            This is a challenging platformer inspired by "I Wanna Be the Guy".
            Avoid spikes, navigate moving platforms, and reach the door at the
            end to win!
          </p>
          <button
            onClick={startGame}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-md transition-colors"
          >
            Start Game
          </button>
        </div>
      ) : gameWon ? (
        // Win Screen
        <div className="flex flex-col items-center justify-center bg-gray-800 rounded-lg p-8 mb-4">
          <h2 className="text-2xl font-bold text-green-400 mb-4">You Won!</h2>
          <p className="text-gray-300 mb-2 text-center">
            Congratulations! You completed the game with {deaths} deaths.
          </p>
          <p className="text-gray-300 mb-6 text-center">Can you do better?</p>
          <button
            onClick={restartGame}
            className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-md transition-colors"
          >
            Play Again
          </button>
        </div>
      ) : (
        // Active Game Screen
        <>
          <div className="bg-gray-800 p-3 rounded-md mb-4 text-white">
            Deaths: {deaths}
          </div>
          <div className="relative">
            <canvas
              ref={canvasRef}
              className="border-4 border-gray-700 rounded-md bg-black"
              style={{ imageRendering: "pixelated" }} // Improve pixel art rendering
            />
          </div>
        </>
      )}
    </div>
  );
}
