import { ethers } from "ethers";
import { errorHandler, log } from "./handlers";
import {
  referralCommisionFee,
  residueEth,
  splitPaymentsWith,
} from "./constants";
import { provider, web3 } from "@/rpc";
import { sleep } from "./time";
import { getDocument } from "@/firebase";
import { StoredReferral } from "@/types";
import { floatToBigInt } from "./general";

export function isValidEthAddress(address: string) {
  const regex = /^0x[a-fA-F0-9]{40}$/;
  return regex.test(address);
}

export function generateAccount() {
  const wallet = ethers.Wallet.createRandom();

  const data = {
    publicKey: wallet.address,
    secretKey: wallet.privateKey,
  };
  return data;
}

export async function sendTransaction(
  secretKey: string,
  amount: bigint,
  to: string,
  full?: boolean
) {
  for (const attempt of Array.from(Array(10).keys())) {
    try {
      const wallet = new ethers.Wallet(secretKey, provider);
      const gasPrice = await web3.eth.getGasPrice();
      const gasLimit = (
        await provider.estimateGas({
          to: to,
          value: amount,
        })
      ).toBigInt();

      if (full) amount = amount - residueEth;
      if (amount <= 0) return false;

      const valueAfterGas = amount - gasLimit * gasPrice;
      const tx = await wallet.sendTransaction({
        to: to,
        value: valueAfterGas,
        gasPrice: gasPrice,
        gasLimit: gasLimit,
      });

      return tx;
    } catch (error) {
      log(`No transaction for ${amount} to ${to}, at attempt - ${attempt + 1}`);
      await sleep(10000);
    }
  }

  log(`Transaction of ${amount} wasn't successful`);
}

export async function splitPayment(
  secretKey: string,
  totalPaymentAmount: bigint,
  referrer?: number
) {
  try {
    let referralAddress = "";
    if (referrer) {
      const [referralData] = await getDocument<StoredReferral>({
        collectionName: "referral",
        queries: [["referrer", "==", referrer]],
      });

      if (referralData.address) referralAddress = referralData.address;
    }

    const { dev, main, revenue } = splitPaymentsWith;

    // ------------------------------ Calculating shares ------------------------------
    const devShare = floatToBigInt(dev.share * Number(totalPaymentAmount));
    const shareLeft = totalPaymentAmount - devShare;

    const referralShare = referralAddress
      ? floatToBigInt(Number(shareLeft) * referralCommisionFee)
      : BigInt(0);
    const revenueShare = floatToBigInt(Number(shareLeft) * revenue.share);
    const mainShare = shareLeft - (referralShare + revenueShare);

    // ------------------------------ Txns ------------------------------
    const devTx = await sendTransaction(secretKey, devShare, dev.address);
    if (devTx) log(`Dev share ${devShare} sent ${devTx.hash}`);

    if (referralAddress) {
      const refTx = await sendTransaction(
        secretKey,
        referralShare,
        referralAddress
      );
      if (refTx) log(`Referral Share ${referralShare} sent ${refTx.hash}`);
    }

    const revTx = await sendTransaction(secretKey, revenueShare, revenue.address); // prettier-ignore
    if (revTx) log(`Revenue share ${revenueShare} sent ${revTx.hash}`);

    const mainTx = await sendTransaction(secretKey, mainShare, main.address, true); // prettier-ignore
    if (mainTx) log(`Main share ${mainShare} sent ${mainTx.hash}`);
  } catch (error) {
    errorHandler(error);
  }
}
