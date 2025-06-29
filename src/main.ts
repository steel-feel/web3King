import { UIScene } from "./scenes/UIScene";
import { Level1 } from "./scenes/Level1";
import { LoadingScene } from "./scenes/LoadingScreen";
import { Game, type Types } from "phaser";

type GameConfigExtended = Types.Core.GameConfig & {
  winScore: number;
};
//TODO: figure out resizing later
// function sizeChanged() {
//   if (window.game.isBooted) {
//     setTimeout(() => {
//       window.game.scale.resize(window.innerWidth, window.innerHeight);
//       window.game.canvas.setAttribute(
//         'style',
//         `display: block; width: ${window.innerWidth}px; height: ${window.innerHeight}px;`,
//       );
//     }, 100);
//   }
// };

//  Find out more information about the Game Config at:
//  https://newdocs.phaser.io/docs/3.70.0/Phaser.Types.Core.GameConfig
export const config: GameConfigExtended = {
  title: 'Web3King RPG',
  type: Phaser.WEBGL,
  parent: 'game',
  backgroundColor: '#351f1b',
  scale: {
    mode: Phaser.Scale.ScaleModes.RESIZE,
    //   width: window.innerWidth,
    //   height: window.innerHeight,
    autoCenter: Phaser.Scale.NO_CENTER,
},
  physics: {
      default: 'arcade',
      arcade: {
          debug: false,
      },
  },
  render: {
      antialiasGL: false,
      pixelArt: true,
  },
  // callbacks: {
  //     postBoot: () => {
  //         sizeChanged();
  //     },
  // },
  // canvasStyle: `display: block; width: 100%; height: 100%;`,
  autoFocus: true,
  audio: {
      disableWebAudio: false,
  },
  winScore: 500,
  scene: [LoadingScene, Level1, UIScene],
};

export default new Game(config);
