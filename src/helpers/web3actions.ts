import { anvil } from "viem/chains";
import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts'

import {
    createPublicClient,
    encodeFunctionData,
    createWalletClient,
    http,

    custom,
    WalletClient,
    PublicClient,
    Hex
} from "viem";


//TODO: connect with web3 wallet

export class SmartAccount {
    private client: WalletClient;
    private publicClient: PublicClient;

    //TODO: move the relayer account to server
    private relayerClient: WalletClient;
    constructor() {
        const privateKey = ( localStorage.getItem("CLIENT_PVT_KEY") || generatePrivateKey()) as Hex
        this.client = createWalletClient({
            account: privateKeyToAccount(privateKey),
            chain: anvil,
            //@ts-ignore
            transport: http()
        });

        this.publicClient = createPublicClient({
            chain: anvil,
            transport: http(),
        });

        this.relayerClient = createWalletClient({
            //@ts-ignore
            account: privateKeyToAccount(import.meta.env.RELAYER_PVT_KEY),
            chain: anvil,
            //@ts-ignore
            transport: http()
        });  

    }




}