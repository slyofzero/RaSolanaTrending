import { CallbackQueryContext, CommandContext, Context } from "grammy";
import { selectTrendingDuration, selectTrendingSlot } from "./commands/trend";
import { userState } from "@/vars/state";
import { confirmPayment, preparePayment } from "./payment";
import {
  advertiseLink,
  selectAdDuration,
  selectAdSlot,
} from "./commands/advertise";
import {
  referralLink,
  setCustomLink,
  setReferralText,
} from "./commands/referralLink";

const steps: { [key: string]: any } = {
  toTrend: selectTrendingDuration,
  trendDuration: selectTrendingSlot,
  trendSlot: preparePayment,
  trendingPayment: confirmPayment,

  advertiseText: advertiseLink,
  advertiseLink: selectAdDuration,
  adDuration: selectAdSlot,
  adSlot: preparePayment,
  adPayment: confirmPayment,

  referralAddress: referralLink,
  setCustomLink: setCustomLink,
  setReferralText: setReferralText,
};

export async function executeStep(
  ctx: CommandContext<Context> | CallbackQueryContext<Context>
) {
  const chatId = ctx.chat?.id;
  if (!chatId) return ctx.reply("Please redo your action");

  const queryCategory = ctx.callbackQuery?.data?.split("-").at(0);
  const step = userState[chatId] || queryCategory || "";
  const stepFunction = steps[step];

  if (stepFunction) {
    stepFunction(ctx);
  } else {
    ctx.reply("No step function defined");
  }
}
