import { InlineKeyboard } from "grammy";
import { advertisements } from "@/vars/advertisements";
import { BOT_USERNAME, CHANNEL_ID } from "./env";
import { teleBot } from "..";
import { setTrendingMessageId, trendingMessageId } from "@/vars/message";
import { errorHandler, log } from "./handlers";

// eslint-disable-next-line
export function cleanUpBotMessage(text: any) {
  text = String(text);
  text = text
    .replace(/\./g, "\\.")
    .replace(/-/g, "\\-")
    .replace(/!/g, "\\!")
    .replace(/#/g, "\\#");

  return text;
}

// eslint-disable-next-line
export function hardCleanUpBotMessage(text: any) {
  text = String(text);
  text = text
    .replace(/\./g, "\\.")
    .replace(/-/g, "\\-")
    .replace(/_/g, "\\_")
    .replace(/\|/g, "\\|")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)")
    .replace(/`/g, "\\`")
    .replace(/\+/g, "\\+")
    .replace(/!/g, "\\!")
    .replace(/#/g, "\\#")
    .replace(/\*/g, "\\*");

  return text;
}

export function generateAdvertisementKeyboard() {
  let keyboard = new InlineKeyboard();

  const adSlot = advertisements.at(0);

  if (adSlot) {
    const { text, link } = adSlot;
    keyboard = keyboard.url(text, link).row();
  } else {
    const buttonLink = `https://t.me/${BOT_USERNAME}?start=adBuyRequest`;
    keyboard = keyboard.url("⚡ Advertise here", buttonLink).row();
  }

  return keyboard;
}

function generateScanLinks(token: string) {
  const ttfbot_url = `https://t.me/ttfbotbot?start=${token}`;
  const rickbot_url = `https://t.me/RickBurpBot?start=${token}`;

  const scanLinksText = `[*📡 TTF Bot*](${ttfbot_url}) \\| [*👴🏻 Rick Bot*](${rickbot_url})`;

  return scanLinksText;
}

export function generateTextFooter(token: string) {
  const keyboard = generateAdvertisementKeyboard();
  const scanLinksText = generateScanLinks(token);

  return { keyboard, scanLinksText };
}

export async function sendNewTrendingMessage(text: string) {
  try {
    await teleBot.api.unpinAllChatMessages(CHANNEL_ID || "");
    const keyboard = generateAdvertisementKeyboard();
    const newTrendingMessage = await teleBot.api.sendMessage(
      CHANNEL_ID || "",
      text,
      {
        parse_mode: "MarkdownV2",
        // @ts-expect-error Type not found
        disable_web_page_preview: true,
        reply_markup: keyboard,
      }
    );
    setTrendingMessageId(newTrendingMessage.message_id);

    log(`Updated Message ${trendingMessageId}`);
    teleBot.api.pinChatMessage(CHANNEL_ID || "", trendingMessageId);
  } catch (error) {
    errorHandler(error);
  }
}
