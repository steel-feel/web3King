# Phaser Rsbuild TypeScript Template

A high-performance Phaser 3 game development template that combines three powerful technologies:
- 🎮 **Phaser**: The leading HTML5 game framework
- 🚀 **Rsbuild**: A Rust-powered build tool with exceptional performance
- ⚡ **Bun**: The ultra-fast all-in-one JavaScript runtime & bundler

### Current Versions

- [Phaser 3.86.0](https://github.com/phaserjs/phaser)
- [Rsbuild 1.0.18](https://github.com/web-infra-dev/rsbuild)
- [Bun 1.0.30](https://bun.sh)
- [TypeScript 5.4.5](https://github.com/microsoft/TypeScript)

![screenshot](screenshot.png)

## ⚡ Performance & Features

### Build Performance

| Build Step       | Traditional Stack | Rsbuild + Bun | Why It Matters                      |
| ---------------- | ----------------- | ------------- | ----------------------------------- |
| Cold Start       | ~2.40s            | ~490ms        | Faster development startup          |
| HMR Update       | ~220ms            | ~90ms         | Quick iterations during development |
| Production Build | ~2.12s            | ~360ms        | Faster deployment builds            |

### Key Features

1. **Build System**
   - Rust-powered compilation for faster builds
   - Built-in TypeScript and source map support
   - Efficient static asset handling
   - Advanced code splitting with Module Federation

2. **Development Experience**
   - Instant HMR updates
   - TypeScript type checking
   - Consistent dev and prod builds
   - Advanced debugging tools

3. **Advanced Capabilities**

```typescript
// Example: Game scene with dynamic imports
class GameScene extends Phaser.Scene {
    preload() {
        // Efficient asset loading
        this.load.image('player', 'assets/sprites/player.png');
        this.load.json('levelData', 'assets/data/level1.json');
    }
}

// Example: Module Federation for large games
// rsbuild.config.ts
export default defineConfig({
  moduleFederation: {
    name: 'gameShell',
    remotes: {
      levelPack: 'levelPack@http://localhost:3001/remoteEntry.js'
    },
    shared: ['phaser']
  }
});
```

## Quick Start

```bash
# Clone the template
git clone [repository-url]

# Install dependencies
bun install

# Start development server
bun run dev
```

## Available Commands

| Command               | Description                          |
| --------------------- | ------------------------------------ |
| `bun install`         | Install dependencies at native speed |
| `bun run dev`         | Start dev server with HMR            |
| `bun run build`       | Create optimized production build    |
| `bun run preview`     | Preview production build             |
| `bun run dev-nolog`   | Dev server without analytics         |
| `bun run build-nolog` | Production build without analytics   |

## Project Structure

```
template-phaser-rsbuild/
├── src/
│   ├── main.ts           # Game entry point
│   ├── scenes/           # Phaser scenes
│   │   ├── Boot.ts
│   │   ├── Preloader.ts
│   │   ├── MainMenu.ts
│   │   └── Game.ts
│   └── types/           # TypeScript definitions
├── public/
│   ├── assets/
│   │   ├── sprites/     # Game sprites
│   │   └── data/        # Game data files
│   └── style.css        # Global styles
├── rsbuild.config.ts    # Build configuration
└── index.html          # Entry HTML
```

## Configuration

Customize the build process in `rsbuild.config.ts`:

```typescript
import { defineConfig } from '@rsbuild/core';

export default defineConfig({
  output: {
    copy: [
      { 
        from: './public/assets',
        to: 'assets'
      }
    ]
  },
  // Additional configuration options
});
```

## Community & Support

- 🎮 [Phaser Discord](https://discord.gg/phaser)
- 🛠️ [Rsbuild Discord](https://discord.com/invite/XsaKEEk4mW)
- 💻 [Phaser Examples](https://labs.phaser.io)
- 📚 [Rsbuild Docs](https://rsbuild.dev/)
- 🐦 [Phaser Twitter](https://twitter.com/phaser_)

## About Analytics

The template includes optional anonymous analytics that help the Phaser team improve the template. No personal data is collected. You can opt out using the `-nolog` commands or by removing `log.ts`.

## License

Created by Phaser Studio. Powered by coffee, anime, pixels and love.
The Phaser logo and characters are © 2011 - 2024 Phaser Studio Inc.

All rights reserved.