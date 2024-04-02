import { teleBot } from "@/index";
import { startBot } from "./start";
import { errorHandler, log } from "@/utils/handlers";
import { trend } from "./trend";
import { executeStep } from "../executeStep";
import { advertise } from "./advertise";
import { referralLink } from "./referralLink";

export function initiateBotCommands() {
  teleBot.api
    .setMyCommands([
      { command: "start", description: "Start the bot" },
      { command: "trend", description: "To purchase a trending spot" },
      {
        command: "advertise",
        description: "To purchase an advertisement spot",
      },
      {
        command: "referral_link",
        description: "To get or edit your referral link",
      },
    ])
    .catch((e) => errorHandler(e));

  teleBot.command("start", (ctx) => startBot(ctx));
  teleBot.command("trend", (ctx) => trend(ctx));
  teleBot.command("advertise", (ctx) => advertise(ctx));
  teleBot.command("referral_link", (ctx) => referralLink(ctx));

  // @ts-expect-error Type not found
  teleBot.on(["message"], (ctx) => executeStep(ctx));

  log("Bot commands up");
}
