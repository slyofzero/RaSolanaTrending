import { errorHandler, log } from "./handlers";
import { avgGasFees, splitPaymentsWith, workchain } from "./constants";
import { mnemonicNew, mnemonicToPrivateKey } from "ton-crypto";
import { tonClient } from "@/rpc";
import { Address, WalletContractV4, internal, toNano } from "@ton/ton";

export function isValidTonAddress(address: string) {
  try {
    Address.parse(address).toRawString();
    return true;
  } catch (error) {
    return false;
  }
}

export async function generateAccount() {
  const mnemonic = await mnemonicNew();
  const keypair = await mnemonicToPrivateKey(mnemonic);
  const wallet = WalletContractV4.create({
    workchain,
    publicKey: keypair.publicKey,
  });

  const data = {
    publicKey: wallet.address.toString(),
    secretKey: mnemonic,
  };
  return data;
}

// export async function sendTransaction(
//   secretKey: string,
//   amount: number,
//   to?: string
// ) {
//   let attempts = 0;

//   try {
//     if (!to) {
//       return false;
//     }

//     attempts += 1;

//     const { lamportsPerSignature } = (
//       await solanaConnection.getRecentBlockhash("confirmed")
//     ).feeCalculator;

//     const secretKeyArray = new Uint8Array(JSON.parse(secretKey));
//     const account = web3.Keypair.fromSecretKey(secretKeyArray);
//     const toPubkey = new PublicKey(to);

//     const transaction = new web3.Transaction().add(
//       web3.SystemProgram.transfer({
//         fromPubkey: account.publicKey,
//         toPubkey,
//         lamports: amount - lamportsPerSignature,
//       })
//     );

//     const signature = await web3.sendAndConfirmTransaction(
//       solanaConnection,
//       transaction,
//       [account]
//     );
//     return signature;
//   } catch (error) {
//     log(`No transaction for ${amount} to ${to}`);
//     errorHandler(error);

//     if (attempts < 1) {
//       sendTransaction(secretKey, amount, to);
//     }
//   }
// }

export async function sendTransaction(
  secretKey: string[],
  amount: number,
  to: string,
  message?: string
) {
  try {
    const keypair = await mnemonicToPrivateKey(secretKey);
    const wallet = WalletContractV4.create({
      workchain: 0,
      publicKey: keypair.publicKey,
    });
    const contract = tonClient.open(wallet);
    const seqno = await contract.getSeqno();
    const amountAfterFees = amount - avgGasFees;
    const toAddress = Address.parse(to).toString({ urlSafe: true });

    await contract.sendTransfer({
      seqno,
      secretKey: keypair.secretKey,
      messages: [
        internal({
          to,
          value: toNano(amountAfterFees.toFixed(2)),
          body: message,
          bounce: false,
        }),
      ],
    });

    log(`Sent ${amountAfterFees} to ${toAddress}, ${message}`);
    return true;
  } catch (error) {
    errorHandler(error);
  }
}

export async function splitPayment(
  secretKey: string[],
  totalPaymentAmount: number
) {
  try {
    const { dev, main } = splitPaymentsWith;

    // ------------------------------ Calculating shares ------------------------------
    const devShare = Math.ceil(dev.share * totalPaymentAmount);
    const mainShare = totalPaymentAmount - devShare;

    // ------------------------------ Txns ------------------------------
    const devTx = await sendTransaction(secretKey, devShare, dev.address);
    if (devTx) log(`Dev share ${devShare} sent ${devTx}`);

    // const revTx = await sendTransaction(secretKey, revenueShare, revenue.address); // prettier-ignore
    // if (revTx) log(`Revenue share ${revenueShare} sent ${revTx}`);

    const mainTx = await sendTransaction(secretKey, mainShare, main.address); // prettier-ignore
    if (mainTx) log(`Main share ${mainShare} sent ${mainTx}`);
  } catch (error) {
    errorHandler(error);
  }
}
