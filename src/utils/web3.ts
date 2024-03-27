import { ethers } from "ethers";
import { errorHandler, log } from "./handlers";
import { gasLimit, splitPaymentsWith } from "./constants";
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
  for (const revShare in splitPaymentsWith) {
    const { address, share } = splitPaymentsWith[revShare];
    const amountToShare = Number(totalPaymentAmount) * share;

    sendTransaction(secretKey, amountToShare, address).then((tx) =>
      log(`Fees of ${amountToShare} lamports sent, ${tx?.hash}`)
    );
  }
}
