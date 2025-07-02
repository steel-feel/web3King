import { anvil } from "viem/chains";
import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts'

import {
    createPublicClient,
    createWalletClient,
    http,
    custom,
    WalletClient,
    PublicClient,
    Hex,
    SignAuthorizationReturnType
} from "viem";
import { factoryABI, factoryAddress, gameAccountABI, gameAccountAddress, nftContractAddress } from "./contracts";
import { KyInstance } from "ky";
import ky from 'ky';


//TODO: connect with web3 wallet

export class SmartAccount {
    private abstractClient: WalletClient;
    private publicClient: PublicClient;
    private authorization: SignAuthorizationReturnType;
    private api: KyInstance;

    //TODO: replace with eoa
    private eoaClient: WalletClient;
    private eoaAddress: Hex;
    private abstractAccAddr: Hex;

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

        this.abstractAccAddr = this.abstractClient.account?.address;

        this.publicClient = createPublicClient({
            chain: anvil,
            transport: http(),
        });

        this.api = ky.create({ prefixUrl: import.meta.env.RELAYER_SERVER_URL } );

    }
   
    async connectWallet() {  
            // Check if MetaMask is installed
            if (typeof window.ethereum === 'undefined') {
              alert('MetaMask is not installed. Please install it to connect.');
              return;
            }
          
            try {
              // Create a Viem Wallet Client
              this.eoaClient = createWalletClient({
                chain: anvil, // Specify the chain (e.g., mainnet, sepolia)
                transport: custom(window.ethereum), // Use the custom transport with window.ethereum
              });
          
              // Request accounts from MetaMask
              // This will open the MetaMask popup asking the user to connect
              const [userAccount] = await this.eoaClient.requestAddresses();
              
              this.eoaAddress = userAccount;
              
              console.log('Connected MetaMask account:', this.eoaAddress);
    
          
            } catch (error) {
              console.error('Error connecting to MetaMask:', error);
              alert('Failed to connect to MetaMask. Please try again.');
            }
         
    }

    async createAccount() {
        const response = await this.api.post('create-account', {
            body: JSON.stringify(
                { owner: this.eoaAddress, abstractAccount: this.abstractAccAddr },
                (key, value) =>
                    typeof value === 'bigint' ? value.toString() : value // return everything else unchanged
            )
        }).json()

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

        const response = await this.api.post('setup-auth', {
            body: JSON.stringify({ authorization: this.authorization, abstractAccount: this.abstractAccAddr }, (key, value) =>
                typeof value === 'bigint'
                    ? value.toString()
                    : value // return everything else unchanged
            )
        }).json();

        console.log({ response });

    }

    async addPoints() {
        const response = await this.api.post('add-points', {
            body: JSON.stringify({ abstractAccount: this.abstractAccAddr, points: 100n }, (key, value) =>
                typeof value === 'bigint'
                    ? value.toString()
                    : value // return everything else unchanged
            )
        }).json();

        console.log({ response });

    }

    async readPoints() {
        const points = await this.publicClient.readContract({
            address: this.abstractAccAddr,
            abi: gameAccountABI,
            functionName: "points",
        });

        console.log({ points });
    }

    async finalGame() {
        const response = await this.api.post('end-game', {
            body: JSON.stringify({ abstractAccount: this.abstractAccAddr }, (key, value) =>
                typeof value === 'bigint'
                    ? value.toString()
                    : value // return everything else unchanged
            )
        }).json();

        console.log({ response });

    }

    async getNFT(): number {
        const gameAccountDetails: any[] = await this.publicClient.readContract({
            address: factoryAddress,
            abi: factoryABI,
            functionName: "gameAccounts",
            args: [this.eoaAddress]
        });

        console.log({ gameAccountDetails });
        return gameAccountDetails[0];
    }

    getNFTContract(): Hex {
        return nftContractAddress;
    }



}