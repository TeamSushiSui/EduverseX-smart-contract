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
    
    /**
     * Constructor for EduverseClient
     * @param {string} privateKey a base64 encoded Ed25519 private key
     * @throws {Error} if privateKey is not a valid base64 encoded Ed25519 private key
     */
    constructor(privateKey: string) {
        const keypair = Ed25519Keypair.fromSecretKey(fromB64(privateKey).slice(1));
        const rpcUrl = getFullnodeUrl("devnet");
        this.keypair = keypair;
        this.client = new SuiClient({ url: rpcUrl });
    }

    /**
     * Converts a cost in suix (1e-9 suix) to a float in sui
     * @param {string} amount the cost in suix
     * @returns {number} the cost in sui
     */
    private parseCost(amount: string): number {
        return Math.abs(parseInt(amount, 10)) / 1_000_000_000;
    }

    /**
     * Signs and executes a given transaction on the Sui network.
     * Logs the object changes and balance changes.
     * If the transaction is successful, logs the cost of the transaction in SUI.
     * If the RPC does not return objectChanges, logs an error message and exits with status code 1.
     * @param {Transaction} transaction - The transaction to sign and execute.
     * @returns {Promise<{objectChanges: ObjectChange[], balanceChanges: BalanceChange[]}>} - Resolves with the object changes and balance changes if the transaction is successful.
     */
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

    /**
     * Adds a user to the EduverseX database.
     *
     * @param {string} name - Name of the user to add.
     * @param {string} userAddress - Address of the user to add.
     * @returns {Promise<void>} - Resolves if successful.
     */
    async addUser(name: string, userAddress: string): Promise<void> {
        const transaction = new Transaction();
        transaction.moveCall({
            target: `${PACKAGE_ID}::eduversex_database::add_user`,
            arguments: [transaction.object(EDUVERSEX_DB), transaction.pure.address(userAddress), transaction.pure.string(name)],
        });

        await this.signAndExecuteTransaction(transaction);
    }

    /**
     * Removes a user from the EduverseX database.
     *
     * @param {string} userAddress - Address of the user to remove.
     * @returns {Promise<void>} - Resolves if successful.
     */
    async removeUser(userAddress: string): Promise<void> {
        const transaction = new Transaction();
        transaction.moveCall({
            target: `${PACKAGE_ID}::eduversex_database::remove_user`,
            arguments: [transaction.object(EDUVERSEX_DB), transaction.pure.address(userAddress)],
        });

        const { objectChanges } = await this.signAndExecuteTransaction(transaction);
    }

    /**
     * Adds a course to the EduverseX database.
     * 
     * @param {string} courseName - Name of the course to add.
     * @param {string} courseDescription - Description of the course to add.
     * @param {string} courseAddress - Address of the course to add.
     * @returns {Promise<void>} - Resolves if successful.
     */
    async addCourse(courseName: string, courseDescription: string, courseAddress: string): Promise<void> {
        const transaction = new Transaction();
        transaction.moveCall({
            target: `${PACKAGE_ID}::eduversex_database::add_course`,
            arguments: [transaction.object(EDUVERSEX_DB), transaction.pure.string(courseName), transaction.pure.string(courseDescription), transaction.pure.address(courseAddress)],
        });

        await this.signAndExecuteTransaction(transaction);
    }

    /**
     * Updates a course in the EduverseX database.
     * 
     * @param {string} courseName - Name of the course to update.
     * @param {string} courseDescription - Description of the course to update.
     * @param {string} courseAddress - Address of the course to update.
     * @returns {Promise<void>} - Resolves if successful.
     */
    async updateCourse(courseName: string, courseDescription: string, courseAddress: string): Promise<void> {
        const transaction = new Transaction();
        transaction.moveCall({
            target: `${PACKAGE_ID}::eduversex_database::update_course`,
            arguments: [transaction.object(EDUVERSEX_DB), transaction.pure.string(courseName), transaction.pure.string(courseDescription), transaction.pure.address(courseAddress)],
        });

        const { objectChanges, balanceChanges } = await this.signAndExecuteTransaction(transaction);

    }

    /**
     * Removes a course from the EduverseX database.
     * 
     * @param {string} courseName - Name of the course to remove.
     * @param {string} courseDescription - Description of the course to remove.
     * @param {string} courseAddress - Address of the course to remove.
     * @returns {Promise<void>} - Resolves if successful.
     */
    async removeCourse(courseName: string, courseDescription: string, courseAddress: string): Promise<void> {
        const transaction = new Transaction();
        transaction.moveCall({
            target: `${PACKAGE_ID}::eduversex_database::remove_course`,
            arguments: [transaction.object(EDUVERSEX_DB), transaction.pure.address(courseAddress)],
        });

        const { objectChanges, balanceChanges } = await this.signAndExecuteTransaction(transaction);
    }


    /**
     * Enrolls a user in a course in the EduverseX database.
     * 
     * @param {string} courseAddress - Address of the course to enroll in.
     * @param {string} userAddress - Address of the user to enroll.
     * @returns {Promise<void>} - Resolves if successful, otherwise prints an error message and exits with status code 1.
     */
    async enrollInCourse(courseAddress: string, userAddress: string): Promise<void> {
        const transaction = new Transaction();
        transaction.moveCall({
            target: `${PACKAGE_ID}::eduversex_database::enroll_in_course`,
            arguments: [transaction.object(EDUVERSEX_DB), transaction.pure.address(userAddress), transaction.pure.address(courseAddress)],
        });

        const { objectChanges, balanceChanges } = await this.signAndExecuteTransaction(transaction);
        if (balanceChanges) {
            console.log("Cost to remove_course:", this.parseCost(balanceChanges[0].amount), "SUI");
        }
        if (!objectChanges) {
            console.error("Error: RPC did not return objectChanges");
            process.exit(1);
        }
    }

    /**
     * Completes a course for a user in the EduverseX database.
     * 
     * @param {string} courseAddress - Address of the course to complete.
     * @param {string} userAddress - Address of the user to complete the course for.
     * @returns {Promise<void>} - Resolves if successful, otherwise prints an error message and exits with status code 1.
     */
    async completeCourse(courseAddress: string, userAddress: string): Promise<void> {
        const transaction = new Transaction();
        transaction.moveCall({
            target: `${PACKAGE_ID}::eduversex_database::complete_course`,
            arguments: [transaction.object(EDUVERSEX_DB), transaction.pure.address(userAddress), transaction.pure.address(courseAddress)],
        });

        const { objectChanges, balanceChanges } = await this.signAndExecuteTransaction(transaction);
    }


    async addGame(name: string, description: string, contractAddress: string): Promise<void> {
        const transaction = new Transaction();
        transaction.moveCall({
            target: `${PACKAGE_ID}::eduversex_database::add_game`,
            arguments: [transaction.object(EDUVERSEX_DB), transaction.pure.string(name), transaction.pure.string(description), transaction.pure.address(contractAddress)],
        });

        const { objectChanges, balanceChanges } = await this.signAndExecuteTransaction(transaction);
    }

    async awardBadge(userAddress: string, badge: string): Promise<void> {
        const transaction = new Transaction();
        transaction.moveCall({
            target: `${PACKAGE_ID}::eduversex_database::award_badge`,
            arguments: [transaction.object(EDUVERSEX_DB),transaction.pure.address(userAddress), transaction.pure.string(badge)],
        });

        const { objectChanges, balanceChanges } = await this.signAndExecuteTransaction(transaction);
    }

    async removeGame(name: string, description : string, contractAddress: string): Promise<void> {
        const trx = new Transaction();
        trx.moveCall({
            target: `${PACKAGE_ID}::eduversex_database::remove_game`,
            arguments: [trx.object(EDUVERSEX_DB), trx.pure.address(contractAddress)],
        });

        const {objectChanges, balanceChanges} = await this.signAndExecuteTransaction(trx);
    }

    async updateXp(userAddress: string, xp : number): Promise<void> {
        const trx = new Transaction();
        trx.moveCall({
            target: `${PACKAGE_ID}::eduversex_database::update_xp`,
            arguments: [trx.object(EDUVERSEX_DB), trx.pure.address(userAddress), trx.pure.u64(xp)],
        });

        const {objectChanges, balanceChanges} = await this.signAndExecuteTransaction(trx);
    }

    async getUserDetails(userAddress : string){
        const trx = new Transaction();
        trx.moveCall({
            target: `${PACKAGE_ID}::eduversex_database::get_user`,
            arguments: [trx.object(EDUVERSEX_DB),trx.pure.address(userAddress)],
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

// const eduverseClient = new EduverseClient();
// eduverseClient.add_user('Junior', '0x979bc30c4825f1e05bbacfe6fb1c0ea76ce176a2e4603c394fcad691058bfb97');
