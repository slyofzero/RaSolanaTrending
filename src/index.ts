import { Address } from "@ton/ton";
import { Bot } from "grammy";
import { initiateBotCommands, initiateCallbackQueries } from "./bot";
import { log } from "./utils/handlers";
import {
  API_AUTH_KEY,
  BOT_TOKEN,
  CHANNEL_ID,
  DEX_URL,
  PORT,
} from "./utils/env";
import { WebSocket } from "ws";
import { wssHeaders } from "./utils/constants";
import { WSSPairData } from "./types";
import { processTrendingPairs } from "./bot/processTrendingPairs";
import { getNowTimestamp, getSecondsElapsed } from "./utils/time";
import { syncToTrend, trendingTokens } from "./vars/trending";
import { updateTrendingMessage } from "./bot/updateTrendingMessage";
import { syncAdvertisements } from "./vars/advertisements";
import { cleanUpExpired } from "./bot/cleanUp";
import { rpcConfig } from "./rpc";
import express, { Request, Response } from "express";
import { syncAdmins } from "./vars/admins";
import { unlockUnusedAccounts } from "./bot/cleanUp/accounts";
import { hardCleanUpBotMessage } from "./utils/bot";

export const teleBot = new Bot(BOT_TOKEN || "");
log("Bot instance ready");
let fetchedAt: number = 0;

if (!DEX_URL) {
  log("DEX_URL is undefined");
  process.exit(1);
}

const app = express();
log("Express server ready");

(async function () {
  await rpcConfig();
  teleBot.start();
  log("Telegram bot setup");
  initiateBotCommands();
  initiateCallbackQueries();

  await Promise.all([
    syncToTrend(),
    syncAdvertisements(),
    syncAdmins(),
    unlockUnusedAccounts(),
  ]);

  const ws = new WebSocket(DEX_URL, { headers: wssHeaders });

  function connectWebSocket() {
    ws.on("open", function open() {
      log("Connected");
    });

    ws.on("close", function close() {
      log("Disconnected");
      process.exit(1);
    });

    ws.on("error", function error() {
      log("Error");
      process.exit(1);
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
        cleanUpExpired();
      }
    });
  }

  setInterval(unlockUnusedAccounts, 60 * 60 * 1e3);
  connectWebSocket();

  app.use(express.json());

  app.get("/ping", (req: Request, res: Response) => {
    return res.json({ message: "Server is up" });
  });

  app.get("/trending", (req: Request, res: Response) => {
    // if (req.headers.authorization !== API_AUTH_KEY) {
    //   res.status(401).json({ message: "Unauthorized" });
    //   return;
    // }

    // eslint-disable-next-line
    const trendingTokensList = trendingTokens
      .map(([token]) => Address.parse(token).toRawString())
      .slice(0, 20);

    return res.status(200).json({ trendingTokens: trendingTokensList });
  });

  app.listen(PORT, () => {
    log(`Server is running on port ${PORT}`);
  });
})();
