# Pixel Platformer

A modern 2D platformer game built with Next.js and TypeScript. Jump, dodge, and navigate through challenging levels filled with platforms, spikes, and checkpoints.
Inspired by "I wanna be the guy" platformer game.

Live site here: [https://enbattle.github.io/pixel-platformer/](https://enbattle.github.io/pixel-platformer/)

## Features

- 🎮 Smooth platformer gameplay mechanics
- 🏃‍♂️ Player movement and physics
- ⚡ Dynamic platform interactions
- ⚠️ Hazardous obstacles (spikes)
- 🚪 Level completion system
- 💾 Checkpoint system
- 🎯 Progressive difficulty

## Tech Stack

- **Framework**: Next.js 15.2.2
- **Language**: TypeScript
- **Styling**: TailwindCSS
- **Development**: Turbopack
- **Code Quality**: ESLint

## Getting Started

### Prerequisites

- Node.js (Latest LTS version recommended)
- npm or yarn package manager

### Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/pixel-platformer.git
cd pixel-platformer
```

2. Install dependencies:

```bash
npm install
# or
yarn install
```

3. Start the development server:

```bash
npm run dev
# or
yarn dev
```

4. Open [http://localhost:3000](http://localhost:3000) with your browser to start playing!

### Building for Production

```bash
npm run build
# or
yarn build
```

## Project Structure

```
src/
├── app/              # Next.js application files
├── components/       # React components
│   └── game.tsx     # Main game component
└── lib/             # Game logic and utilities
    ├── game-engine.ts    # Core game engine
    ├── renderer.ts       # Game rendering system
    └── entities/         # Game objects
        ├── player.ts
        ├── platform.ts
        ├── spike.ts
        ├── moving-spike.ts
        ├── door.ts
        └── checkpoint.ts
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- Inspired by classic platformer games

## Disclaimer

The game currently prioritizes game logic and functions. Will update designs and visual elements at a later time.
