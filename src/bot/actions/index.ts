import { teleBot } from "@/index";
import { log } from "@/utils/handlers";
import { executeStep } from "../executeStep";

export function initiateCallbackQueries() {
  log("Bot callback queries up");

  // @ts-expect-error Weird type at hand
  teleBot.on("callback_query:data", (ctx) => executeStep(ctx));
}
