/// Module: edx_token
module edx_token::edx_token{
    use sui::coin::{Self, TreasuryCap};
    use sui::url::{Self, Url};

    public struct EDX_TOKEN has drop {}

    fun init(witness: EDX_TOKEN, ctx: &mut TxContext) {
        let (treasury, metadata) = coin::create_currency(
            witness, 
            6, 
            b"EDX", 
            b"EDX_TOKEN", 
            b"EduXverse Token by Team sushi sui", 
            option::some<Url>(url::new_unsafe_from_bytes(b"https://ibb.co/K2B3pSV")), 
            ctx);
        transfer::public_freeze_object(metadata);
        transfer::public_transfer(treasury, ctx.sender())
    }

    public fun mint(
        treasury_cap: &mut TreasuryCap<EDX_TOKEN>, 
        amount: u64, 
        recipient: address, 
        ctx: &mut TxContext,
    ) {
        let coin = coin::mint(treasury_cap, amount, ctx);
        transfer::public_transfer(coin, recipient)
    }
}
