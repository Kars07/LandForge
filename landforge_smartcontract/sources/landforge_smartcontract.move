/// Module: landforge_smartcontract
/// Landforge — On-chain real estate document verification and ownership transfer on Sui.
///
/// Flow:
///   1. Agent calls `register_listing` with AI-verified document_hash + fields_hash.
///      The document is encrypted off-chain; only the hash is stored on-chain.
///   2. Listing is published on the platform (is_listed = true).
///   3. Buyer pays via `purchase_listing`. SUI is escrowed in the Listing object.
///   4. Platform calls `transfer_ownership` — escrow is released to seller,
///      ownership NFT is transferred to buyer, decrypt_key is revealed.
///   5. Buyer uses decrypt_key to decrypt and sign the document off-chain.

module landforge_smartcontract::landforge_smartcontract {

    use sui::object::{Self, UID};
    use sui::tx_context::{Self, TxContext};
    use sui::transfer;
    use sui::coin::{Self, Coin};
    use sui::sui::SUI;
    use sui::balance::{Self, Balance};
    use sui::event;
    use std::string::{Self, String};
    use std::option::{Self, Option};

    // ── Error codes ──────────────────────────────────────────────────────────

    const ENotSeller:           u64 = 1;
    const ENotPlatform:         u64 = 2;
    const EAlreadyListed:       u64 = 3;
    const ENotListed:           u64 = 4;
    const EAlreadySold:         u64 = 5;
    const EInsufficientPayment: u64 = 6;
    const ENotBuyer:            u64 = 7;
    const EHashMismatch:        u64 = 8;
    const ENotVerified:         u64 = 9;

    // ── Platform capability (admin) ───────────────────────────────────────────

    /// Shared capability object — only the platform address that holds this
    /// can call privileged functions (transfer_ownership, delist).
    public struct PlatformCap has key, store {
        id: UID,
        platform: address,
    }

    // ── Core objects ─────────────────────────────────────────────────────────

    /// A property listing on the Landforge platform.
    /// Created by a real estate agent after AI verification passes.
    public struct Listing has key, store {
        id: UID,

        /// Seller (real estate agent or property owner)
        seller: address,

        /// Property metadata
        property_id:     String,   // e.g. "LG/CofO/2019/004521"
        property_address: String,
        document_type:   String,   // "certificate_of_occupancy" etc.

        /// AI verification outputs (set at registration, immutable after)
        document_hash: String,     // SHA-256 of encrypted document bytes
        fields_hash:   String,     // SHA-256 of verified extracted fields JSON

        /// Listing state
        is_verified: bool,         // true once AI agent confirms hashes
        is_listed:   bool,         // true once agent registers listing
        is_sold:     bool,         // true after ownership transfer

        /// Price in MIST (1 SUI = 1_000_000_000 MIST)
        price_mist: u64,

        /// Escrowed payment held until transfer_ownership is called
        escrow: Balance<SUI>,

        /// Buyer address set at purchase time
        buyer: Option<address>,

        /// Encrypted document decrypt key — revealed to buyer after payment
        /// Stored encrypted; only meaningful after transfer_ownership unlocks it
        decrypt_key_encrypted: String,
        decrypt_key_revealed:  Option<String>,
    }

    /// Ownership certificate NFT minted to the buyer after purchase.
    public struct OwnershipCertificate has key, store {
        id: UID,
        listing_id:       address,  // ID of the Listing object
        owner:            address,
        property_id:      String,
        property_address: String,
        document_hash:    String,
        fields_hash:      String,
        document_type:    String,
        transfer_epoch:   u64,
    }

    // ── Events ────────────────────────────────────────────────────────────────

    public struct ListingRegistered has copy, drop {
        listing_id:       address,
        seller:           address,
        property_id:      String,
        document_hash:    String,
        price_mist:       u64,
    }

    public struct ListingPurchased has copy, drop {
        listing_id:  address,
        buyer:       address,
        price_mist:  u64,
    }

