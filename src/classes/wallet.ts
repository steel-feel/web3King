import { Hex } from 'viem';
import { Text } from './text';
export enum WalletStatus {
  DISCONNECTED,
  CONNECTED,
}
export class Wallet extends Text {
    private status: WalletStatus;

    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y, `Please connect wallet to play the game`);
        this.setFontSize("1.2rem")
        scene.add.existing(this);
        this.status = WalletStatus.DISCONNECTED;
    }

    public changeStatus(account: Hex): void {
        this.status = WalletStatus.CONNECTED;
        this.setText(`Wallet Connected: ${account}`);
    }
    
    public getStatus(): number {
        return this.status;
    }
}