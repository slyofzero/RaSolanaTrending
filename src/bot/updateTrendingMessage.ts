import { CHANNEL_ID, PINNED_MSG_ID } from "@/utils/env";
import { errorHandler, log } from "@/utils/handlers";
import { toTrendTokens, trendingTokens } from "@/vars/trending";
import { lastEditted, setLastEditted, trendingMessageId } from "@/vars/message";
import { teleBot } from "..";
import {
  cleanUpBotMessage,
  generateAdvertisementKeyboard,
  hardCleanUpBotMessage,
  sendNewTrendingMessage,
} from "@/utils/bot";
import { validEditMessageTextErrors } from "@/utils/constants";

export async function updateTrendingMessage() {
  if (!CHANNEL_ID || isNaN(PINNED_MSG_ID)) {
    return log("Channel ID or PINNED_MSG_ID is undefined");
  }

  log("Updating trending message...");

  let trendingTokensMessage = `*SOL TRENDING* \\| [*Disclaimer*](https://t.me/c/2125443386/2)\n\n`;
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
  ];

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

      const tokenSocials = toTrendTokens.find(
        ({ token: storedToken }) => storedToken === token
      )?.socials;

      const photonLink = `https://photon-sol.tinyastro.io/en/r/@closedcircle/${token}`;

      const url = tokenSocials || telegramLink || photonLink;
      // const scanUrl = `https://t.me/ttfbotbot?start=${token}`;
      // const buyUrl = `https://t.me/magnum_trade_bot?start=PHryLEnW_snipe_${token}`;

      const cleanedTokenName = hardCleanUpBotMessage(name);
      const cleanedTokenSymbol = hardCleanUpBotMessage(symbol);
      const formattedPriceChange = `[${cleanUpBotMessage(
        priceChangeh24
      )}%](${photonLink})`;

      const indentation = index < 3 || index === 9 ? "\n" : "";

      let newLine = `${icon} [${cleanedTokenName} \\| ${cleanedTokenSymbol}](${url}) \\| ${formattedPriceChange}\n${indentation}`;
      newLine = newLine.trimStart();
      trendingTokensMessage += newLine;
    }

    setLastEditted(new Date().toLocaleTimeString());
    trendingTokensMessage += `\n_Automatically updates every minute_\n_Last updated at ${lastEditted} \\(GMT\\)_`;

    // ------------------------------ Advertisements ------------------------------
    const keyboard = generateAdvertisementKeyboard();

    try {
      await teleBot.api.editMessageText(
        CHANNEL_ID,
        trendingMessageId,
        trendingTokensMessage,
        {
          parse_mode: "MarkdownV2",
          // @ts-expect-error Type not found
          disable_web_page_preview: true,
          reply_markup: keyboard,
        }
      );
      teleBot.api.pinChatMessage(CHANNEL_ID || "", trendingMessageId);
      log(`Updated Message ${trendingMessageId}`);
    } catch (err) {
      const error = err as Error;
      errorHandler(err);

      const isValidEditError = validEditMessageTextErrors.some((errors) =>
        error.message.includes(errors)
      );

      if (isValidEditError) sendNewTrendingMessage(trendingTokensMessage);
    }
  } catch (error) {
    errorHandler(error);
  }
}
