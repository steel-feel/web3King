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
import { factoryABI, factoryAddress, gameAccountABI, gameAccountAddress } from "./contracts";


//TODO: connect with web3 wallet

export class SmartAccount {
    private gameAccountAddress: Hex;
    private abstractClient: WalletClient;
    private publicClient: PublicClient;
    private authorization: SignAuthorizationReturnType;

    //TODO: move the relayer account to server
    private relayerClient: WalletClient;
    //TODO: replace with eoa
    private eoaClient: WalletClient;

    constructor() {
        let privateKey = localStorage.getItem("CLIENT_PVT_KEY") as Hex;
        if(!privateKey)
        {
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

        this.relayerClient = createWalletClient({
            //@ts-ignore
            account: privateKeyToAccount(import.meta.env.RELAYER_PVT_KEY),
            chain: anvil,
            //@ts-ignore
            transport: http()
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
        const hash = await this.relayerClient.writeContract({
            address: factoryAddress,
            abi: factoryABI,
            functionName: "newAccount",
            args: [this.eoaClient.account?.address, this.abstractClient.account?.address],
            account: this.relayerClient?.account ,
        })

        console.log({ hash })

    }

    async getAccount() {
        const data = await this.publicClient.readContract({
            address: factoryAddress,
            abi: factoryABI,
            functionName: "gameAccounts",
            args : [this.eoaClient.account?.address]
          }) as Hex;
        return data;
    }

    async setupAuth() {
        //fetch the game account or create one
        const rawAuth = await this.abstractClient.prepareAuthorization({
            account: this.abstractClient?.account,
            contractAddress: gameAccountAddress ,
        })

        //@ts-ignore
        this.authorization = await this.abstractClient.signAuthorization(rawAuth);

        const hash = await this.relayerClient.writeContract({ 
            abi: gameAccountABI, 
            address: this.abstractClient?.account.address, 
            authorizationList: [this.authorization], 
            functionName: 'initialize', 
          })

        console.log("Set Auth sucess ", { hash });
    }

    async addPoints() {
      const hash = await this.relayerClient.writeContract({
          abi: gameAccountABI,
          address: this.abstractClient.account.address,
          functionName: "addPoints",
          args: [100n]
      });
      
     console.log({ hash });
    
    }

    async readPoints() {
        const points = await this.publicClient.readContract({
            address: this.abstractClient.account.address,
            abi: gameAccountABI,
            functionName: "points",
          });

          console.log({ points });
    }

    async finalGame(){
        const hash = await this.relayerClient.writeContract({
            abi: gameAccountABI,
            address: this.abstractClient.account.address,
            functionName: "finalizeGame"
        });
        
       console.log( "Finalise game", { hash });
    }

    async getNFT() {
        
        const gameAccountDetails = await this.publicClient.readContract({
            address: factoryAddress,
            abi: factoryABI,
            functionName: "gameAccounts",
            args : [this.eoaClient.account?.address]
          });

          console.log({ gameAccountDetails });

    }




}