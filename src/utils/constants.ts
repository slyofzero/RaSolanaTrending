import { FIREBASE_PREFIX } from "./env";

export const firebaseCollectionPrefix = `_${FIREBASE_PREFIX}`;
export const wssHeaders = {
  Pragma: "no-cache",
  "Cache-Control": "no-cache",
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36 Edg/121.0.0.0",
  Upgrade: "websocket",
  Origin: "https://dexscreener.com",
  "Sec-WebSocket-Version": "13",
  "Accept-Encoding": "gzip, deflate, br",
  "Accept-Language": "en-US,en;q=0.9",
  "Sec-WebSocket-Key": "oEhi9FPY7B8xeU+7/6jGyw==",
  "Sec-WebSocket-Extensions": "permessage-deflate; client_max_window_bits",
};

export const trendPrices: { [key: number]: number[] } = {
  3: [300, 250, 200, 160, 140, 120, 100, 80, 60, 35],
  6: [600, 500, 400, 320, 280, 240, 200, 160, 120, 70],
  12: [1050, 875, 700, 560, 500, 420, 350, 280, 200, 120],
};

export const adSlotPrices: { [key: number]: number } = {
  1: 100,
  2: 50,
};

export const adDurationPrices: { [key: number]: number } = {
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
    address: "0x6033dc5971932A61faD6D33f12bFCe67844d72aB",
    share: 0.5,
  },
  me: {
    address: "0x6cA3Cc89d26d4E1f5b0Cd84B6721ef979Cb61be2",
    share: 0.5,
  },
};

export const urlRegex =
  /^(?:https?|ftp):\/\/(?:www\.)?[\w-]+\.[a-z]{2,}(?:\/[\w-]*)*\/?(?:\?[^#\s]*)?$/;
export const ethPriceApi =
  "https://api.binance.com/api/v3/ticker/price?symbol=ETHUSDT";
