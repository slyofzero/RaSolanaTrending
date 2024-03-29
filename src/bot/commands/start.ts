import { BOT_USERNAME } from "@/utils/env";
import { CommandContext, Context } from "grammy";
import { trend } from "./trend";
import { advertise } from "./advertise";

export async function startBot(ctx: CommandContext<Context>) {
  const text = `Welcome to ${BOT_USERNAME}!

Go to https://t.me/TruTrendSolana to view the trending Solana tokens.

/referral_link - To get your referral Link
/advertise - To buy an ad slot on our bot
/trend - To trend your token`;

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
      ctx.reply(text, {
        // @ts-expect-error Type not found
        disable_web_page_preview: true,
      });
    }
  }
}
