import { defineConfig } from "@rsbuild/core";
import type { RsbuildPlugin } from "@rsbuild/core";

// Plugin personalizado para mensagens do Phaser
const phaserMsg = (): RsbuildPlugin => ({
  name: "rsbuild:phaser-msg",
  setup: (api) => {
    api.onBeforeBuild(() => {
      console.log("Building for production...");
    });

    // Usando onAfterBuild ao invés de onBuildEnd
    api.onAfterBuild(() => {
      const line = "---------------------------------------------------------";
      const msg = `❤️❤️❤️ Tell us about your game! - games@phaser.io ❤️❤️❤️`;
      console.log(line);
      console.log(msg);
      console.log(line);
      console.log("✨ Done ✨");
    });
  },
});

export default defineConfig({
  html: {
    template: "./index.html",
  },
  server: {
    port: 8080,
  },
  output: {
    minify: {
      js: true,
      jsOptions: {
        minimizerOptions: {
          compress: {
            passes: 2,
            arguments: true,
            dead_code: true,
            join_vars: true,
            sequences: true,
            conditionals: true,
            evaluate: true,
            drop_debugger: true,
            drop_console: false,
          },
          mangle: {
            keep_classnames: false,
            keep_fnames: false,
          },
          format: {
            comments: false,
            ascii_only: true,
            indent_level: 0,
            beautify: false,
          },
        },
      },
      css: true,
      cssOptions: {
        minimizerOptions: {
          targets: [
            "> 0.2%",
            "not dead",
            "not op_mini all",
            "chrome >= 80",
            "firefox >= 72",
            "safari >= 13",
            "edge >= 79",
          ],
        },
      },
    },
    copy: [{ from: "./public/assets", to: "assets" }],
  },
  source: {
    entry: {
      index: "./src/main.ts",
    },
    define: {
      'import.meta.env.RELAYER_PVT_KEY': JSON.stringify(import.meta.env.RELAYER_PVT_KEY),
      'import.meta.env.EOA_PVT_KEY': JSON.stringify(import.meta.env.EOA_PVT_KEY),
  }
},
  tools: {
    bundlerChain: (chain, { CHAIN_ID }) => {
      // Configurando o chunk do Phaser usando bundlerChain
      chain.optimization.splitChunks({
        cacheGroups: {
          phaser: {
            test: /[\\/]node_modules[\\/]phaser[\\/]/,
            name: "phaser",
            chunks: "all",
          },
        },
      });
    },
  },
  plugins: [phaserMsg()],
});
