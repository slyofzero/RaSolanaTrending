import { Keypair, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { decrypt } from "./cryptography";
import { sleep } from "./time";
import { sendTransaction } from "./web3";
import { log } from "./handlers";
import { solanaConnection } from "@/rpc";

export async function refundSender(secretKey: string) {
  const account = Keypair.fromSecretKey(
    new Uint8Array(JSON.parse(decrypt(secretKey)))
  );
  const balance = await solanaConnection.getBalance(account.publicKey);
  // const durationSinceLocked = getSecondsElapsed(lockedAt.seconds);
  // const isPaymentFinished = durationSinceLocked > transactionValidTime;

  const signatures = await solanaConnection.getConfirmedSignaturesForAddress2(
    account.publicKey,
    { limit: 5 }
  );

  const senders: [string, number][] = [];

  for (const signature of signatures) {
    const txData = await solanaConnection.getTransaction(signature.signature, {
      commitment: "finalized",
    });
    if (!txData) continue;

    const { meta, transaction } = txData;
    const { accountKeys } = transaction.message;
    const accountKey = accountKeys.findIndex(
      (publicKey) => account.publicKey.toBase58() === publicKey.toBase58()
    );

    if (accountKey === -1 || !meta) continue;

    let sentAmount: number = 0;
    let receivedAmount: number = 0;
    let sender: string = "";

    for (const [index, postBalance] of meta.postBalances.entries()) {
      const preBalance = meta.preBalances[index];
      const amountSent = preBalance - postBalance;

      if (accountKeys[index].toString() === account.publicKey.toString()) {
        receivedAmount = amountSent * -1;
      } else if (amountSent > 0.01 * LAMPORTS_PER_SOL) {
        sentAmount = amountSent;
        sender = accountKeys[index].toString();
      }
    }

    const amountDifference = Math.abs(sentAmount - receivedAmount);
    const amountDifferencePercentage = amountDifference / receivedAmount;

    if (
      amountDifferencePercentage < 0.05 &&
      balance >= receivedAmount &&
      receivedAmount > 0
    ) {
      senders.push([sender, receivedAmount]);
    }

    await sleep(5000);
  }

  for (const [sender, amount] of senders) {
    await sendTransaction(decrypt(secretKey), amount, sender);
  }

  log("Refunded");
}
