import { generateTextFooter, hardCleanUpBotMessage } from "@/utils/bot";
import { toTitleCase } from "@/utils/general";
import {
  previouslyTrendingTokens,
  toTrendTokens,
  trendingTokens,
} from "@/vars/trending";
import moment from "moment";
import { teleBot } from "..";
import { errorHandler, log } from "@/utils/handlers";
import { CHANNEL_ID } from "@/utils/env";
import { PairData, PairsData } from "@/types";
import { apiFetcher } from "@/utils/api";
import { DEXSCREEN_URL, TRENDING_MESSAGE } from "@/utils/constants";
import { sleep } from "@/utils/time";
import { setLastSentMessageId } from "@/vars/message";

moment.updateLocale("en", {
  relativeTime: {
    future: "in %s",
    past: "%s ago",
    s: "a few seconds",
    ss: "%d seconds",
    m: "1 M ago",
    mm: "%d M ago",
    h: "1 H ago",
    hh: "%d H ago",
    d: "1 day ago",
    dd: "%d days ago",
    M: "1 month ago",
    MM: "%d months ago",
    y: "1 year ago",
    yy: "%d years ago",
  },
});

export async function sendNewTrendingMsg(tokenData: PairData, index: number) {
  if (!CHANNEL_ID) {
    return log("Channel ID or PINNED_MSG_ID is undefined");
  }

  const { baseToken, pairAddress} = tokenData; // prettier-ignore
  const { name, address: token } = baseToken;
  const { keyboard } = generateTextFooter(token);

  const solScanLink = `https://solscan.io/token/${token}`;
  const dexSLink = `https://dexscreener.com/solana/${token}`;
  const photonLink = `https://photon-sol.tinyastro.io/en/lp/${pairAddress}`;
  const socials = [];
  // const toTrendChat = toTrendTokens.find(
  //   ({ token: storedToken }) => storedToken === token
  // )?.initiatedBy;

  for (const { label, url } of tokenData.info?.websites || []) {
    if (url) {
      socials.push(`[${toTitleCase(label)}](${url})`);
    }
  }

  for (const { type, url } of tokenData.info?.socials || []) {
    if (url) {
      socials.push(`[${toTitleCase(type)}](${url})`);
    }
  }

  const telegramLink = tokenData.info?.socials?.find(
    ({ type }) => type === "telegram"
  )?.url;

  const tokenSocials = toTrendTokens.find(
    ({ token: storedToken }) => storedToken === token
  )?.socials;

  const url = tokenSocials || telegramLink || photonLink;

  const message = `🪙 [${hardCleanUpBotMessage(
    name
  )}](${url}) Just Entered [Hype TRENDING](${TRENDING_MESSAGE})
  
Token: [${token}](${solScanLink})
Position: [\`${index + 1}\`](${TRENDING_MESSAGE})

📈 [Chart](${dexSLink}) \\| 🥇 [Trending](${TRENDING_MESSAGE})`;

  try {
    const sentMessage = await teleBot.api.sendMessage(CHANNEL_ID, message, {
      parse_mode: "MarkdownV2",
      // @ts-expect-error Type not found
      disable_web_page_preview: true,
      reply_markup: keyboard,
    });

    setLastSentMessageId(sentMessage.message_id);

    // if (toTrendChat) {
    //   await teleBot.api.sendMessage(toTrendChat, message, {
    //     parse_mode: "MarkdownV2",
    //     // @ts-expect-error Type not found
    //     disable_web_page_preview: true,
    //     reply_markup: keyboard,
    //   });
    // }
  } catch (e) {
    // eslint-disable-next-line
    console.log(message);
    errorHandler(e);
  }

  log(`Sending message for ${token}`);
}

export async function checkNewTrending() {
  // Checking for new trending tokens
  for (const [index, [token, tokenData]] of trendingTokens.entries()) {
    const wasPreviouslyTrending = previouslyTrendingTokens.includes(token);
    if (wasPreviouslyTrending) continue;

    await sendNewTrendingMsg(tokenData, index);
  }

  // Checking if any in the top 5 tokens have changed ranks
  for (const [index, [token, tokenData]] of trendingTokens
    .slice(0, 5)
    .entries()) {
    const pastRank = previouslyTrendingTokens.findIndex(
      (storedToken) => storedToken === token
    );
    if (index < pastRank) await sendNewTrendingMsg(tokenData, index);
  }

  await sleep(10000);
}

export async function sendToTrendTokensMsg() {
  for (const toTrendData of toTrendTokens) {
    const { token, slot } = toTrendData;
    const tokenData = await apiFetcher<PairsData>(`${DEXSCREEN_URL}/${token}`);
    const firstPair = tokenData?.data.pairs.at(0);

    if (firstPair) await sendNewTrendingMsg(firstPair, slot - 1);
  }
}
