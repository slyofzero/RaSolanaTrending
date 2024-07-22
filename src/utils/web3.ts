import { ethers } from "ethers";
import { errorHandler, log } from "./handlers";
import { splitPaymentsWith } from "./constants";
import nacl from "tweetnacl";
import { solanaConnection } from "@/rpc";
import web3, { LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import { sleep } from "./time";

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
  to: string
) {
  try {
    const secretKeyArray = new Uint8Array(JSON.parse(secretKey));
    const account = web3.Keypair.fromSecretKey(secretKeyArray);
    const toPubkey = new PublicKey(to);

    const { lamportsPerSignature } = (
      await solanaConnection.getRecentBlockhash("confirmed")
    ).feeCalculator;

    log(`Sending ${to} ${parseFloat(String(amount / LAMPORTS_PER_SOL))}`);

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
      [account],
      { maxRetries: 20 }
    );

    log(`Fees of ${amount} lamports sent to account ${to}`);

    return signature;
  } catch (error) {
    const err = error as Error;
    log(err.message);
    log(`No transaction for ${amount} to ${to}`);
  }
}

export async function splitPayment(secretKey: string) {
  await sleep(60 * 1e3);
  try {
    const secretKeyArray = new Uint8Array(JSON.parse(secretKey));
    const account = web3.Keypair.fromSecretKey(secretKeyArray);
    const balance = await solanaConnection.getBalance(account.publicKey);
    const { main } = splitPaymentsWith;
    const mainTx = await sendTransaction(secretKey, balance, main.address);

    if (mainTx) log(`Main share ${balance} sent ${mainTx}`);
  } catch (error) {
    errorHandler(error);
  }
}
