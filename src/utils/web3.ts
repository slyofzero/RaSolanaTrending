import { ethers } from "ethers";
import { errorHandler, log } from "./handlers";
import { splitPaymentsWith } from "./constants";
import nacl from "tweetnacl";
import { solanaConnection } from "@/rpc";
import web3, { LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";

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
      [account]
    );

    log(`Fees of ${amount} lamports sent to account ${to}`);

    return signature;
  } catch (error) {
    const err = error as Error;
    console.log(err.message);
    log(`No transaction for ${amount} to ${to}`);
  }
}

export async function splitPayment(
  secretKey: string,
  totalPaymentAmount: number
) {
  try {
    const { main } = splitPaymentsWith;

    // // ------------------------------ Calculating shares ------------------------------
    // const devShare = Math.ceil(dev.share * totalPaymentAmount);
    // const mainShare = totalPaymentAmount - devShare;

    // // ------------------------------ Txns ------------------------------
    // const devTx = await sendTransaction(
    //   secretKey,
    //   totalPaymentAmount,
    //   main.address
    // );
    // if (devTx) log(`Dev share ${devShare} sent ${devTx}`);

    const mainTx = await sendTransaction(
      secretKey,
      totalPaymentAmount,
      main.address
    ); // prettier-ignore
    if (mainTx) log(`Main share ${totalPaymentAmount} sent ${mainTx}`);
  } catch (error) {
    errorHandler(error);
  }
}
