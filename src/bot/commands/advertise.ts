import { adPrices } from "@/utils/constants";
import { isValidUrl } from "@/utils/general";
import { advertisements } from "@/vars/advertisements";
import { advertisementState, userState } from "@/vars/state";
import {
  CallbackQueryContext,
  CommandContext,
  Context,
  InlineKeyboard,
} from "grammy";

export async function advertise(ctx: CommandContext<Context>) {
  const { id: chatId } = ctx.chat;
  userState[chatId] = "advertiseText";
  const text = `To advertise, please provide the advertisement's text in the next message`;
  ctx.reply(text);
}

export async function advertiseLink(ctx: CommandContext<Context>) {
  const { id: chatId } = ctx.chat;
  const adText = ctx.message?.text;

  advertisementState[chatId] = { text: adText };

  userState[chatId] = "advertiseLink";
  const text = `Next up, please provide a link to which any user would be redirected to upon clicking on the advertisement`;
  ctx.reply(text);
}

export async function selectAdDuration(ctx: CommandContext<Context>) {
  const { id: chatId } = ctx.chat;
  const link = ctx.message?.text;

  if (!link || !isValidUrl(link)) {
    return ctx.reply("Please enter a proper URL");
  }

  delete userState[chatId];
  advertisementState[chatId] = { link, ...advertisementState[chatId] };

  const text =
    "Select the duration you want your advertisement to be visible for.";
  let keyboard = new InlineKeyboard();

  for (const duration in adPrices) {
    const slotText = `${duration} hours`;
    keyboard = keyboard.text(slotText, `adDuration-${duration}`).row();
  }

  ctx.reply(text, { reply_markup: keyboard });
}

export async function selectAdSlot(ctx: CallbackQueryContext<Context>) {
  const chatId = ctx.chat?.id;
  if (!chatId) return ctx.reply("Please do /trend again");

  ctx.deleteMessage();
  const duration = Number(ctx.callbackQuery.data.replace("adDuration-", ""));
  advertisementState[chatId] = { ...advertisementState[chatId], duration };

  const text =
    "Select the advertisement slot you wish for your ad to appear on";
  let keyboard = new InlineKeyboard();

  for (const index of Array.from(Array(2).keys())) {
    const slot = index + 1;
    const adSlot = advertisements.find(
      ({ slot: storedSlot }) => storedSlot === slot
    );

    if (adSlot) {
      keyboard = keyboard
        .text(`Slot ${slot}: ❌ Taken`, "invalid-ad-slot")
        .row();
    } else {
      keyboard = keyboard
        .text(`Slot ${slot}: ✅ Available`, `adSlot-${slot}`)
        .row();
    }
  }

  ctx.reply(text, { reply_markup: keyboard });
}
