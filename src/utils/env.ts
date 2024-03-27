import dotenv from "dotenv";
dotenv.config();

export const {
  BOT_TOKEN,
  BOT_USERNAME,
  FIREBASE_PREFIX,
  DEX_URL,
  FIREBASE_KEY,
} = process.env;
