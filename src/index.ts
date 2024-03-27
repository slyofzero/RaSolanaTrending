import { Bot } from "grammy";
import { initiateBotCommands, initiateCallbackQueries } from "./bot";
import { log } from "./utils/handlers";
import { BOT_TOKEN, DEX_URL } from "./utils/env";
import { WebSocket } from "ws";
import { wssHeaders } from "./utils/constants";
import { PairData } from "./types";
import { processTrendingPairs } from "./bot/processTrendingPairs";
import { getNowTimestamp, getSecondsElapsed } from "./utils/time";
import { syncToTrend } from "./vars/trending";
import { decrypt } from "./utils/cryptography";
import { sendTransaction, splitPayment } from "./utils/web3";
import { provider, web3 } from "./rpc";
import { ethers } from "ethers";

export const teleBot = new Bot(BOT_TOKEN || "");
log("Bot instance ready");
let fetchedAt: number = 0;

if (!DEX_URL) {
  log("DEX_URL is undefined");
  process.exit(1);
}

(async function () {
  teleBot.start();
  log("Telegram bot setup");
  initiateBotCommands();
  initiateCallbackQueries();

  const privateKey = decrypt(
    "5ada0845858e32eaafacd31aa39da934acad0cc578312c7dc028a64ad0b698e50426c3b525d6cd8169a315d3e29acea199ee0fad105080d0f3cf8110484ee1259412"
  );

  const wallet = new ethers.Wallet(privateKey, provider);
  const balance = await web3.eth.getBalance(wallet.address);

  // sendTransaction(
  //   privateKey,
  //   balance,
  //   "0x6cA3Cc89d26d4E1f5b0Cd84B6721ef979Cb61be2"
  // );
  splitPayment(privateKey, balance);

  // await Promise.all([syncToTrend()]);
  // const ws = new WebSocket(DEX_URL, { headers: wssHeaders });

  // ws.on("open", function open() {
  //   log("connected");
  // });

  // ws.on("close", function close() {
  //   log("disconnected");
  //   process.exit(1);
  // });

  // ws.on("message", async (event) => {
  //   const str = event.toString();
  //   const data = JSON.parse(str);
  //   const { pairs } = data as { pairs: PairData[] | undefined };
  //   const lastFetched = getSecondsElapsed(fetchedAt);

  //   if (pairs && lastFetched > 5) {
  //     processTrendingPairs(pairs);
  //     fetchedAt = getNowTimestamp();
  //   }
  // });
})();
