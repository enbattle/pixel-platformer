/**
 * Main page component for the platformer game.
 * Serves as the entry point and container for the game.
 */
import Game from "@/components/game";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-gray-900">
      <h1 className="text-3xl font-bold text-white mb-4">Pixel Platformer</h1>
      <p className="text-white mb-6">
        Use <span className="px-2 py-1 bg-gray-800 rounded">A/D</span> or{" "}
        <span className="px-2 py-1 bg-gray-800 rounded">←/→</span> to move,
        <span className="px-2 py-1 bg-gray-800 rounded">W</span> or{" "}
        <span className="px-2 py-1 bg-gray-800 rounded">Space</span> to jump
        (hold for higher jumps)
      </p>
      <Game />
    </main>
  );
}
