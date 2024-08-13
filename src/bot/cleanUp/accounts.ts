import { getDocument, updateDocumentById } from "@/firebase";
import { solanaConnection } from "@/rpc";
import { StoredAccount } from "@/types";
import { splitPaymentsWith, transactionValidTime } from "@/utils/constants";
import { decrypt } from "@/utils/cryptography";
import { errorHandler, log } from "@/utils/handlers";
import { getSecondsElapsed } from "@/utils/time";
import { sendTransaction } from "@/utils/web3";
import { Keypair } from "@solana/web3.js";

export async function unlockUnusedAccounts() {
  log("Unlocking unused accounts...");

  const lockedAccounts = (await getDocument({
    collectionName: "accounts",
    queries: [["locked", "==", true]],
  })) as StoredAccount[];

  for (const { id, secretKey, lockedAt } of lockedAccounts) {
    try {
      const decryptedSecretKey = decrypt(secretKey);
      const account = Keypair.fromSecretKey(
        new Uint8Array(JSON.parse(decryptedSecretKey))
      );
      const balance = await solanaConnection.getBalance(account.publicKey);
      const durationSinceLocked = lockedAt
        ? getSecondsElapsed(lockedAt.seconds)
        : 999999;
      const isPaymentFinished = durationSinceLocked > transactionValidTime;

      if (!isPaymentFinished) continue;

      if (balance > 0) {
        log(`${account.publicKey.toBase58()} holds ${balance}`);

        updateDocumentById({
          updates: { locked: true, lockedAt: null },
          collectionName: "accounts",
          id: id || "",
        });

        await sendTransaction(
          decryptedSecretKey,
          balance,
          splitPaymentsWith.main.address
        );

        log(`${account.publicKey.toBase58()} emptied`);
      } else {
        updateDocumentById({
          updates: { locked: false, lockedAt: null },
          collectionName: "accounts",
          id: id || "",
        });
        log(`${account.publicKey.toBase58()} unlocked`);
      }
    } catch (error) {
      errorHandler(error);
    }
  }
}
