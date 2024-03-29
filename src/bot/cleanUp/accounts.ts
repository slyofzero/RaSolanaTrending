import { getDocument, updateDocumentById } from "@/firebase";
import { provider } from "@/rpc";
import { StoredAccount } from "@/types";
import { decrypt } from "@/utils/cryptography";
import { errorHandler } from "@/utils/handlers";
import { ethers } from "ethers";

export async function unlockUnusedAccounts() {
  const lockedAccounts = (await getDocument({
    collectionName: "accounts",
    queries: [["locked", "==", true]],
  })) as StoredAccount[];

  for (const { id, secretKey } of lockedAccounts) {
    try {
      const decryptedKey = decrypt(secretKey);
      const wallet = new ethers.Wallet(decryptedKey, provider);
      const balance = (await wallet.getBalance()).toBigInt();

      if (balance === BigInt(0)) {
        updateDocumentById({
          updates: { locked: false, lockedAt: null },
          collectionName: "accounts",
          id: id || "",
        }).then(() => `Unlocked account ${wallet.address}`);
      }
    } catch (error) {
      errorHandler(error);
    }
  }
}
