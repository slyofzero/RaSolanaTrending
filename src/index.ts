import { Bot } from "grammy";
import { initiateBotCommands, initiateCallbackQueries } from "./bot";
import { log } from "./utils/handlers";
import { BOT_TOKEN, DEX_URL, PORT } from "./utils/env";
import { processTrendingPairs } from "./bot/processTrendingPairs";
import { sleep } from "./utils/time";
import { syncToTrend, toTrendTokens, trendingTokens } from "./vars/trending";
import { updateTrendingMessage } from "./bot/updateTrendingMessage";
import { advertisements, syncAdvertisements } from "./vars/advertisements";
import { cleanUpExpired } from "./bot/cleanUp";
import { rpcConfig } from "./rpc";
import express, { Request, Response } from "express";
import { syncAdmins } from "./vars/admins";
import { unlockUnusedAccounts } from "./bot/cleanUp/accounts";
import { checkNewTrending } from "./bot/checkNewTrending";
import { trendingMessageId } from "./vars/message";

export const teleBot = new Bot(BOT_TOKEN || "");
log("Bot instance ready");

if (!DEX_URL) {
  log("DEX_URL is undefined");
  process.exit(1);
}

const app = express();
log("Express server ready");

(async function () {
  rpcConfig();
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

  // const ws = new WebSocket(DEX_URL, { headers: wssHeaders });

  // function connectWebSocket() {
  //   ws.on("open", function open() {
  //     log("Connected");
  //   });

  //   ws.on("close", function close() {
  //     log("Disconnected");
  //     process.exit(1);
  //   });

  //   ws.on("error", function error() {
  //     log("Error");
  //     process.exit(1);
  //   });

  //   ws.on("message", async (event) => {
  //     const str = event.toString();
  //     const data = JSON.parse(str);
  //     const { pairs } = data as { pairs: WSSPairData[] | undefined };
  //     const lastFetched = getSecondsElapsed(fetchedAt);

  //     if (pairs && lastFetched >= 50) {
  //       fetchedAt = getNowTimestamp();
  //       await processTrendingPairs();

  //       await checkNewTrending();
  //       await updateTrendingMessage();

  //       cleanUpExpired();
  //     }
  //   });
  // }

  setInterval(unlockUnusedAccounts, 5 * 60 * 1e3);
  // connectWebSocket();

  app.use(express.json());

  app.get("/ping", (req: Request, res: Response) => {
    return res.json({ message: "Server is up" });
  });

  app.get("/trending", (req: Request, res: Response) => {
    const trendingTokensAndPairs: { [key: string]: string } = {};
    for (const [token, tokenData] of trendingTokens) {
      const pair = tokenData.pairAddress;
      trendingTokensAndPairs[token] = pair;
    }

    return res.status(200).json({ trendingTokens: trendingTokensAndPairs });
  });

  app.get("/getLastMessage", (req: Request, res: Response) => {
    return res.status(200).json({ messageId: trendingMessageId });
  });

  app.post("/syncTrending", async (req: Request, res: Response) => {
    await syncToTrend();
    return res.status(200).json({ toTrendTokens });
  });

  app.post("/syncAdvertisements", async (req: Request, res: Response) => {
    await syncAdvertisements();
    return res.status(200).json({ advertisements });
  });

  app.listen(PORT, () => {
    log(`Server is running on port ${PORT}`);
  });

  async function toRepeat() {
    log("To repeat");
    await updateTrendingMessage();
    await processTrendingPairs();
    await checkNewTrending();

    cleanUpExpired();

    await sleep(60 * 1e3);
    toRepeat();
  }
  await toRepeat();
})();
