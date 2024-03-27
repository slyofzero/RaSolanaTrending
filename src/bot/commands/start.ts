import { BOT_USERNAME } from "@/utils/env";
import { CommandContext, Context } from "grammy";

export async function startBot(ctx: CommandContext<Context>) {
  const text = `Welcome to ${BOT_USERNAME}!

Go to https://t.me/TruTrendSolana to view the trending Solana tokens.

/referral_link - To get your referral Link
/advertise - To buy an ad slot on our bot
/trend - To trend your token`;

  ctx.reply(text, {
    // @ts-expect-error Type not found
    disable_web_page_preview: true,
  });
}
