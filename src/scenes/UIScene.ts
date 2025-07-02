import { Scene } from 'phaser';
import { EVENTS_NAME, GameStatus } from '../helpers/constants';
import { Score, ScoreOperations } from '../classes/score';
import { Text } from "../classes/text";
import { config } from '../main'
import { SmartAccount } from '../helpers/web3actions';

export class UIScene extends Scene {
    private score!: Score;
    private chestLootHandler: () => void;
    private gameEndPhrase!: Text;
    private gameEndHandler: (status: GameStatus) => void;
    private smartAccount: SmartAccount;

    constructor() {
        super('ui-scene');

        // Add 10 points for every chest interaction
        this.chestLootHandler = async () => {
            await this.smartAccount.addPoints();
            this.score.changeValue(ScoreOperations.INCREASE, 100);

            // If you have enough points, you win!
            if (this.score.getValue() === config.winScore) {
                this.game.events.emit(EVENTS_NAME.GAME_END, GameStatus.WIN);
            }
        };

        this.gameEndHandler = async (status) => {
            let nftId;
            if(status == GameStatus.WIN) {
                try {
                    await this.smartAccount.finalGame();
                    nftId =  await this.smartAccount.getNFT();
                } catch (error) {
                    console.log(error);
                }
            }

            this.cameras.main.setBackgroundColor('rgba(0,0,0,0.6)');
            this.game.scene.pause('level-1-scene');
            this.gameEndPhrase = new Text(
                this,
                this.game.scale.width / 2,
                this.game.scale.height * 0.4,
                status === GameStatus.LOSE
                    ? `WASTED!\nCLICK TO RESTART`
                    : `YOU ROCK!, TRUE VIKING \nyour NFT ${nftId} at collection ${this.smartAccount.getNFTContract()}\nCLICK TO RESTART\n`,
            )
                .setAlign('center')
                .setColor(status === GameStatus.LOSE ? '#ff0000' : '#ffffff')
                .setFontSize("2rem");

            this.gameEndPhrase.setPosition(
                this.game.scale.width / 2 - this.gameEndPhrase.width / 2,
                this.game.scale.height * 0.4,
            );

          

            /**
             * When the mouse is clicked
             * The even listeners are turned off
             * and the level 1 scene is restarted 
             */
            this.input.on('pointerdown', () => {
                this.game.events.off(EVENTS_NAME.CHEST_LOOT, this.chestLootHandler);
                this.game.events.off(EVENTS_NAME.GAME_END, this.gameEndHandler);
                this.scene.get('level-1-scene').scene.restart();
                this.scene.restart();
            });

        };

        this.smartAccount = new SmartAccount();
        //TODO: remove it


    }

    async init() {
        try {
            await this.smartAccount.setupAuth();
            await this.smartAccount.createAccount();
          
        } catch(error){
            console.log(error);
        }

        // if (import.meta.env.DEV) {
       if(false) {
        
               const debugButton = this.add.text(20, 200, 'Debug')
                    .setPadding(10)
                    .setStyle({ backgroundColor: '#111' })
                    .setInteractive({ useHandCursor: true })
                    .on('pointerdown', this.onDebug, this)
                    .on('pointerover', () => debugButton.setStyle({ fill: '#f39c12' }))
                    .on('pointerout', () => debugButton.setStyle({ fill: '#FFF' }))
            

            const addPointsBtn = this.add.text(20, 250, 'Add Points')
                .setPadding(10)
                .setStyle({ backgroundColor: '#111' })
                .setInteractive({ useHandCursor: true })
                .on('pointerdown', this.addPoints, this)
                .on('pointerover', () => addPointsBtn.setStyle({ fill: '#f39c12' }))
                .on('pointerout', () => addPointsBtn.setStyle({ fill: '#FFF' }))
            
            
            const readPointsBtn = this.add.text(20, 300, 'Read Points')
                .setPadding(10)
                .setStyle({ backgroundColor: '#111' })
                .setInteractive({ useHandCursor: true })
                .on('pointerdown', this.readPoints, this)
                .on('pointerover', () => readPointsBtn.setStyle({ fill: '#f39c12' }))
                .on('pointerout', () => readPointsBtn.setStyle({ fill: '#FFF' }))

            // const finaliseGameBtn = this.add.text(20, 350, 'Finalise Game')
            //     .setPadding(10)
            //     .setStyle({ backgroundColor: '#111' })
            //     .setInteractive({ useHandCursor: true })
            //     .on('pointerdown', this.finalGame, this)
            //     .on('pointerover', () => finaliseGameBtn.setStyle({ fill: '#f39c12' }))
            //     .on('pointerout', () => finaliseGameBtn.setStyle({ fill: '#FFF' }))

            const nftBtn = this.add.text(20, 350, 'Read NFT')
                .setPadding(10)
                .setStyle({ backgroundColor: '#111' })
                .setInteractive({ useHandCursor: true })
                .on('pointerdown', this.nftGame, this)
                .on('pointerover', () => nftBtn.setStyle({ fill: '#f39c12' }))
                .on('pointerout', () => nftBtn.setStyle({ fill: '#FFF' }))
        }
    }

    async onDebug() {
        await this.smartAccount.createAccount();
        await this.smartAccount.setupAuth();
    }

    async addPoints() {
        return
        await this.smartAccount.addPoints();
    }

    async readPoints() {
        await this.smartAccount.readPoints();
    }

    async finalGame() {
        return;
        await this.smartAccount.finalGame();
    }

    async nftGame() {
        await this.smartAccount.getNFT();
    }

    // Initialize event listeners
    private initListeners(): void {
        this.game.events.on(EVENTS_NAME.CHEST_LOOT, this.chestLootHandler, this);
        this.game.events.once(EVENTS_NAME.GAME_END, this.gameEndHandler, this);
    }

    create(): void {

        this.score = new Score(this, 20, 20, 0);
        this.initListeners();
    }
}