    public struct OwnershipTransferred has copy, drop {
        listing_id:       address,
        seller:           address,
        buyer:            address,
        document_hash:    String,
        certificate_id:   address,
    }

    public struct DocumentVerified has copy, drop {
        listing_id:    address,
        document_hash: String,
        fields_hash:   String,
    }

    // ── Init ─────────────────────────────────────────────────────────────────

    /// Called once on module publish — creates and transfers PlatformCap to deployer.
    fun init(ctx: &mut TxContext) {
        let cap = PlatformCap {
            id: object::new(ctx),
            platform: tx_context::sender(ctx),
        };
        transfer::transfer(cap, tx_context::sender(ctx));
    }

    // ── Agent-facing: register a verified listing ─────────────────────────────

    /// Called by the real estate agent after the AI has verified the document.
    /// `document_hash` and `fields_hash` are produced by landforge_hash_document.
    /// `decrypt_key_encrypted` is the encrypted document key from the platform.
    public entry fun register_listing(
        property_id:           String,
        property_address:      String,
        document_type:         String,
        document_hash:         String,
        fields_hash:           String,
        price_mist:            u64,
        decrypt_key_encrypted: String,
        ctx: &mut TxContext,
    ) {
        let listing = Listing {
            id: object::new(ctx),
            seller: tx_context::sender(ctx),
            property_id,
            property_address,
            document_type,
            document_hash: document_hash,
            fields_hash:   fields_hash,
            is_verified:   true,
            is_listed:     true,
            is_sold:       false,
            price_mist,
            escrow: balance::zero<SUI>(),
            buyer:  option::none(),
            decrypt_key_encrypted,
            decrypt_key_revealed: option::none(),
        };

        let listing_id = object::uid_to_address(&listing.id);

        event::emit(ListingRegistered {
            listing_id,
            seller: tx_context::sender(ctx),
            property_id: listing.property_id,
            document_hash: listing.document_hash,
            price_mist,
        });

        event::emit(DocumentVerified {
            listing_id,
            document_hash: listing.document_hash,
            fields_hash:   listing.fields_hash,
        });

        transfer::share_object(listing);
    }

    // ── Authenticity check ────────────────────────────────────────────────────

    /// Anyone can call this to verify the on-chain hashes match what the AI produced.
    /// Returns true if both hashes match — used by the frontend before showing a listing.
    public fun verify_authenticity(
        listing:       &Listing,
        document_hash: &String,
        fields_hash:   &String,
    ): bool {
        assert!(listing.is_verified, ENotVerified);
        &listing.document_hash == document_hash && &listing.fields_hash == fields_hash
    }

    // ── Buyer: purchase a listing ─────────────────────────────────────────────

    /// Buyer pays exactly `listing.price_mist` SUI.
    /// Payment is held in escrow inside the Listing object until transfer_ownership.
    public entry fun purchase_listing(
        listing:  &mut Listing,
        payment:  Coin<SUI>,
        ctx: &mut TxContext,
    ) {
        assert!(listing.is_listed, ENotListed);
        assert!(!listing.is_sold,  EAlreadySold);
        assert!(
            coin::value(&payment) >= listing.price_mist,
            EInsufficientPayment
        );

        let buyer = tx_context::sender(ctx);

        // Split exact amount into escrow, return remainder to buyer
        let mut payment_balance = coin::into_balance(payment);
        let escrow_amount = balance::split(&mut payment_balance, listing.price_mist);
        balance::join(&mut listing.escrow, escrow_amount);

        // Return any overpayment
        if (balance::value(&payment_balance) > 0) {
            let change = coin::from_balance(payment_balance, ctx);
            transfer::public_transfer(change, buyer);
        } else {
            balance::destroy_zero(payment_balance);
        };

        listing.buyer = option::some(buyer);

        event::emit(ListingPurchased {
            listing_id: object::uid_to_address(&listing.id),
            buyer,
            price_mist: listing.price_mist,
        });
    }

