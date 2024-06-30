import { getDocument, updateDocumentById } from "@/firebase";
import { solanaConnection } from "@/rpc";
import { StoredAccount } from "@/types";
import { transactionValidTime } from "@/utils/constants";
import { decrypt } from "@/utils/cryptography";
import { errorHandler } from "@/utils/handlers";
import { refundSender } from "@/utils/refund";
import { getSecondsElapsed } from "@/utils/time";
import { Keypair } from "@solana/web3.js";

export async function unlockUnusedAccounts() {
  const lockedAccounts = (await getDocument({
    collectionName: "accounts",
    queries: [["locked", "==", true]],
  })) as StoredAccount[];

  for (const { id, secretKey, lockedAt } of lockedAccounts) {
    try {
      const account = Keypair.fromSecretKey(
        new Uint8Array(JSON.parse(decrypt(secretKey)))
      );
      const balance = await solanaConnection.getBalance(account.publicKey);
      const durationSinceLocked = getSecondsElapsed(lockedAt.seconds);
      const isPaymentFinished = durationSinceLocked > transactionValidTime;

      if (!isPaymentFinished) continue;

      if (balance === 0) {
        updateDocumentById({
          updates: { locked: false, lockedAt: null },
          collectionName: "accounts",
          id: id || "",
        });
      } else {
        refundSender(secretKey);
      }
    } catch (error) {
      errorHandler(error);
    }
  }
}
