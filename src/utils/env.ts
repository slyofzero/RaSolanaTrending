import dotenv from "dotenv";

export const { NODE_ENV } = process.env;
dotenv.config({
  path: NODE_ENV === "development" ? ".env" : ".env.production",
});

export const {
  BOT_TOKEN,
  BOT_USERNAME,
  TRENDING_BUY_BOT_API,
  AD_PRICES,
  API_AUTH_KEY,
  CHANNEL_ID,
  DEX_URL,
  ENCRYPTION_KEY,
  FIREBASE_PREFIX,
  NETWORK_NAME,
  PORT,
  RPC_ENDPOINT,
  TOKEN_DATA_URL,
  TRENDING_PRICES,
  TRENDING_CHANNEL_LINK,
  FIREBASE_KEY,
} = process.env;

export const BOT_URL = `https://t.me/${BOT_USERNAME}`;
