import { InlineKeyboard } from "grammy";
import { advertisements } from "@/vars/advertisements";

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
  const showSecondSlot = advertisements.some(({ slot }) => slot === 2);

  for (const index of Array.from(Array(2).keys())) {
    if (index === 1 && !showSecondSlot) break;

    const adSlot = advertisements.find(
      ({ slot }) => Number(slot) === index + 1
    );

    if (adSlot) {
      const { text, link } = adSlot;
      keyboard = keyboard.url(text, link).row();
    } else {
      const buttonLink = `https://t.me/RaSolanaTrendingBot?start=adBuyRequest`;
      keyboard = keyboard.url("⚡ Advertise here", buttonLink).row();
    }
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
