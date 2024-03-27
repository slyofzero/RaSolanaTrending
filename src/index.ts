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

export const teleBot = new Bot(BOT_TOKEN || "");
log("Bot instance ready");
let fetchedAt: number = 0;

if (!DEX_URL) {
  log("DEX_URL is undefined");
  process.exit(1);
}

(async function () {
  teleBot.start();
  await Promise.all([syncToTrend()]);
  log("Telegram bot setup");
  initiateBotCommands();
  initiateCallbackQueries();

  const ws = new WebSocket(DEX_URL, { headers: wssHeaders });

  ws.on("open", function open() {
    log("connected");
  });

  ws.on("close", function close() {
    log("disconnected");
    process.exit(1);
  });

  ws.on("message", async (event) => {
    const str = event.toString();
    const data = JSON.parse(str);
    const { pairs } = data as { pairs: PairData[] | undefined };
    const lastFetched = getSecondsElapsed(fetchedAt);

    if (pairs && lastFetched > 5) {
      processTrendingPairs(pairs);
      fetchedAt = getNowTimestamp();
    }
  });
})();
