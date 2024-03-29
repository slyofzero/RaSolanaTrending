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
  "Sec-WebSocket-Key": "M5uJvoUZgvRAXcms5eBsnw==",
  "Sec-WebSocket-Extensions": "permessage-deflate",
};

export const trendPrices: { [key: number]: number[] } = {
  3: [300, 250, 200, 160, 140, 120, 100, 80, 60, 35],
  6: [600, 500, 400, 320, 280, 240, 200, 160, 120, 70],
  12: [1050, 875, 700, 560, 500, 420, 350, 280, 200, 120],
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
  dev: {
    address: "0x6cA3Cc89d26d4E1f5b0Cd84B6721ef979Cb61be2",
    share: 0.35,
  },
  main: {
    address: "0x6cA3Cc89d26d4E1f5b0Cd84B6721ef979Cb61be2",
    share: 0.55,
  },
  revenue: {
    address: "0x6cA3Cc89d26d4E1f5b0Cd84B6721ef979Cb61be2",
    share: 0.1,
  },
};

export const urlRegex =
  /^(?:https?|ftp):\/\/(?:www\.)?[\w-]+\.[a-z]{2,}(?:\/[\w-]*)*\/?(?:\?[^#\s]*)?$/;
export const ethPriceApi =
  "https://api.binance.com/api/v3/ticker/price?symbol=ETHUSDT";

export const DEXSCREEN_URL = "https://dexscreener.com";
export const residueEth = ethers.utils.parseEther("0.000035").toBigInt();
export const referralCommisionFee = 0.1;
