import { CommandContext, Context } from "grammy";
import { trend } from "./trend";
import { advertise } from "./advertise";
import { getDocument } from "@/firebase";
import { StoredReferral } from "@/types";
import { referralLink } from "./referralLink";

export async function startBot(ctx: CommandContext<Context>) {
  const text = `Welcome to TruTrend\\!

Use following links to view TruTrend services
[*Solana Trending*](https://t.me/TruTrendSolana)
[*Base Chain Trending*](https://t.me/TruTrendBase)

/referral\\_link \\- To get your referral Link
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
      let referrer: number | undefined = undefined;
      if (match) {
        let queryField: keyof StoredReferral = "userId";
        let toSearch: string | number = match;
        if (isNaN(Number(match))) queryField = "referralText";
        else toSearch = Number(match);

        const [referrerData] = await getDocument<StoredReferral>({
          collectionName: "referral",
          queries: [[queryField, "==", toSearch]],
        });

        referrer = referrerData.userId;
      }

      referralLink(ctx, referrer);

      return ctx.reply(text, {
        // @ts-expect-error Type not found
        disable_web_page_preview: true,
        parse_mode: "MarkdownV2",
      });
    }
  }
}
