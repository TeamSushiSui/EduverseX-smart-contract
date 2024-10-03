import { Transaction } from "@mysten/sui/transactions";
import { NFT_PACKAGE_ID, EDUVERSEX_DB } from "../addresses/smc_address.json";
import "dotenv/config";
import { Ed25519Keypair } from "@mysten/sui/keypairs/ed25519";
import { fromB64 } from "@mysten/sui/utils";
import { SuiClient, getFullnodeUrl } from "@mysten/sui/client";
import { bcs, fromHex, toHex } from "@mysten/bcs";
import { EduverseClient } from "./smc_interaction";

interface NFTDetails {
    name: string;
    description: string;
    creator: any;
    owner: any;
    image: string;
    price: string;
    is_for_sale: boolean;
  }

export class NFT {
    private keypair: Ed25519Keypair;
    private client: SuiClient;
    private eduverseClient: EduverseClient;
    private Address;

    constructor(privateKey: string) {
        const keypair = Ed25519Keypair.fromSecretKey(fromB64(privateKey).slice(1));
        const rpcUrl = getFullnodeUrl("devnet");
        this.keypair = keypair;
        this.client = new SuiClient({ url: rpcUrl });
        this.eduverseClient = new EduverseClient(privateKey);
        this.Address = bcs.bytes(32).transform({
            input: (val: string) => fromHex(val),
            output: (val) => toHex(val),
        });
    }

    private parseCost(amount: string): number {
        return Math.abs(parseInt(amount, 10)) / 1_000_000_000;
    }

    private async signAndExecuteTransaction(transaction: Transaction) {
        try {
            const { objectChanges, balanceChanges } = await this.client.signAndExecuteTransaction({
                signer: this.keypair,
                transaction: transaction as unknown as Uint8Array,
                options: {
                    showBalanceChanges: true,
                    showEvents: true,
                    showInput: false,
                    showEffects: true,
                    showObjectChanges: true,
                    showRawInput: false,
                }
            });

            // console.log(objectChanges, balanceChanges);

            if (balanceChanges) {
                console.log("Cost to call the function:", this.parseCost(balanceChanges[0].amount), "SUI");
            }

            if (!objectChanges) {
                console.error("Error: RPC did not return objectChanges");
                return false; // Return false in case of an error
            }

            // If everything works fine, return true
            // console.log(objectChanges);
            return objectChanges;

        } catch (error) {
            console.error("Error executing transaction:", error);
            return false; // Return false in case of an exception
        }
    }

    /**
     * Inspects the given transaction using the Sui client's devInspectTransactionBlock function
     * @param {Transaction} transaction the transaction to inspect
     * @returns {Promise<(Uint8Array[][] | null)>} an array of return values of the transaction, or null if there was an error
     */
    private async devInspectTransactionBlock(transaction: Transaction): Promise<(any | null)> {
        try {
            const result = await this.client.devInspectTransactionBlock({
                transactionBlock: transaction as unknown as Uint8Array,
                sender: this.keypair.getPublicKey().toSuiAddress(),
            });
            const returnValues = result.results ? result.results.map(result => result.returnValues) : [];
            return returnValues;
        } catch (error) {
            console.error("Error executing transaction:", error);
            return null; // Return false in case of an exception
        }
    }

    async createNFT(name: string, description: string, image: string) {
        const trx = new Transaction();
        trx.moveCall({
            target: `${NFT_PACKAGE_ID}::nft::mint_to_sender`,
            arguments: [trx.pure.string(name), trx.pure.string(description), trx.pure.string(image)],
        });
        const object_changes = await this.signAndExecuteTransaction(trx);
        if (object_changes) {
            const createdObject = object_changes.find(item => item.type === 'created');
            const objectId = createdObject ? createdObject.objectId : null;
            if (objectId) {
                await this.eduverseClient.addNFT(objectId);
                return objectId;
            } else {
                return false;
            }
        } else {
            return false;
        }
    }

    async listForSale(nft: string, price : number){
        const trx = new Transaction();
        trx.moveCall({
            target: `${NFT_PACKAGE_ID}::nft::list_for_sale`,
            arguments: [trx.object(nft), trx.pure.u64(price)],
        });
        const object_changes = await this.signAndExecuteTransaction(trx);
        if (object_changes) {
            return true;
        } else {
            return false;
        }
    }

    async RemoveFromSale(nft: string){
        const trx = new Transaction();
        trx.moveCall({
            target: `${NFT_PACKAGE_ID}::nft::remove_from_sale`,
            arguments: [trx.object(nft)],
        });
        const object_changes = await this.signAndExecuteTransaction(trx);
        if (object_changes) {
            return true;
        } else {
            return false;
        }
    }

    async buyNFT(){

    }

    async getNFT(objectId: string) {
        const transaction = new Transaction();
        transaction.moveCall({
            target: `${NFT_PACKAGE_ID}::nft::get_nft`,
            arguments: [transaction.object(objectId)],
        });
        const returnValues = await this.devInspectTransactionBlock(transaction);
        if (returnValues) {
            if (returnValues[0] !== undefined) {
                // console.log(returnValues[0]);
                let nft = {
                    name: bcs.string().parse(Uint8Array.from(returnValues[0][0][0])),
                    description: bcs.string().parse(Uint8Array.from(returnValues[0][1][0])),
                    creator: this.Address.parse(Uint8Array.from(returnValues[0][2][0])),
                    owner: this.Address.parse(Uint8Array.from(returnValues[0][3][0])),
                    image: bcs.string().parse(Uint8Array.from(returnValues[0][4][0])),
                    price: bcs.u64().parse(Uint8Array.from(returnValues[0][5][0])),
                    is_for_sale: bcs.bool().parse(Uint8Array.from(returnValues[0][6][0])),
                };
                nft = {
                    ...nft,
                    creator: `0x${nft.creator}`,
                    owner: `0x${nft.owner}`
                };
                return nft;
            } else {
                return null;
            }
        } else {
            return null;
        }
    }

    async getAllNFTsDetails(){
        const nft_addresses = await this.eduverseClient.getAllNftsAddresses();
        if(nft_addresses){
            console.log("address", nft_addresses)
            const nfts: NFTDetails[] = [];
            for(let i = 0; i < nft_addresses.length; i++){
                const nft = await this.getNFT(nft_addresses[i]);
                if(nft){
                    nfts.push(nft);
                }
            }
            return nfts;
        }
    }
}

// const Private_key = process.env.PRIVATE_KEY;

// if (!Private_key) {
//     throw new Error("Please set your private key in a .env file");
// }

// const nft = new NFT(Private_key);
// console.log(await nft.createNFT('SUI ', 'NFT 1 description', 'https://ibb.co/KKttnht'));
// console.log(await nft.getNFT('0x3d0b1b971c943d70e3225f1bbfe91c876a70b57a49f53233a3aa6e6bb322bee9'))
// console.log(await nft.listForSale('0x3d0b1b971c943d70e3225f1bbfe91c876a70b57a49f53233a3aa6e6bb322bee9', 5))
// console.log(await nft.RemoveFromSale('0x3d0b1b971c943d70e3225f1bbfe91c876a70b57a49f53233a3aa6e6bb322bee9'))
// console.log(await nft.getAllNFTsDetails());