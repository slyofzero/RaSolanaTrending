import { teleBot } from "@/index";
import { startBot } from "./start";
import { errorHandler, log } from "@/utils/handlers";
import { executeStep } from "../executeStep";

export function initiateBotCommands() {
  teleBot.api
    .setMyCommands([{ command: "start", description: "Start the bot" }])
    .catch((e) => errorHandler(e));

  teleBot.command("start", (ctx) => startBot(ctx));

  // @ts-expect-error Type not found
  teleBot.on(["message"], (ctx) => executeStep(ctx));

  log("Bot commands up");
}
