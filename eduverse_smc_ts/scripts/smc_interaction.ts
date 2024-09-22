import { Transaction } from "@mysten/sui/transactions";
import { PACKAGE_ID, EDUVERSEX_DB } from "../addresses/smc_address.json";
import "dotenv/config";
import { Ed25519Keypair } from "@mysten/sui/keypairs/ed25519";
import { fromB64 } from "@mysten/sui/utils";
import { SuiClient, getFullnodeUrl } from "@mysten/sui/client";
import { bcs } from "@mysten/bcs";

class EduverseClient {
    private keypair: Ed25519Keypair;
    private client: SuiClient;
    
    constructor() {
        const privateKey = process.env.PRIVATE_KEY;
        if (!privateKey) {
            throw new Error("Please provide a valid private key.");
        }
        const rpcUrl = getFullnodeUrl("devnet");
        this.keypair = Ed25519Keypair.fromSecretKey(fromB64(privateKey).slice(1));
        this.client = new SuiClient({ url: rpcUrl });
    }

    private parseCost(amount: string): number {
        return Math.abs(parseInt(amount)) / 1_000_000_000;
    }

    async add_user(name: string, address: string): Promise<void> {
        const trx = new Transaction();
        trx.moveCall({
            target: `${PACKAGE_ID}::chess::add_user`,
            arguments: [trx.object(EDUVERSEX_DB), trx.pure.address(address), trx.pure.string(name)],
        });

        const { objectChanges, balanceChanges } = await this.client.signAndExecuteTransaction({
            signer: this.keypair,
            transaction: trx,
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
            console.log("Cost to add_user:", this.parseCost(balanceChanges[0].amount), "SUI");
        }

        if (!objectChanges) {
            console.error("Error: RPC did not return objectChanges");
            process.exit(1);
        }
    }

    async add_course(name: string, description : string, contract_address: string): Promise<void> {
        const trx = new Transaction();
        trx.moveCall({
            target: `${PACKAGE_ID}::chess::add_course`,
            arguments: [trx.object(EDUVERSEX_DB), trx.pure.string(name), trx.pure.string(description), trx.pure.address(contract_address)],
        });

        const { objectChanges, balanceChanges } = await this.client.signAndExecuteTransaction({
            signer: this.keypair,
            transaction: trx,
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
            console.log("Cost to add_course:", this.parseCost(balanceChanges[0].amount), "SUI");
        }

        if (!objectChanges) {
            console.error("Error: RPC did not return objectChanges");
            process.exit(1);
        }
    }

    async add_game(name: string, description : string, contract_address: string): Promise<void> {
        const trx = new Transaction();
        trx.moveCall({
            target: `${PACKAGE_ID}::chess::add_course`,
            arguments: [trx.object(EDUVERSEX_DB), trx.pure.string(name), trx.pure.string(description), trx.pure.address(contract_address)],
        });

        const { objectChanges, balanceChanges } = await this.client.signAndExecuteTransaction({
            signer: this.keypair,
            transaction: trx,
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
            console.log("Cost to add_course:", this.parseCost(balanceChanges[0].amount), "SUI");
        }

        if (!objectChanges) {
            console.error("Error: RPC did not return objectChanges");
            process.exit(1);
        }
    }

    async update_xp(user_address: string, xp : number): Promise<void> {
        const trx = new Transaction();
        trx.moveCall({
            target: `${PACKAGE_ID}::chess::update_xp`,
            arguments: [trx.object(EDUVERSEX_DB), trx.pure.address(user_address), trx.pure.u64(xp)],
        });

        const { objectChanges, balanceChanges } = await this.client.signAndExecuteTransaction({
            signer: this.keypair,
            transaction: trx,
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
            console.log("Cost to update_xp:", this.parseCost(balanceChanges[0].amount), "SUI");
        }

        if (!objectChanges) {
            console.error("Error: RPC did not return objectChanges");
            process.exit(1);
        }
    }

    async get_user_details(user_address : string){
        const trx = new Transaction();
        trx.moveCall({
            target: `${PACKAGE_ID}::chess::get_tournament_details`,
            arguments: [trx.pure.address(user_address)],
        });
0
        const result = await this.client.devInspectTransactionBlock({
            transactionBlock: trx,
            sender: this.keypair.getPublicKey().toSuiAddress(),
        });
        const returnValues = result.results ? result.results.map(result => result.returnValues) : [];
        if (returnValues[0] !== undefined) {
            const user_name = bcs.string().parse(Uint8Array.from(returnValues[0][0][0]));
            const xp = bcs.u64().parse(Uint8Array.from(returnValues[0][1][0]));
            
            return {
                name: user_name,
                xp: xp,
            };
        } else {
            throw new Error('No user details returned');
        }
    }
}

// Example usage

const eduverseClient = new EduverseClient();
eduverseClient.add_user('Junior', '0x979bc30c4825f1e05bbacfe6fb1c0ea76ce176a2e4603c394fcad691058bfb97');
