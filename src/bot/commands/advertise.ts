import { adPrices } from "@/utils/constants";
import { isValidUrl } from "@/utils/general";
import { advertisementState, userState } from "@/vars/state";
import {
  CallbackQueryContext,
  CommandContext,
  Context,
  InlineKeyboard,
} from "grammy";
import { preparePayment } from "../payment";

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
    const price = adPrices[duration];
    const slotText = `${duration} hours : ${price} TON`;
    keyboard = keyboard.text(slotText, `adDuration-${duration}`).row();
  }

  ctx.reply(text, { reply_markup: keyboard });
}

export function prepareAdvertisementState(ctx: CallbackQueryContext<Context>) {
  const chatId = ctx.chat?.id || "";
  const duration = Number(
    ctx.callbackQuery.data.replace("adDuration-", "").split("-")
  );

  advertisementState[chatId] = {
    ...advertisementState[chatId],
    slot: 1,
    duration,
  };
  preparePayment(ctx);
}
