import { ethers } from "ethers";
import { errorHandler, log } from "./handlers";
import { residueEth, splitPaymentsWith } from "./constants";
import { provider, web3 } from "@/rpc";
import { sleep } from "./time";

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
  totalPaymentAmount: bigint
) {
  try {
    const { dev, me } = splitPaymentsWith;

    const myShare = BigInt(Math.floor(me.share * Number(totalPaymentAmount)));
    const devShare = totalPaymentAmount - myShare;

    sendTransaction(secretKey, myShare, me.address).then(() =>
      log(`Fees of ${myShare} wei sent to account ${me.address}`)
    );

    sendTransaction(secretKey, devShare, dev.address, true).then(() =>
      log(`Fees of ${devShare} wei sent to account ${dev.address}`)
    );
  } catch (error) {
    errorHandler(error);
  }
}
