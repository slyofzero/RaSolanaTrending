import {
  cleanUpBotMessage,
  generateTextFooter,
  hardCleanUpBotMessage,
} from "@/utils/bot";
import { formatM2Number } from "@/utils/general";
import {
  previouslyTrendingTokens,
  toTrendTokens,
  trendingTokens,
} from "@/vars/trending";
import moment from "moment";
import { teleBot } from "..";
import { errorHandler, log } from "@/utils/handlers";
import { CHANNEL_ID, NETWORK_NAME } from "@/utils/env";
import { PairData, PairsData } from "@/types";
import { apiFetcher } from "@/utils/api";
import { DEXSCREEN_URL } from "@/utils/constants";

async function sendNewTrendingMsg(tokenData: PairData, index: number) {
  if (!CHANNEL_ID) {
    return log("Channel ID or PINNED_MSG_ID is undefined");
  }

  const { baseToken, priceUsd, priceChange, liquidity, volume, fdv, pairCreatedAt} = tokenData; // prettier-ignore
  const { name, symbol, address: token } = baseToken;
  const { keyboard, scanLinksText } = generateTextFooter(token);
  const age = moment(pairCreatedAt).fromNow();

  const solScanLink = `https://solscan.io/token/${token}`;
  const birdEyeLink = `https://birdeye.so/token/${token}?chain=solana`;
  const dexSLink = `https://dexscreener.com/solana/${token}`;

  const hardCleanedSymbol = hardCleanUpBotMessage(symbol);

  const message = `*${hardCleanedSymbol} trending at \\#${index + 1}*

📌 [${hardCleanUpBotMessage(name)} \\(${hardCleanedSymbol}\\)](${solScanLink})
🔸 Chain: ${NETWORK_NAME} \\| ⚖️ Age: ${age}

💲 Price: \\$${cleanUpBotMessage(parseFloat(priceUsd))}
💰 MC: \\$${`${formatM2Number(fdv)}`} \\| Liq: \\$${formatM2Number(
    liquidity.usd
  )}
🚀 24h: ${formatM2Number(priceChange.h24)}% \\| V: \\$${formatM2Number(
    volume.h24
  )}
📊 [Birdeye](${birdEyeLink}) \\| [DexS](${dexSLink})

🪙 Token \\- \`${token}\`

${scanLinksText}`;

  try {
    await teleBot.api.sendMessage(CHANNEL_ID, message, {
      parse_mode: "MarkdownV2",
      // @ts-expect-error Type not found
      disable_web_page_preview: true,
      reply_markup: keyboard,
    });
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
    if (wasPreviouslyTrending || index >= 10) continue;

    await sendNewTrendingMsg(tokenData, index);
  }

  // Checking if any in the top 5 tokens have changed ranks
  for (const [index, [token, tokenData]] of trendingTokens
    .slice(0, 5)
    .entries()) {
    const pastRank = previouslyTrendingTokens.findIndex(
      (storedToken) => storedToken === token
    );
    if (index > pastRank && index < 10)
      await sendNewTrendingMsg(tokenData, index);
  }
}

export async function sendToTrendTokensMsg() {
  for (const toTrendData of toTrendTokens) {
    const { token, slot } = toTrendData;
    const tokenData = await apiFetcher<PairsData>(`${DEXSCREEN_URL}/${token}`);
    const firstPair = tokenData.data.pairs.at(0);

    if (firstPair) await sendNewTrendingMsg(firstPair, slot - 1);
  }
}
