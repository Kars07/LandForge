import { useCurrentAccount, useSignAndExecuteTransaction, useSuiClient } from '@mysten/dapp-kit';
import { Transaction } from '@mysten/sui/transactions';

export const CONTRACT_ADDRESS = "0xb0e8e4bc923036a01049d35146f89c1ae4b1325b16e4eefe29487ae68192cea9";
export const MODULE_NAME = "landforge_smartcontract";

export function useSuiContract() {
  const currentAccount = useCurrentAccount();
  const suiClient = useSuiClient();
  // Use the simple form — no custom execute override which caused connection errors with dapp-kit v1
  const { mutateAsync: signAndExecuteTransaction } = useSignAndExecuteTransaction();

  const registerListing = async (
    propertyId: string,
    propertyAddress: string,
    documentType: string,
    documentHash: string,
    fieldsHash: string,
    priceMist: string | number | bigint,
    decryptKeyEncrypted: string
  ) => {
    if (!currentAccount) throw new Error("Wallet not connected. Please connect your Sui wallet first.");

    const txb = new Transaction();
    txb.moveCall({
      target: `${CONTRACT_ADDRESS}::${MODULE_NAME}::register_listing`,
      arguments: [
        txb.pure.string(propertyId),
        txb.pure.string(propertyAddress),
        txb.pure.string(documentType),
        txb.pure.string(documentHash),
        txb.pure.string(fieldsHash),
        txb.pure.u64(BigInt(priceMist)),  // must be bigint for u64
        txb.pure.string(decryptKeyEncrypted),
      ],
    });

    return await signAndExecuteTransaction({
      transaction: txb,
      chain: 'sui:testnet',
    });
  };

  const purchaseListing = async (listingId: string, priceMist: string | number | bigint) => {
    if (!currentAccount) throw new Error("Wallet not connected. Please connect your Sui wallet first.");

    const txb = new Transaction();
    const [coin] = txb.splitCoins(txb.gas, [txb.pure.u64(BigInt(priceMist))]);

    txb.moveCall({
      target: `${CONTRACT_ADDRESS}::${MODULE_NAME}::purchase_listing`,
      arguments: [
        txb.object(listingId),
        coin,
      ],
    });

    return await signAndExecuteTransaction({
      transaction: txb,
      chain: 'sui:testnet',
    });
  };

  const verifyAuthenticity = async (listingId: string, documentHash: string, fieldsHash: string) => {
    const txb = new Transaction();
    txb.moveCall({
      target: `${CONTRACT_ADDRESS}::${MODULE_NAME}::verify_authenticity`,
      arguments: [
        txb.object(listingId),
        txb.pure.string(documentHash),
        txb.pure.string(fieldsHash),
      ],
    });

    const sender = currentAccount?.address || "0x0000000000000000000000000000000000000000000000000000000000000000";
    const devInspect = await suiClient.devInspectTransactionBlock({
      transactionBlock: txb,
      sender,
    });

    if (devInspect.error) return false;
    return true;
  };

  return {
    currentAccount,
    registerListing,
    verifyAuthenticity,
    purchaseListing,
  };
}
