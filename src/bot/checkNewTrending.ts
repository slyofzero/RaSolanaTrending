import { generateTextFooter, hardCleanUpBotMessage } from "@/utils/bot";
import { formatNumber } from "@/utils/general";
import { previouslyTrendingTokens, trendingTokens } from "@/vars/trending";
import moment from "moment";
import { teleBot } from "..";
import { log } from "@/utils/handlers";
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

    let message = `* ${hardCleanedSymbol} trending at \\#${index + 1}*

📌 [${hardCleanUpBotMessage(name)} \\(${hardCleanedSymbol}\\)](${solScanLink})
⚠ Mutable Metadata

📌 Pair: [${shortenedPairAddress}](${pairLink})
👤 Owner: RENOUNCED
🔸 Chain: SOL \\| ⚖️ Age: ${age}

💰 MC: \\$${`${formatNumber(fdv)}`} \\| Liq: \\$${formatNumber(liquidity.usd)}
🚀 24h: ${formatNumber(priceChange.h24)}% \\| V: \\$${formatNumber(volume.h24)}
📈 Buys: ${formatNumber(txns.h24.buys)} \\| 📉 Sells: ${formatNumber(
      txns.h24.sells
    )}
📊 [Birdeye](${birdEyeLink}) \\| [DexS](${dexSLink})

💲 Price: \\$${priceUsd}
🔗 DexID - \`${dexId}\`

🪙 Token - \`${token}\`

${scanLinksText}`;

    message = message
      .replace(/\./g, "\\.")
      .replace(/-/g, "\\-")
      .replace(/=/g, "\\=")
      .replace(/!/g, "\\!");

    await teleBot.api.sendMessage(CHANNEL_ID, message, {
      parse_mode: "MarkdownV2",
      // @ts-expect-error Type not found
      disable_web_page_preview: true,
      reply_markup: keyboard,
    });

    log(`Sending message for ${token}`);
  }
}
