import { Transaction } from "@mysten/sui/transactions";
import { PACKAGE_ID, EDUVERSEX_DB } from "../addresses/smc_address.json";
import "dotenv/config";
import { Ed25519Keypair } from "@mysten/sui/keypairs/ed25519";
import { fromB64 } from "@mysten/sui/utils";
import { SuiClient, getFullnodeUrl } from "@mysten/sui/client";
import { bcs } from "@mysten/bcs";

class Courses{
    private keypair: Ed25519Keypair;
    private client: SuiClient;

    constructor(privateKey: string) {
        const keypair = Ed25519Keypair.fromSecretKey(fromB64(privateKey).slice(1));
        const rpcUrl = getFullnodeUrl("devnet");
        this.keypair = keypair;
        this.client = new SuiClient({ url: rpcUrl });
    }

    private parseCost(amount: string): number {
        return Math.abs(parseInt(amount, 10)) / 1_000_000_000;
    }

    async signAndExecuteTransaction(transaction: Transaction){
        const { objectChanges, balanceChanges } = await this.client.signAndExecuteTransaction({
            signer: this.keypair,
            transaction: transaction,
            options: {
                showBalanceChanges: true,
                showEvents: true,
                showInput: false,
                showEffects: true,
                showObjectChanges: true,
                showRawInput: false,
            }
        });
        console.log(objectChanges, balanceChanges);
        if (balanceChanges) {
            console.log("Cost to call the function:", this.parseCost(balanceChanges[0].amount), "SUI");
        }
        if (!objectChanges) {
            console.error("Error: RPC did not return objectChanges");
            process.exit(1);
        }
        return {objectChanges, balanceChanges}
    }
}