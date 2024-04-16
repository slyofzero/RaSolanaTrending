import { ethers } from "ethers";
import { errorHandler, log } from "./handlers";
import { referralCommisionFee, splitPaymentsWith } from "./constants";
import { getDocument, updateDocumentById } from "@/firebase";
import { StoredReferral } from "@/types";
import nacl from "tweetnacl";
import { solanaConnection } from "@/rpc";
import web3, { PublicKey } from "@solana/web3.js";

export function isValidSolAddress(address: string) {
  try {
    new PublicKey(address);
    return true;
  } catch (error) {
    return false;
  }
}

export function generateAccount() {
  const randomBytes = ethers.utils.randomBytes(32);
  const mnemonic = ethers.utils.entropyToMnemonic(randomBytes);
  const seed = ethers.utils.mnemonicToSeed(mnemonic);
  const hex = Uint8Array.from(Buffer.from(seed));
  const keyPair = nacl.sign.keyPair.fromSeed(hex.slice(0, 32));
  const { publicKey, secretKey } = new web3.Keypair(keyPair);
  const data = {
    publicKey: publicKey.toString(),
    secretKey: `[${secretKey.toString()}]`,
  };
  return data;
}

export async function sendTransaction(
  secretKey: string,
  amount: number,
  to?: string
) {
  let attempts = 0;

  try {
    if (!to) {
      return false;
    }

    attempts += 1;

    const { lamportsPerSignature } = (
      await solanaConnection.getRecentBlockhash("confirmed")
    ).feeCalculator;

    const secretKeyArray = new Uint8Array(JSON.parse(secretKey));
    const account = web3.Keypair.fromSecretKey(secretKeyArray);
    const toPubkey = new PublicKey(to);

    const transaction = new web3.Transaction().add(
      web3.SystemProgram.transfer({
        fromPubkey: account.publicKey,
        toPubkey,
        lamports: amount - lamportsPerSignature,
      })
    );

    const signature = await web3.sendAndConfirmTransaction(
      solanaConnection,
      transaction,
      [account]
    );
    return signature;
  } catch (error) {
    log(`No transaction for ${amount} to ${to}`);
    errorHandler(error);

    if (attempts < 1) {
      sendTransaction(secretKey, amount, to);
    }
  }
}

export async function splitPayment(
  secretKey: string,
  totalPaymentAmount: number,
  referrer?: number
) {
  try {
    const { dev, main, revenue } = splitPaymentsWith;

    // ------------------------------ Calculating shares ------------------------------
    const devShare = Math.ceil(dev.share * totalPaymentAmount);
    const shareLeft = totalPaymentAmount - devShare;

    let referralAddress = "";
    let referralShare = 0;

    if (referrer) {
      const [referralData] = await getDocument<StoredReferral>({
        collectionName: "referral",
        queries: [["referrer", "==", referrer]],
      });

      if (referralData.walletAddress) {
        referralAddress = referralData.walletAddress;
        referralShare = Math.floor(shareLeft * referralCommisionFee);

        const newFeesCollected =
          (referralData.feesCollected || 0) + referralShare;

        updateDocumentById<StoredReferral>({
          id: referralData.id || "",
          collectionName: "referral",
          updates: { feesCollected: newFeesCollected },
        });
      }
    }

    const revenueShare = Math.floor(shareLeft * revenue.share);
    const mainShare = shareLeft - (referralShare + revenueShare);

    // ------------------------------ Txns ------------------------------
    const devTx = await sendTransaction(secretKey, devShare, dev.address);
    if (devTx) log(`Dev share ${devShare} sent ${devTx}`);

    if (referralAddress) {
      const refTx = await sendTransaction(
        secretKey,
        referralShare,
        referralAddress
      );
      if (refTx) log(`Referral Share ${referralShare} sent ${refTx}`);
    }

    const revTx = await sendTransaction(secretKey, revenueShare, revenue.address); // prettier-ignore
    if (revTx) log(`Revenue share ${revenueShare} sent ${revTx}`);

    const mainTx = await sendTransaction(secretKey, mainShare, main.address); // prettier-ignore
    if (mainTx) log(`Main share ${mainShare} sent ${mainTx}`);
  } catch (error) {
    errorHandler(error);
  }
}