    // ── Platform: transfer ownership and release escrow ───────────────────────

    /// Called by the platform (PlatformCap holder) after payment is confirmed.
    /// - Releases escrow to seller
    /// - Reveals decrypt_key to buyer
    /// - Mints OwnershipCertificate NFT to buyer
    /// - Marks listing as sold
    public entry fun transfer_ownership(
        cap:          &PlatformCap,
        listing:      &mut Listing,
        decrypt_key:  String,
        ctx:          &mut TxContext,
    ) {
        assert!(tx_context::sender(ctx) == cap.platform, ENotPlatform);
        assert!(listing.is_listed, ENotListed);
        assert!(!listing.is_sold,  EAlreadySold);
        assert!(option::is_some(&listing.buyer), ENotBuyer);

        let buyer = *option::borrow(&listing.buyer);

        // Release escrow to seller
        let escrow_value = balance::value(&listing.escrow);
        let seller_payment = coin::from_balance(
            balance::split(&mut listing.escrow, escrow_value),
            ctx,
        );
        transfer::public_transfer(seller_payment, listing.seller);

        // Reveal decrypt key to buyer
        listing.decrypt_key_revealed = option::some(decrypt_key);

        // Mark as sold
        listing.is_sold   = true;
        listing.is_listed = false;

        // Mint ownership certificate NFT to buyer
        let certificate = OwnershipCertificate {
            id:               object::new(ctx),
            listing_id:       object::uid_to_address(&listing.id),
            owner:            buyer,
            property_id:      listing.property_id,
            property_address: listing.property_address,
            document_hash:    listing.document_hash,
            fields_hash:      listing.fields_hash,
            document_type:    listing.document_type,
            transfer_epoch:   tx_context::epoch(ctx),
        };

        let certificate_id = object::uid_to_address(&certificate.id);

        event::emit(OwnershipTransferred {
            listing_id:     object::uid_to_address(&listing.id),
            seller:         listing.seller,
            buyer,
            document_hash:  listing.document_hash,
            certificate_id,
        });

        transfer::transfer(certificate, buyer);
    }

    // ── Seller: delist a property ─────────────────────────────────────────────

    /// Seller can delist if not yet purchased.
    public entry fun delist(
        listing: &mut Listing,
        ctx:     &mut TxContext,
    ) {
        assert!(tx_context::sender(ctx) == listing.seller, ENotSeller);
        assert!(!listing.is_sold, EAlreadySold);
        assert!(option::is_none(&listing.buyer), EAlreadyListed); // no buyer yet
        listing.is_listed = false;
    }

    // ── Read-only accessors ───────────────────────────────────────────────────

    public fun get_document_hash(listing: &Listing): &String {
        &listing.document_hash
    }

    public fun get_fields_hash(listing: &Listing): &String {
        &listing.fields_hash
    }

    public fun get_price(listing: &Listing): u64 {
        listing.price_mist
    }

    public fun is_verified(listing: &Listing): bool {
        listing.is_verified
    }

    public fun is_listed(listing: &Listing): bool {
        listing.is_listed
    }

    public fun is_sold(listing: &Listing): bool {
        listing.is_sold
    }

    public fun get_seller(listing: &Listing): address {
        listing.seller
    }

    public fun get_buyer(listing: &Listing): &Option<address> {
        &listing.buyer
    }

    public fun get_decrypt_key(listing: &Listing, ctx: &TxContext): &Option<String> {
        // Only buyer can read the revealed decrypt key
        let caller = tx_context::sender(ctx);
        assert!(
            option::is_some(&listing.buyer) &&
            *option::borrow(&listing.buyer) == caller,
            ENotBuyer
        );
        &listing.decrypt_key_revealed
    }

    public fun get_certificate_owner(cert: &OwnershipCertificate): address {
        cert.owner
    }

    public fun get_certificate_document_hash(cert: &OwnershipCertificate): &String {
        &cert.document_hash
    }
}
