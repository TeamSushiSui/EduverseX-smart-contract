import { Transaction } from "@mysten/sui/transactions";
import { PACKAGE_ID, EDUVERSEX_DB } from "../addresses/smc_address.json";
import "dotenv/config";
import { Ed25519Keypair } from "@mysten/sui/keypairs/ed25519";
import { fromB64 } from "@mysten/sui/utils";
import { SuiClient, getFullnodeUrl } from "@mysten/sui/client";
import { bcs } from "@mysten/bcs";

class Courses {
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

    async signAndExecuteTransaction(transaction: Transaction): Promise<boolean> {
        try {
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

            // console.log(objectChanges, balanceChanges);

            if (balanceChanges) {
                console.log("Cost to call the function:", this.parseCost(balanceChanges[0].amount), "SUI");
            }

            if (!objectChanges) {
                console.error("Error: RPC did not return objectChanges");
                return false; // Return false in case of an error
            }

            // If everything works fine, return true
            return true;

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
    async devInspectTransactionBlock(transaction: Transaction) : Promise<(any | null)> {
        try {
            const result = await this.client.devInspectTransactionBlock({
                transactionBlock: transaction,
                sender: this.keypair.getPublicKey().toSuiAddress(),
            });
            const returnValues = result.results ? result.results.map(result => result.returnValues) : [];
            return returnValues;
        } catch (error) {
            console.error("Error executing transaction:", error);
            return null; // Return false in case of an exception
        }
    }

    async createCourse(name: string, description: string, creatorAddress: string, xp : number, difficulty : number) {
        const transaction = new Transaction();
        transaction.moveCall({
            target: `${PACKAGE_ID}::courses::create_course`,
            arguments: [transaction.pure.string(name), transaction.pure.string(description), transaction.pure.address(creatorAddress), transaction.pure.u64(xp), transaction.pure.u8(difficulty)],
        });
         await this.signAndExecuteTransaction(transaction);
    }
}

console.log("Running courses_smc_interaction.ts");