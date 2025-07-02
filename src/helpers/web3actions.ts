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
    Hex,
    SignAuthorizationReturnType
} from "viem";
import { factoryABI, factoryAddress, gameAccountABI, gameAccountAddress, nftContractAddress } from "./contracts";


//TODO: connect with web3 wallet

export class SmartAccount {
    private abstractClient: WalletClient;
    private publicClient: PublicClient;
    private authorization: SignAuthorizationReturnType;

    //TODO: replace with eoa
    private eoaClient: WalletClient;

    constructor() {
        let privateKey = localStorage.getItem("CLIENT_PVT_KEY") as Hex;
        if (!privateKey) {
            privateKey = generatePrivateKey() as Hex;
            localStorage.setItem("CLIENT_PVT_KEY", privateKey)
        }
        this.abstractClient = createWalletClient({
            account: privateKeyToAccount(privateKey),
            chain: anvil,
            //@ts-ignore
            transport: http()
        });

        this.publicClient = createPublicClient({
            chain: anvil,
            transport: http(),
        });

        //TODO: replace with external wallet connect
        this.eoaClient = createWalletClient({
            //@ts-ignore
            account: privateKeyToAccount(import.meta.env.EOA_PVT_KEY),
            chain: anvil,
            //@ts-ignore
            transport: http()
        });

    }
    //TODO: move to relayer
    async createAccount() {
        const response = await (await fetch("http://localhost:3000/create-account", {
            method: "POST",
            body: JSON.stringify({ owner: this.eoaClient.account?.address, abstractAccount: this.abstractClient.account?.address  }, (key, value) =>
                typeof value === 'bigint'
                    ? value.toString()
                    : value // return everything else unchanged
            ),
        })).json();

        console.log({ response });

    }

    async getAccount() {
        const data = await this.publicClient.readContract({
            address: factoryAddress,
            abi: factoryABI,
            functionName: "gameAccounts",
            args: [this.eoaClient.account?.address]
        }) as Hex;
        return data;
    }

    async setupAuth() {
        //fetch the game account or create one
        const rawAuth = await this.abstractClient.prepareAuthorization({
            account: this.abstractClient?.account,
            contractAddress: gameAccountAddress,
        })

        //@ts-ignore
        this.authorization = await this.abstractClient.signAuthorization(rawAuth);

        const response = await (await fetch("http://localhost:3000/setup-auth", {
            method: "POST",
            body: JSON.stringify({ authorization: this.authorization, abstractAccount: this.abstractClient?.account.address }, (key, value) =>
                typeof value === 'bigint'
                    ? value.toString()
                    : value // return everything else unchanged
            ),
        })).json();

        console.log({ response });

    }

    async addPoints() {

        const response = await (await fetch("http://localhost:3000/add-points", {
            method: "POST",
            body: JSON.stringify({ abstractAccount: this.abstractClient.account.address, points: 100n }, (key, value) =>
                typeof value === 'bigint'
                    ? value.toString()
                    : value // return everything else unchanged
            ),
        })).json();

        console.log({ response });

    }

    async readPoints() {
        const points = await this.publicClient.readContract({
            address: this.abstractClient.account.address,
            abi: gameAccountABI,
            functionName: "points",
        });

        console.log({ points });
    }

    async finalGame() {

        const response = await (await fetch("http://localhost:3000/end-game", {
            method: "POST",
            body: JSON.stringify({ abstractAccount: this.abstractClient.account.address}, (key, value) =>
                typeof value === 'bigint'
                    ? value.toString()
                    : value // return everything else unchanged
            ),
        })).json();

        console.log({ response });

    }

    async getNFT(): number {
        const gameAccountDetails: any[] = await this.publicClient.readContract({
            address: factoryAddress,
            abi: factoryABI,
            functionName: "gameAccounts",
            args: [this.eoaClient.account?.address]
        });

        console.log({ gameAccountDetails });
        return gameAccountDetails[0];
    }

    getNFTContract(): Hex {
        return nftContractAddress;
    }



}