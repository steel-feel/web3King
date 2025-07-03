import { Scene } from 'phaser';
import { EVENTS_NAME, GameStatus, WalletConnect } from '../helpers/constants';
import { Score, ScoreOperations } from '../classes/score';
import { Text } from "../classes/text";
import { config } from '../main'
import { SmartAccount } from '../helpers/web3actions';
import { Wallet } from '../classes/wallet';

export class UIScene extends Scene {
    private score!: Score;
    private wallet!:Wallet;
    private chestLootHandler: () => void;
    private gameEndPhrase!: Text;
    private gameEndHandler: (status: GameStatus) => void;
    private smartAccount: SmartAccount;
    private status: WalletConnect;
    private walletConnected: () => void;
    private connectButton: Phaser.GameObjects.Text


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
            this.scene.pause();
            let nftId;
            if(status == GameStatus.WIN) {
                try {
                  const response = await this.smartAccount.finalGame();
                } catch (error) {
                    console.log(error);
                }
            }

            let message 
            switch(status) {
                case GameStatus.LOSE:
                    message = `WASTED!\nCLICK TO RESTART`
                break;
                case GameStatus.WIN:
                  message = `YOU ROCK!, TRUE VIKING \nyour NFT at collection ${this.smartAccount.getNFTContract()}\nCLICK TO RESTART\n`
                break
                case GameStatus.ALREADY_WIN:
                  const gaDetails = await this.smartAccount.getAccount()
                    message = `Already a ROCK STAR, \n check your NFT ${gaDetails[0]} at \n collection ${this.smartAccount.getNFTContract()}\n`
                break;

            }

            this.cameras.main.setBackgroundColor('rgba(0,0,0,0.6)');
            this.game.scene.pause('level-1-scene');
            this.gameEndPhrase = new Text(
                this,
                this.game.scale.width / 2,
                this.game.scale.height * 0.4,
                message,
            )
                .setAlign('center')
                .setColor(status === GameStatus.LOSE ? '#ff0000' : '#ffffff')
                .setFontSize("1rem");

            this.gameEndPhrase.setPosition(
                this.game.scale.width / 2 - this.gameEndPhrase.width / 2,
                this.game.scale.height * 0.4,
            );

          

            /**
             * When the mouse is clicked
             * The even listeners are turned off
             * and the level 1 scene is restarted 
             */
            if (status == GameStatus.ALREADY_WIN)
            {
                return;
            }
            this.input.on('pointerdown', () => {
                this.game.events.off(EVENTS_NAME.CHEST_LOOT, this.chestLootHandler);
                this.game.events.off(EVENTS_NAME.GAME_END, this.gameEndHandler);
                this.scene.get('level-1-scene').scene.restart();
                this.scene.restart();
            });

        };

        this.walletConnected = async () => {
            try {
            await this.smartAccount.setupAuth();
            await this.smartAccount.createAccount();
            this.connectButton.setVisible(false)
            this.wallet.changeStatus(this.smartAccount.getEOAAccount())
            }catch(err:Error) {
                if(err.message == "GAME_ALREADY_PLAYED") {
                    this.game.events.emit(EVENTS_NAME.GAME_END, GameStatus.ALREADY_WIN);
                }
            }
        }

        this.smartAccount = new SmartAccount();
        //TODO: remove it


    }

    async init() {
        this.connectButton = this.add.text(20, 200, 'Connect Wallet')
        .setPadding(10)
        .setStyle({ backgroundColor: '#111' })
        .setInteractive({ useHandCursor: true })
        .on('pointerdown', this.onConnect, this)
        .on('pointerover', () => this.connectButton.setStyle({ fill: '#f39c12' }))
        .on('pointerout', () => this.connectButton.setStyle({ fill: '#FFF' }))

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

    async onConnect() {
        await this.smartAccount.connectWallet();
        this.game.events.emit(EVENTS_NAME.WALLET_CONNECTED);
        // await this.smartAccount.createAccount();
        // await this.smartAccount.setupAuth();
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
        this.game.events.once(EVENTS_NAME.WALLET_CONNECTED, this.walletConnected , this)   
    }

    create(): void {
        this.score = new Score(this, 20, 20, 0);
        this.wallet = new Wallet(this, 20, 140) ;
        this.initListeners();
    }
}