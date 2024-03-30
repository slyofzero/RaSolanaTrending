import {
  cleanUpBotMessage,
  generateTextFooter,
  hardCleanUpBotMessage,
} from "@/utils/bot";
import { formatM2Number } from "@/utils/general";
import { previouslyTrendingTokens, trendingTokens } from "@/vars/trending";
import moment from "moment";
import { teleBot } from "..";
import { errorHandler, log } from "@/utils/handlers";
import { CHANNEL_ID } from "@/utils/env";

export async function checkNewTrending() {
  if (!CHANNEL_ID) {
    return log("Channel ID or PINNED_MSG_ID is undefined");
  }

  for (const [index, [token, tokenData]] of trendingTokens.entries()) {
    const wasPreviouslyTrending = previouslyTrendingTokens.includes(token);
    if (wasPreviouslyTrending) continue;

    const { baseToken, priceUsd, priceChange, txns, pairAddress, liquidity, volume, dexId, fdv, pairCreatedAt} = tokenData; // prettier-ignore
    const { name, symbol } = baseToken;
    const { keyboard, scanLinksText } = generateTextFooter(token);
    const age = moment(pairCreatedAt).fromNow();

    const solScanLink = `https://solscan.io/token/${token}`;
    const pairLink = `https://solscan.io/account/${pairAddress}`;
    const birdEyeLink = `https://birdeye.so/token/${token}?chain=solana`;
    const dexSLink = `https://dexscreener.com/solana/${token}`;
    const shortenedPairAddress = `${pairAddress.slice(
      0,
      3
    )}...${pairAddress.slice(pairAddress.length - 3, pairAddress.length)}`;
    const hardCleanedSymbol = hardCleanUpBotMessage(symbol);

    let message = `*${hardCleanedSymbol} trending at \\#${index + 1}*

📌 [${hardCleanUpBotMessage(name)} \\(${hardCleanedSymbol}\\)](${solScanLink})
⚠ Mutable Metadata

📌 Pair: [${shortenedPairAddress}](${pairLink})
👤 Owner: RENOUNCED
🔸 Chain: SOL \\| ⚖️ Age: ${age}

💰 MC: \\$${`${formatM2Number(fdv)}`} \\| Liq: \\$${formatM2Number(
      liquidity.usd
    )}
🚀 24h: ${formatM2Number(priceChange.h24)}% \\| V: \\$${formatM2Number(
      volume.h24
    )}
📈 Buys: ${formatM2Number(txns.h24.buys)} \\| 📉 Sells: ${formatM2Number(
      txns.h24.sells
    )}
📊 [Birdeye](${birdEyeLink}) \\| [DexS](${dexSLink})

💲 Price: \\$${cleanUpBotMessage(priceUsd)}
🔗 DexID - \`${dexId}\`

🪙 Token - \`${token}\`

${scanLinksText}`;

    message = message.replace(/-/g, "\\-");

    teleBot.api
      .sendMessage(CHANNEL_ID, message, {
        parse_mode: "MarkdownV2",
        // @ts-expect-error Type not found
        disable_web_page_preview: true,
        reply_markup: keyboard,
      })
      .catch((e) => {
        // eslint-disable-next-line
        console.log(message);
        errorHandler(e);
      });

    log(`Sending message for ${token}`);
  }
}
