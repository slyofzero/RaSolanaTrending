import { BOT_USERNAME, CHANNEL_ID, PINNED_MSG_ID } from "@/utils/env";
import { errorHandler, log } from "@/utils/handlers";
import { trendingTokens } from "@/vars/trending";
import { DEXSCREEN_URL } from "@/utils/constants";
import { setLastEditted } from "@/vars/message";
import { teleBot } from "..";
import {
  cleanUpBotMessage,
  generateAdvertisementKeyboard,
  hardCleanUpBotMessage,
} from "@/utils/bot";
import { formatM2Number } from "@/utils/general";

export async function updateTrendingMessage() {
  if (!CHANNEL_ID || isNaN(PINNED_MSG_ID)) {
    return log("Channel ID or PINNED_MSG_ID is undefined");
  }

  let trendingTokensMessage = `🟢 @${BOT_USERNAME} \\(LIVE\\)\n\n`;
  const icons = [
    "🥇",
    "🥈",
    "🥉",
    "4️⃣",
    "5️⃣",
    "6️⃣",
    "7️⃣",
    "8️⃣",
    "9️⃣",
    "🔟",
    "1️⃣1️⃣",
    "1️⃣2️⃣",
    "1️⃣3️⃣",
    "1️⃣4️⃣",
    "1️⃣5️⃣",
    "1️⃣6️⃣",
    "1️⃣7️⃣",
    "1️⃣8️⃣",
    "1️⃣9️⃣",
    "2️⃣0️⃣",
  ];

  try {
    // ------------------------------ Trending Message ------------------------------
    for (const [index, [token, tokenData]] of trendingTokens
      .slice(0, 20)
      .entries()) {
      if (index === 3 || index === 10) {
        trendingTokensMessage += cleanUpBotMessage(
          "--------------------------\n"
        );
      }

      const { socials, attributes } = tokenData;
      const { price_change_percentage, name } = attributes;
      const symbol = name.split("/").at(0);
      log(`${symbol}`);
      const priceChangeh24 = price_change_percentage.h24;
      const icon = icons[index];

      const url = socials || `${DEXSCREEN_URL}/ton/${token}`;
      const cleanedTokenSymbol = hardCleanUpBotMessage(symbol);
      const formattedPriceChange = formatM2Number(priceChangeh24);

      let newLine = `${icon} [*$${cleanedTokenSymbol} \\| ${formattedPriceChange}%*](${url})\n`;
      newLine = newLine.trimStart();
      trendingTokensMessage += newLine;
    }

    setLastEditted(new Date().toLocaleTimeString());
    trendingTokensMessage += `\n_Trending data is automatically updated by\n@${BOT_USERNAME} every 10 seconds_`;

    // ------------------------------ Advertisements ------------------------------
    const keyboard = generateAdvertisementKeyboard();

    teleBot.api
      .editMessageText(CHANNEL_ID, PINNED_MSG_ID, trendingTokensMessage, {
        parse_mode: "MarkdownV2",
        // @ts-expect-error Type not found
        disable_web_page_preview: true,
        reply_markup: keyboard,
      })
      .then(() => log("Updated trending"))
      .catch((e) => errorHandler(e));
  } catch (error) {
    errorHandler(error);
  }
}
