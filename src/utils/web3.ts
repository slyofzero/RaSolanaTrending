import { ethers } from "ethers";
import { errorHandler, log } from "./handlers";
import { splitPaymentsWith } from "./constants";
import { provider, web3 } from "@/rpc";

export function isValidEthToken(address: string) {
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
  amount: number,
  to?: string
) {
  try {
    const wallet = new ethers.Wallet(secretKey, provider);
    const gasPrice = await web3.eth.getGasPrice();
    const gasLimit = (
      await provider.estimateGas({
        to: to,
        value: amount,
      })
    ).toNumber();
    const valueAfterGas = amount - gasLimit * Number(gasPrice);

    const tx = await wallet.sendTransaction({
      to: to,
      value: valueAfterGas,
      gasPrice: gasPrice,
      gasLimit: gasLimit,
    });

    return tx;
  } catch (error) {
    log(`No transaction for ${amount} to ${to}`);
    errorHandler(error);
  }
}

export async function splitPayment(
  secretKey: string,
  totalPaymentAmount: bigint
) {
  try {
    const { dev, me } = splitPaymentsWith;

    const myShare = me.share * Number(totalPaymentAmount);
    const devShare = Number(totalPaymentAmount) - myShare;

    await sendTransaction(secretKey, myShare, me.address);
    log(`Fees of ${myShare} wei sent to account ${me.address}`);

    await sendTransaction(secretKey, devShare, dev.address);
    log(`Fees of ${devShare} wei sent to account ${dev.address}`);

    log("Amount split between share holders");
  } catch (error) {
    errorHandler(error);
  }
}
