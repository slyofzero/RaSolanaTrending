import { BOT_URL, BOT_USERNAME, CHANNEL_ID, PINNED_MSG_ID } from "@/utils/env";
import { errorHandler, log } from "@/utils/handlers";
import { trendingTokens } from "@/vars/trending";
import { DEXSCREEN_URL } from "@/utils/constants";
import { lastEditted, setLastEditted } from "@/vars/message";
import { teleBot } from "..";
import { generateAdvertisementKeyboard } from "@/utils/bot";

export async function updateTrendingMessage() {
  if (!CHANNEL_ID || isNaN(PINNED_MSG_ID)) {
    return log("Channel ID or PINNED_MSG_ID is undefined");
  }

  let trendingTokensMessage = `🟢 @${BOT_USERNAME} (LIVE)\n\n`;
  const icons = ["🥇", "🥈", "🥉", "4️⃣", "5️⃣", "6️⃣", "7️⃣", "8️⃣", "9️⃣", "🔟"];
  const buyText = `[*Buy a spot ⚡*](${BOT_URL}?start=trend)\n`;

  try {
    // ------------------------------ Trending Message ------------------------------
    for (const [index, [token, tokenData]] of trendingTokens.entries()) {
      const { baseToken, priceChange } = tokenData;
      const name = baseToken.name;
      const priceChangeh24 = priceChange.h24;
      const icon = icons[index] || "🔥";

      const url = `${DEXSCREEN_URL}/base/${token}`;
      const scanUrl = `https://t.me/ttfbotbot?start=${token}`;
      const buyUrl = `https://t.me/magnum_trade_bot?start=PHryLEnW_snipe_${token}`;

      let newLine = `${icon} [${name}](${url}) | ${priceChangeh24}% | [Scan](${scanUrl}) | [Buy](${buyUrl})\n`;
      newLine = newLine.trimStart();
      trendingTokensMessage += newLine;

      if (index === 2) {
        trendingTokensMessage += buyText;
      }
    }

    setLastEditted(new Date().toLocaleTimeString());
    trendingTokensMessage += `\n_Automatically updates every minute_\n_Last updated at ${lastEditted}_`;

    // ------------------------------ Advertisements ------------------------------
    const keyboard = generateAdvertisementKeyboard();

    teleBot.api
      .editMessageText(CHANNEL_ID, PINNED_MSG_ID, trendingTokensMessage, {
        parse_mode: "Markdown",
        // @ts-expect-error Type not found
        disable_web_page_preview: true,
        reply_markup: keyboard,
      })
      .then(() => log("Message Editted"))
      .catch(async (e) => errorHandler(e));
  } catch (error) {
    errorHandler(error);
  }
}
