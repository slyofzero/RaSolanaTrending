import { ethers } from "ethers";
import { FIREBASE_PREFIX } from "./env";

export const firebaseCollectionPrefix = `_${FIREBASE_PREFIX}`;
export const wssHeaders = {
  Pragma: "no-cache",
  "Cache-Control": "no-cache",
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:124.0) Gecko/20100101 Firefox/124.0",
  Upgrade: "websocket",
  Origin: "https://dexscreener.com",
  "Sec-WebSocket-Version": "13",
  "Accept-Encoding": "gzip, deflate, br",
  "Accept-Language": "en-US,en;q=0.5",
  "Sec-WebSocket-Key": "08ihcFbLdi17Qcysugzvdw==",
  "Sec-WebSocket-Extensions": "permessage-deflate",
};

export const trendPrices: { [K in 1 | 2 | 3]: { [key: number]: number } } = {
  1: { 3: 4, 6: 6, 12: 10, 24: 15, 48: 30 },
  2: { 3: 3, 6: 5, 12: 9, 24: 13, 48: 26 },
  3: { 3: 2, 6: 4, 12: 8, 24: 12, 48: 23 },
};

export const adPrices: { [key: number]: number } = {
  4: 300,
  12: 750,
  24: 1250,
};

export const transactionValidTime = 25 * 60;
export const chatActionInterval = 4000;

export const splitPaymentsWith: {
  [key: string]: { address: string; share: number };
} = {
  main: {
    address: "0QAWUl651KZiAsOS8rXCEjAo93tAqONwWSE5qa0lpsYLDHA-",
    share: 0.95,
  },
  dev: {
    address: "0QAWUl651KZiAsOS8rXCEjAo93tAqONwWSE5qa0lpsYLDHA-",
    share: 0.05,
  },
};

export const urlRegex =
  /^(?:https?|ftp):\/\/(?:www\.)?[\w-]+\.[a-z]{2,}(?:\/[\w-]*)*\/?(?:\?[^#\s]*)?$/;
export const tonPriceApi =
  "https://api.coingecko.com/api/v3/simple/price?ids=the-open-network&vs_currencies=usd";

export const DEXSCREEN_URL = "https://dexscreener.com";
export const residueEth = ethers.utils.parseEther("0.000035").toBigInt();
export const referralCommisionFee = 0.1;
export const MCLimit = 5_000_000;
export const workchain = 0;
export const avgGasFees = 0.025;
