module nft::nft {
    // Import necessary modules and libraries
    use std::string::{Self,String};  // For handling string operations
    use sui::url::{Self, Url};  // For managing URLs (e.g., for NFT metadata)
    use sui::event;  // For emitting events (used when minting NFTs)
    use sui::coin::{Self, Coin};  // For coin-related operations (for NFT purchases)
    use sui::sui::SUI;  // The SUI coin, which is the native cryptocurrency of the Sui blockchain

    /// Structure representing the EduverseXNFT
    /// This struct has the necessary attributes for a custom NFT on the Sui blockchain.
    public struct EduverseXNFT has key, store {
        id: UID,                 // Unique identifier for the NFT
        name: String,            // Name of the NFT
        description: String,     // Description of the NFT
        creator: address,        // Address of the creator of the NFT
        owner: address,          // Address of the current owner of the NFT
        url: Url,                // URL for the metadata or image of the NFT
        price: u64,              // Price of the NFT in SUI
        is_for_sale: bool,       // Boolean flag indicating if the NFT is listed for sale
        // royalty_percent: u8,     // Royalty percentage for the creator on resale
    }

    /// Structure representing the event that occurs when an NFT is minted.
    /// Contains information about the minted NFT.
    public struct NFTMinted has copy, drop {
        object_id: ID,           // The unique ID of the minted NFT
        creator: address,        // The address of the creator of the NFT
        name: String,            // The name of the NFT
    }

    /// Get the `name` of the NFT.
    public fun name(nft: &EduverseXNFT): &String {
        &nft.name
    }

    /// Get the `description` of the NFT.
    public fun description(nft: &EduverseXNFT): &String {
        &nft.description
    }

    /// Get the `url` of the NFT.
    public fun url(nft: &EduverseXNFT): &Url {
        &nft.url
    }

    /// Get the `price` of the NFT.
    public fun price(nft: &EduverseXNFT): &u64 {
        &nft.price
    }

    /// Check if the NFT is for sale.
    public fun check_if_for_sale(nft: &EduverseXNFT): &bool {
        &nft.is_for_sale
    }

    /// Function to mint an NFT and send it to the sender.
    /// Accepts metadata like name, description, URL, and royalty percentage.
    /// Emits an event after the minting process and transfers the NFT to the sender's address.
    #[allow(lint(self_transfer))]  // Disable lint for self-transfer operations
    public fun mint_to_sender(
        name: vector<u8>,           // Name of the NFT as a byte vector
        description: vector<u8>,    // Description of the NFT as a byte vector
        url: vector<u8>,            // URL of the NFT as a byte vector
        // royalty_percent: u8,        // Royalty percentage for resale
        ctx: &mut TxContext         // Transaction context (used for tracking operations)
    ) {
        let sender = ctx.sender();  // Get the address of the transaction sender

        // Create the NFT object with the provided metadata
        let nft = EduverseXNFT {
            id: object::new(ctx),                           // Generate a unique ID for the NFT
            name: string::utf8(name),                       // Convert the byte vector to a string for the name
            description: string::utf8(description),         // Convert the byte vector to a string for the description
            creator: sender,                               // Set the creator to the sender
            owner: sender,                                 // Set the owner to the sender
            url: url::new_unsafe_from_bytes(url),          // Create a URL from the byte vector (unsafe method)
            price: 0,                                      // Set the initial price to 0 (not for sale yet)
            is_for_sale: false,                            // Initially, the NFT is not for sale
            // royalty_percent: royalty_percent,              // Set the royalty percentage
        };

        // Emit an event to notify that the NFT has been minted
        event::emit(NFTMinted {
            object_id: object::id(&nft),  // ID of the minted NFT
            creator: sender,              // Address of the creator
            name: nft.name,               // Name of the NFT
        });

        // Transfer the NFT to the sender
        transfer::public_transfer(nft, sender);
    }

    /// Function to list the NFT for sale by setting the price and sale status.
    public fun list_for_sale(nft: &mut EduverseXNFT, price: u64, ctx : &mut TxContext) {
        assert!(ctx.sender() == nft.owner, 0);  // Ensure the sender is the owner of the NFT
        nft.price = price;           // Set the price of the NFT
        nft.is_for_sale = true;      // Mark the NFT as available for sale
    }

    /// Function to remove the NFT from sale by updating the `is_for_sale` status.
    public fun remove_from_sale(nft: &mut EduverseXNFT, ctx : &mut TxContext) {
        assert!(ctx.sender() == nft.owner, 0);  // Ensure the sender is the owner of the NFT
        nft.is_for_sale = false;     // Mark the NFT as no longer for sale
    }

    /// Function to purchase an NFT.
    /// Ensures that the buyer has enough funds and that the NFT is listed for sale.
    /// Transfers the NFT to the buyer after successful payment.
    public entry fun buy_nft(
        mut nft: EduverseXNFT,       // The NFT being purchased
        buyer: address,              // The address of the buyer
        payment: Coin<SUI>,          // The payment (in SUI coins)
        ctx: &mut TxContext          // Transaction context
    ) {
        assert!(nft.is_for_sale, 0);  // Ensure the NFT is currently for sale
        assert!(coin::value(&payment) >= nft.price * 1_000_000_000, 1);  // Ensure payment is sufficient

        // Transfer the payment (SUI coins) to the current owner
        transfer::public_transfer(payment, nft.owner);

        // Mark the NFT as no longer for sale and update the owner to the buyer
        nft.is_for_sale = false;
        nft.owner = buyer;

        // Transfer the NFT to the buyer
        transfer(nft, buyer, ctx);
    }

    /// Function to transfer the ownership of an NFT to a recipient.
    public fun transfer(
        nft: EduverseXNFT,            // The NFT being transferred
        recipient: address,           // The recipient address
        _: &mut TxContext             // Transaction context
    ) {
        transfer::public_transfer(nft, recipient);  // Transfer the NFT to the recipient
    }

    /// Function to update the description of an existing NFT.
    public fun update_description(
        nft: &mut EduverseXNFT,       // The NFT being updated
        new_description: vector<u8>,  // The new description as a byte vector
        _: &mut TxContext             // Transaction context
    ) {
        nft.description = string::utf8(new_description);  // Update the NFT's description
    }

    /// Function to burn (permanently delete) an NFT.
    public fun burn(
        nft: EduverseXNFT,            // The NFT being burned
        _: &mut TxContext             // Transaction context
    ) {
        // Deconstruct the NFT object and delete the unique ID
        let EduverseXNFT { id, name: _, description: _,creator: _, owner: _, url: _ , price: _, is_for_sale: _} = nft;
        id.delete();  // Permanently delete the NFT's unique identifier
    }

    public fun get_nft(nft: &EduverseXNFT) : (String, String, address, address, std::ascii::String, u64, bool) {
        (nft.name, nft.description, nft.creator, nft.owner, url::inner_url(&nft.url), nft.price, nft.is_for_sale)
    }  
}
