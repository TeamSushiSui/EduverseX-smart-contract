import { Transaction } from "@mysten/sui/transactions";
import { PACKAGE_ID, EDUVERSEX_DB } from "../addresses/smc_address.json";
import "dotenv/config";
import { Ed25519Keypair } from "@mysten/sui/keypairs/ed25519";
import { fromB64 } from "@mysten/sui/utils";
import { SuiClient, getFullnodeUrl } from "@mysten/sui/client";
import { bcs, fromHex, toHex } from "@mysten/bcs";
import { Courses } from "./courses_smc_interaction";

export class EduverseClient {
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
     * Signs and executes the given transaction using the client's keypair.
     * @param {Transaction} transaction the transaction to sign and execute
     * @returns {Promise<boolean>} true if the transaction was executed successfully, false otherwise
     */
    private async signAndExecuteTransaction(transaction: Transaction): Promise<boolean> {
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
    private async devInspectTransactionBlock(transaction: Transaction) : Promise<(any | null)> {
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

    /**
     * Adds a user to the EduverseX database.
     * @param {string} name - Name of the user to add.
     * @param {string} userAddress - Address of the user to add.
     * @returns {Promise<boolean>} - Resolves true if the user was added successfully, false otherwise.
     */
    async addUser(name: string, userAddress: string): Promise<boolean> {
        const transaction = new Transaction();
        transaction.moveCall({
            target: `${PACKAGE_ID}::eduversex_database::add_user`,
            arguments: [transaction.object(EDUVERSEX_DB), transaction.pure.address(userAddress), transaction.pure.string(name)],
        });

        return await this.signAndExecuteTransaction(transaction);
    }

    /**
     * Removes a user from the EduverseX database.
     * 
     * @param {string} userAddress - Address of the user to remove.
     * @returns {Promise<boolean>} - Resolves true if the user was removed successfully, false otherwise.
     */
    async removeUser(userAddress: string): Promise<boolean> {
        const transaction = new Transaction();
        transaction.moveCall({
            target: `${PACKAGE_ID}::eduversex_database::remove_user`,
            arguments: [transaction.object(EDUVERSEX_DB), transaction.pure.address(userAddress)],
        });

        return await this.signAndExecuteTransaction(transaction);
    }


    /**
     * Adds a course to the EduverseX database.
     * @param {string} courseName - Name of the course to add.
     * @param {string} courseDescription - Description of the course to add.
     * @param {string} courseAddress - Address of the course to add.
     * @returns {Promise<boolean>} - Resolves true if the course was added successfully, false otherwise.
     */
    async addCourse(courseName: string, courseDescription: string, courseAddress: string): Promise<boolean> {
        const transaction = new Transaction();
        transaction.moveCall({
            target: `${PACKAGE_ID}::eduversex_database::add_course`,
            arguments: [transaction.object(EDUVERSEX_DB), transaction.pure.string(courseName), transaction.pure.string(courseDescription), transaction.pure.address(courseAddress)],
        });
        return await this.signAndExecuteTransaction(transaction);
    }

    /**
     * Updates a course in the EduverseX database.
     * @param {string} courseName - Name of the course to update.
     * @param {string} courseDescription - Description of the course to update.
     * @param {string} courseAddress - Address of the course to update.
     * @returns {Promise<boolean>} - Resolves true if the course was updated successfully, false otherwise.
     */
    async updateCourse(courseName: string, courseDescription: string, courseAddress: string): Promise<boolean> {
        const transaction = new Transaction();
        transaction.moveCall({
            target: `${PACKAGE_ID}::eduversex_database::update_course`,
            arguments: [transaction.object(EDUVERSEX_DB), transaction.pure.string(courseName), transaction.pure.string(courseDescription), transaction.pure.address(courseAddress)],
        });

        return await this.signAndExecuteTransaction(transaction);

    }

    /**
     * Removes a course from the EduverseX database.
     * 
     * @param {string} courseName - Name of the course to remove.
     * @param {string} courseDescription - Description of the course to remove.
     * @param {string} courseAddress - Address of the course to remove.
     * @returns {Promise<boolean>} - Resolves true if the course was removed successfully, false otherwise.
     */
    async removeCourse(courseName: string, courseDescription: string, courseAddress: string): Promise<boolean> {
        const transaction = new Transaction();
        transaction.moveCall({
            target: `${PACKAGE_ID}::eduversex_database::remove_course`,
            arguments: [transaction.object(EDUVERSEX_DB), transaction.pure.address(courseAddress)],
        });

        return await this.signAndExecuteTransaction(transaction);
    }

    /**
     * Enrolls a user in a course in the EduverseX database.
     * 
     * @param {string} courseAddress - Address of the course to enroll in.
     * @param {string} userAddress - Address of the user to enroll in the course.
     * @returns {Promise<boolean>} - Resolves true if the course was enrolled in successfully, false otherwise.
     */
    async enrollInCourse(courseAddress: string, userAddress: string): Promise<boolean> {
        const transaction = new Transaction();
        transaction.moveCall({
            target: `${PACKAGE_ID}::eduversex_database::enroll_in_course`,
            arguments: [transaction.object(EDUVERSEX_DB), transaction.pure.address(userAddress), transaction.pure.address(courseAddress)],
        });

        return await this.signAndExecuteTransaction(transaction);
    }

    /**
     * Completes a course in the EduverseX database.
     * 
     * @param {string} courseAddress - Address of the course to complete.
     * @param {string} userAddress - Address of the user that completed the course.
     * @returns {Promise<boolean>} - Resolves true if the course was completed successfully, false otherwise.
     */

    async completeCourse(courseAddress: string, userAddress: string): Promise<boolean> {
        const transaction = new Transaction();
        const course = new Courses();
        const course_details = await course.getCourseDetails(courseAddress);
        if (course_details?.xp !== undefined) {
            this.updateXp(userAddress, parseInt(course_details.xp));
        }
        transaction.moveCall({
            target: `${PACKAGE_ID}::eduversex_database::complete_course`,
            arguments: [transaction.object(EDUVERSEX_DB), transaction.pure.address(userAddress), transaction.pure.address(courseAddress)],
        });
    
        return await this.signAndExecuteTransaction(transaction);
    }

    /**
     * Adds a game to the EduverseX database.
     * 
     * @param {string} name - Name of the game to add.
     * @param {string} description - Description of the game to add.
     * @param {string} contractAddress - Contract address of the game to add.
     * @returns {Promise<boolean>} - Resolves true if the game was added successfully, false otherwise.
     */
    async addGame(name: string, description: string, contractAddress: string): Promise<boolean> {
        const transaction = new Transaction();
        transaction.moveCall({
            target: `${PACKAGE_ID}::eduversex_database::add_game`,
            arguments: [transaction.object(EDUVERSEX_DB), transaction.pure.string(name), transaction.pure.string(description), transaction.pure.address(contractAddress)],
        });

        return await this.signAndExecuteTransaction(transaction);
    }

    async addNFT(contractAddress: string): Promise<boolean> {
        const transaction = new Transaction();
        transaction.moveCall({
            target: `${PACKAGE_ID}::eduversex_database::add_nft`,
            arguments: [transaction.object(EDUVERSEX_DB), transaction.pure.address(contractAddress)],
        });

        return await this.signAndExecuteTransaction(transaction);
    }

    async removeNFT(contractAddress: string): Promise<boolean> {
        const transaction = new Transaction();
        transaction.moveCall({
            target: `${PACKAGE_ID}::eduversex_database::remove_nft`,
            arguments: [transaction.object(EDUVERSEX_DB), transaction.pure.address(contractAddress)],
        });

        return await this.signAndExecuteTransaction(transaction);
    }

    /**
     * Awards a badge to a user in the EduverseX database.
     * 
     * @param {string} userAddress - Address of the user to award the badge to.
     * @param {string} badge - Badge to award to the user.
     * @returns {Promise<boolean>} - Resolves true if the badge was awarded successfully, false otherwise.
     */
    async awardBadge(userAddress: string, badge: string): Promise<boolean> {
        const transaction = new Transaction();
        transaction.moveCall({
            target: `${PACKAGE_ID}::eduversex_database::award_badge`,
            arguments: [transaction.object(EDUVERSEX_DB), transaction.pure.address(userAddress), transaction.pure.string(badge)],
        });

        return await this.signAndExecuteTransaction(transaction);
    }

    /**
     * Removes a game from the EduverseX database.
     * 
     * @param {string} name - Name of the game to remove.
     * @param {string} description - Description of the game to remove.
     * @param {string} contractAddress - Contract address of the game to remove.
     * @returns {Promise<boolean>} - Resolves true if the game was removed successfully, false otherwise.
     */
    async removeGame(name: string, description: string, contractAddress: string): Promise<boolean> {
        const trx = new Transaction();
        trx.moveCall({
            target: `${PACKAGE_ID}::eduversex_database::remove_game`,
            arguments: [trx.object(EDUVERSEX_DB), trx.pure.address(contractAddress)],
        });

        return await this.signAndExecuteTransaction(trx);
    }

    /**
     * Updates the XP of a user in the EduverseX database.
     * 
     * @param {string} userAddress - Address of the user to update the XP for.
     * @param {number} xp - Amount of XP to add to the user's current XP.
     * @returns {Promise<boolean>} - Resolves true if the XP was updated successfully, false otherwise.
     */
    async updateXp(userAddress: string, xp: number): Promise<boolean> {
        const trx = new Transaction();
        trx.moveCall({
            target: `${PACKAGE_ID}::eduversex_database::update_xp`,
            arguments: [trx.object(EDUVERSEX_DB), trx.pure.address(userAddress), trx.pure.u64(xp)],
        });

        return await this.signAndExecuteTransaction(trx);
    }

    /**
     * Retrieves the details of a user in the EduverseX database.
     * @param {string} userAddress - Address of the user to retrieve the details for.
     * @returns {Promise<{name: string, xp: number} | null>} - Resolves an object containing the user's name and XP if the user exists in the database, null otherwise.
     */
    async getUserDetails(userAddress: string) {
        const trx = new Transaction();
        trx.moveCall({
            target: `${PACKAGE_ID}::eduversex_database::get_user`,
            arguments: [trx.object(EDUVERSEX_DB), trx.pure.address(userAddress)],
        });
        const returnValues = await this.devInspectTransactionBlock(trx);
        if (returnValues) {
            if (returnValues[0] !== undefined) {
                const user_name = bcs.string().parse(Uint8Array.from(returnValues[0][0][0]));
                const xp = bcs.u64().parse(Uint8Array.from(returnValues[0][1][0]));

                return {
                    name: user_name,
                    xp: xp,
                };
            } else {
                return null
            }
        } else {
            return null;
        }
    }

    private async getVectorAddress(vec){
        const Address = bcs.bytes(32).transform({
            input: (val: string) => fromHex(val),
            output: (val) => toHex(val),
        });
        const addresses = bcs.vector(Address).parse(Uint8Array.from(vec));
        return addresses.map(str => `0x${str}`);
    }

    async getAllCoursesAddress() {
        const trx = new Transaction();
        trx.moveCall({
            target: `${PACKAGE_ID}::eduversex_database::get_all_courses_addresses`,
            arguments: [trx.object(EDUVERSEX_DB)],
        });
        const returnValues = await this.devInspectTransactionBlock(trx);
        if (returnValues) {
            if (returnValues[0] !== undefined) {
                return await this.getVectorAddress(returnValues[0][0][0])
            } else {
                return null
            }
        } else {
            return null;
        }
    }

    async getAllGameAddress() {
        const trx = new Transaction();
        trx.moveCall({
            target: `${PACKAGE_ID}::eduversex_database::get_all_game_addresses`,
            arguments: [trx.object(EDUVERSEX_DB)],
        });
        const returnValues = await this.devInspectTransactionBlock(trx);
        if (returnValues) {
            if (returnValues[0] !== undefined) {
                return await this.getVectorAddress(returnValues[0][0][0])
            } else {
                return null
            }
        } else {
            return null;
        }
    }

    async getAllNftsAddresses() {
        const trx = new Transaction();
        trx.moveCall({
            target: `${PACKAGE_ID}::eduversex_database::get_all_nfts`,
            arguments: [trx.object(EDUVERSEX_DB)],
        });
        const returnValues = await this.devInspectTransactionBlock(trx);
        if (returnValues) {
            if (returnValues[0] !== undefined) {
                return await this.getVectorAddress(returnValues[0][0][0])
            } else {
                return null
            }
        } else {
            return null;
        }
    }
}

// const Private_key = process.env.PRIVATE_KEY;

// if (!Private_key) {
//     throw new Error("Please set your private key in a .env file");
// }
// console.log(Private_key);

// const eduverseClient = new EduverseClient(Private_key);
// console.log(await eduverseClient.addUser('Junior', '0x979ba30c4825f1e05bbacfe6fb1c0ea76ce176a2e4603c394fcad691058bfb97'));
// console.log(await eduverseClient.addCourse('Sui basics 2', "Introduction to the Sui Blockchain 2",'0x46754ee0d3ca295029cf46eb346d823781f87d229a56582ecd05c67a05b14e33'));
// console.log(await eduverseClient.getAllCoursesAddress());
// console.log(await eduverseClient.getUserDetails('0x979bc30c4825f1e05bbacfe6fb1c0ea76ce176a2e4603c394fcad691058bfb97'));
