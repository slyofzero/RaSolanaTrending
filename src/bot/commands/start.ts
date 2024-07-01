import { CommandContext, Context } from "grammy";
import { trend } from "./trend";
import { advertise } from "./advertise";
import { BOT_USERNAME } from "@/utils/env";
import { errorHandler } from "@/utils/handlers";

export async function startBot(ctx: CommandContext<Context>) {
  try {
    const text = `Welcome to ${BOT_USERNAME}\\!
    
To trend a token - /trend
To advertise - /advertise`;

    const { match } = ctx;

    switch (match) {
      case "trend": {
        trend(ctx);
        break;
      }
      case "adBuyRequest": {
        advertise(ctx);
        break;
      }
      default: {
        return await ctx.reply(text, {
          // @ts-expect-error Type not found
          disable_web_page_preview: true,
          parse_mode: "MarkdownV2",
        });
      }
    }
  } catch (error) {
    errorHandler(error);
  }
}
