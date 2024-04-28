import { CommandContext, Context } from "grammy";
import { trend } from "./trend";
import { advertise } from "./advertise";
import { BOT_USERNAME } from "@/utils/env";

export async function startBot(ctx: CommandContext<Context>) {
  const text = `Welcome to ${BOT_USERNAME}\\!

/advertise \\- To buy an ad slot on our bot
/trend \\- To trend your token`;

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
      return ctx.reply(text, {
        // @ts-expect-error Type not found
        disable_web_page_preview: true,
        parse_mode: "MarkdownV2",
      });
    }
  }
}
