import dotenv from "dotenv";
dotenv.config();

export const {
  BOT_TOKEN,
  BOT_USERNAME,
  FIREBASE_PREFIX,
  DEX_URL,
  FIREBASE_KEY,
  RPC_URL,
  ENCRYPTION_KEY,
  TOKEN_DATA_URL,
  CHANNEL_ID,
  NETWORK_NAME,
} = process.env;

export const BOT_URL = `https://t.me/${BOT_USERNAME}`;
export const PINNED_MSG_ID = Number(process.env.PINNED_MSG_ID);
