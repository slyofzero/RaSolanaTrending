import { Bot } from "grammy";
import { initiateBotCommands, initiateCallbackQueries } from "./bot";
import { log } from "./utils/handlers";
import { BOT_TOKEN, DEX_URL } from "./utils/env";
import { WebSocket } from "ws";
import { wssHeaders } from "./utils/constants";
import { WSSPairData } from "./types";
import { processTrendingPairs } from "./bot/processTrendingPairs";
import { getNowTimestamp, getSecondsElapsed } from "./utils/time";
import { syncToTrend } from "./vars/trending";
import { updateTrendingMessage } from "./bot/updateTrendingMessage";
import { trackTokenMC } from "./bot/trackTokenMC";
import { checkNewTrending } from "./bot/checkNewTrending";
import { syncAdvertisements } from "./vars/advertisements";
import { cleanUpExpired } from "./bot/cleanUp";

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

  await Promise.all([syncToTrend(), syncAdvertisements()]);
  const ws = new WebSocket(DEX_URL, { headers: wssHeaders });

  function connectWebSocket() {
    ws.on("open", function open() {
      log("Connected");
    });

    ws.on("close", function close() {
      log("Disconnected");
      setTimeout(connectWebSocket, 1000); // Reconnect after 1 second
    });

    ws.on("error", function error() {
      log("Error");
      setTimeout(connectWebSocket, 1000); // Reconnect after 1 second
    });

    ws.on("message", async (event) => {
      const str = event.toString();
      const data = JSON.parse(str);
      const { pairs } = data as { pairs: WSSPairData[] | undefined };
      const lastFetched = getSecondsElapsed(fetchedAt);

      if (pairs && lastFetched > 60) {
        fetchedAt = getNowTimestamp();
        await processTrendingPairs(pairs);

        updateTrendingMessage();
        // trackTokenMC();
        // checkNewTrending();

        cleanUpExpired();
      }
    });
  }

  connectWebSocket();
})();
