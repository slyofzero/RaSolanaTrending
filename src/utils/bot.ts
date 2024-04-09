import { InlineKeyboard } from "grammy";
import { advertisements } from "@/vars/advertisements";
import { BOT_URL } from "./env";

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

  for (const index of Array.from(Array(2).keys())) {
    const adSlot = advertisements.find(
      ({ slot }) => Number(slot) === index + 1
    );

    if (adSlot) {
      const { text, link } = adSlot;
      keyboard = keyboard.url(text, link).row();
    } else {
      const buttonLink = `${BOT_URL}?start=adBuyRequest`;
      keyboard = keyboard.url("⚡ Advertise here", buttonLink).row();
    }
  }

  return keyboard;
}

function generateScanLinks(token: string) {
  const soulScanLink = `https://t.me/soul_scanner_bot?start=${token}`;
  const soulSniperLink = `https://t.me/soul_sniper_bot?start=TruTrend_${token}`;
  const magnum_url = `https://t.me/magnum_trade_bot?start=PHryLEnW_snipe_${token}`;
  const ttfbot_url = `https://t.me/ttfbotbot?start=${token}`;

  const scanLinksText = `[*👻 Soul Scan*](${soulScanLink}) \\| [*👻 Soul Sniper*](${soulSniperLink})
  [*📡 TTF Bot*](${ttfbot_url}) \\| [*🎯 Magnum Bot*](${magnum_url})`;

  return scanLinksText;
}

export function generateTextFooter(token: string) {
  const keyboard = generateAdvertisementKeyboard();
  const scanLinksText = generateScanLinks(token);

  return { keyboard, scanLinksText };
}
