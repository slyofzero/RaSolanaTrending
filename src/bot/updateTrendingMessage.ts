import { CHANNEL_ID, PINNED_MSG_ID } from "@/utils/env";
import { errorHandler, log } from "@/utils/handlers";
import { trendingTokens } from "@/vars/trending";
import { DEXSCREEN_URL } from "@/utils/constants";
import { lastEditted, setLastEditted } from "@/vars/message";
import { teleBot } from "..";
import {
  cleanUpBotMessage,
  generateAdvertisementKeyboard,
  hardCleanUpBotMessage,
} from "@/utils/bot";

export async function updateTrendingMessage() {
  if (!CHANNEL_ID || isNaN(PINNED_MSG_ID)) {
    return log("Channel ID or PINNED_MSG_ID is undefined");
  }

  let trendingTokensMessage = `*SOL TRENDING* \\| [*Disclaimer*](https://t.me/c/2125443386/2)\n\n`;
  const icons = ["🥇", "🥈", "🥉", "4️⃣", "5️⃣", "6️⃣", "7️⃣", "8️⃣", "9️⃣", "🔟"];

  try {
    // ------------------------------ Trending Message ------------------------------
    for (const [index, [token, tokenData]] of trendingTokens.entries()) {
      const { baseToken, priceChange } = tokenData;
      const { name, symbol } = baseToken;
      const priceChangeh24 = priceChange.h24;
      const icon = icons[index] || "🔥";

      const telegramLink = tokenData.info?.socials?.find(
        ({ type }) => type === "telegram"
      )?.url;

      const url = telegramLink || `${DEXSCREEN_URL}/solana/${token}`;
      // const scanUrl = `https://t.me/ttfbotbot?start=${token}`;
      // const buyUrl = `https://t.me/magnum_trade_bot?start=PHryLEnW_snipe_${token}`;

      const cleanedTokenName = hardCleanUpBotMessage(name);
      const cleanedTokenSymbol = hardCleanUpBotMessage(symbol);
      const formattedPriceChange = `[${cleanUpBotMessage(
        priceChangeh24
      )}%](${DEXSCREEN_URL}/solana/${token})`;

      let newLine = `${icon} [${cleanedTokenName} \\| ${cleanedTokenSymbol}](${url}) \\| ${formattedPriceChange}\n${
        index < 3 ? "\n" : ""
      }`;
      newLine = newLine.trimStart();
      trendingTokensMessage += newLine;
    }

    setLastEditted(new Date().toLocaleTimeString());
    trendingTokensMessage += `\n_Automatically updates every minute_\n_Last updated at ${lastEditted} \\(GMT\\)_`;

    // ------------------------------ Advertisements ------------------------------
    const keyboard = generateAdvertisementKeyboard();

    teleBot.api
      .editMessageText(CHANNEL_ID, PINNED_MSG_ID, trendingTokensMessage, {
        parse_mode: "MarkdownV2",
        // @ts-expect-error Type not found
        disable_web_page_preview: true,
        reply_markup: keyboard,
      })
      .catch(async (e) => errorHandler(e));
  } catch (error) {
    errorHandler(error);
  }
}
