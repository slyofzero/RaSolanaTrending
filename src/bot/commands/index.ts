import { teleBot } from "@/index";
import { startBot } from "./start";
import { log } from "@/utils/handlers";
import { trend } from "./trend";
import { executeStep } from "../executeStep";

export function initiateBotCommands() {
  teleBot.api.setMyCommands([
    { command: "start", description: "Start the bot" },
    { command: "trend", description: "To purchase a trending spot" },
    { command: "advertise", description: "To purchase an advertisement spot" },
  ]);

  teleBot.command("start", (ctx) => startBot(ctx));
  teleBot.command("trend", (ctx) => trend(ctx));

  // @ts-expect-error Type not found
  teleBot.on(["message"], (ctx) => executeStep(ctx));

  log("Bot commands up");
}
