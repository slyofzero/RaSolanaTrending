import { PairsData } from "@/types";
import { apiFetcher } from "@/utils/api";
import { trendPrices } from "@/utils/constants";
import { TOKEN_DATA_URL } from "@/utils/env";
import { isValidSolAddress } from "@/utils/web3";
import { trendingState, userState } from "@/vars/state";
import { toTrendTokens } from "@/vars/trending";
import {
  CallbackQueryContext,
  CommandContext,
  Context,
  InlineKeyboard,
} from "grammy";

export async function trend(ctx: CommandContext<Context>) {
  const { id: chatId } = ctx.chat;
  userState[chatId] = "toTrend";
  const text = `To trend a token, please provide the token's address in the next message`;
  ctx.reply(text);
}

export async function selectTrendingDuration(ctx: CommandContext<Context>) {
  const { id: chatId } = ctx.chat;
  const token = ctx.message?.text;

  if (!isValidSolAddress(token || "")) {
    return ctx.reply("Please enter a proper token address");
  }

  const tokenData = await apiFetcher<PairsData>(`${TOKEN_DATA_URL}/${token}`);
  if (!tokenData.data.pairs) {
    return ctx.reply("The address you entered has no pairs on Solana");
  }

  const storedTokenData = toTrendTokens.find(
    ({ token: storedToken }) => storedToken === token
  );
  if (storedTokenData) {
    const { slot } = storedTokenData;
    return ctx.reply(`Token ${token} is already trending at rank ${slot}`);
  }

  trendingState[chatId] = { token };
  delete userState[chatId];

  const text = "Select the duration you want your token to trend for.";
  let keyboard = new InlineKeyboard();

  for (const duration in trendPrices) {
    const slotText = `${duration} hours`;
    keyboard = keyboard.text(slotText, `trendDuration-${duration}`).row();
  }

  ctx.reply(text, { reply_markup: keyboard });
}

export async function selectTrendingSlot(ctx: CallbackQueryContext<Context>) {
  const chatId = ctx.chat?.id;
  if (!chatId) return ctx.reply("Please do /trend again");

  ctx.deleteMessage();
  const duration = Number(ctx.callbackQuery.data.replace("trendDuration-", ""));
  trendingState[chatId] = { ...trendingState[chatId], duration };

  const text = "Select the trending slot you wish for your token to trend at";
  let keyboard = new InlineKeyboard();
  const takenTrendSlots = toTrendTokens.map(({ slot }) => slot);

  for (const [key, price] of trendPrices[duration].entries()) {
    const slot = key + 1;
    let slotText: string = "";
    let slotCallBack: string = `trendSlot-${slot}`;

    if (takenTrendSlots.includes(slot)) {
      slotText = `Slot ${slot}: ❌ Taken`;
      slotCallBack = `invalid-ad-slot`;
    } else {
      slotText = `Slot ${slot}: ✅ Available - Buy | $${price}`;
    }
    keyboard = keyboard.text(slotText, slotCallBack).row();
  }

  ctx.reply(text, { reply_markup: keyboard });
}
