import { apiFetcher } from "@/utils/api";
import { isValidSolAddress } from "@/utils/web3";
import { trendingState, userState } from "@/vars/state";
import { toTrendTokens } from "@/vars/trending";
import {
  CallbackQueryContext,
  CommandContext,
  Context,
  InlineKeyboard,
} from "grammy";
import { preparePayment } from "../payment";
import { isValidUrl } from "@/utils/general";
import { PairsData, StoredToTrend } from "@/types";
import { TOKEN_DATA_URL, TRENDING_PRICES } from "@/utils/env";
import { errorHandler } from "@/utils/handlers";
import { getDocument } from "@/firebase";
import moment from "moment";
import { trendPrices } from "@/utils/constants";

export async function trend(
  ctx: CommandContext<Context> | CallbackQueryContext<Context>
) {
  const chatId = ctx.chat?.id;
  const username = ctx.from?.username;
  const callbackData = ctx.callbackQuery?.data;

  if (!chatId) return ctx.reply("please do /trend again");

  const trendBoughtByUser = (
    await getDocument<StoredToTrend>({
      collectionName: "to_trend",
      queries: [
        ["status", "==", "PAID"],
        ["username", "==", username],
      ],
    })
  ).at(0);

  if (callbackData !== "newTrend" && trendBoughtByUser) {
    const { token, expiresAt, duration, slot } = trendBoughtByUser;
    const slots = slot === 1 ? "1 to 3" : "4 to 10";
    const expiresIn = moment((expiresAt?.seconds || 0) * 1e3)
      .fromNow()
      .replace("ago", "")
      .trim();

    const keyboard = new InlineKeyboard()
      .text("Extend trend duration", "extendTrend")
      .text("Purchase new", "newTrend");

    const text = `You already have a token trending\\.
    
Token \\- \`${token}\`
Duration \\- ${duration} hours
Slot \\- ${slots}
Expires ${expiresIn}`;

    ctx.reply(text, { parse_mode: "MarkdownV2", reply_markup: keyboard });
    return;
  }

  userState[chatId] = "toTrend";
  const text = `Please enter token address.`;
  ctx.reply(text).catch((e) => errorHandler(e));
}

export async function extendTrend(ctx: CallbackQueryContext<Context>) {
  ctx.deleteMessage();

  const text = "Select the duration you want to extend by -";
  const keyboard = new InlineKeyboard()
    .text("3 hours", "extendTrendDuration-3")
    .text("6 hours", "extendTrendDuration-6")
    .row()
    .text("12 hours", "extendTrendDuration-12")
    .text("24 hours", "extendTrendDuration-24");

  ctx.reply(text, { reply_markup: keyboard });
}

export async function addTrendingSocial(ctx: CommandContext<Context>) {
  const { id: chatId } = ctx.chat;
  const token = ctx.message?.text;

  if (!isValidSolAddress(token || "")) {
    return ctx.reply("Please enter a proper token address");
  }

  // const terminalResponse = apiFetcher<TerminalData>(
  //   `https://api.geckoterminal.com/api/v2/search/pools?query=${token}&network=ton&page=1`
  // );
  const dexSData = await apiFetcher<PairsData>(`${TOKEN_DATA_URL}/${token}`);

  if (dexSData?.data.pairs?.length === 0) {
    return ctx.reply("The address you entered has no pairs on Solana.");
  }

  const storedTokenData = toTrendTokens.find(
    ({ token: storedToken }) => storedToken === token
  );
  if (storedTokenData) {
    const { slot } = storedTokenData;
    return ctx.reply(`Token ${token} is already trending at rank ${slot}`);
  }

  trendingState[chatId] = { token };

  userState[chatId] = "trendSocials";
  const text = `Please enter social link.`;
  ctx.reply(text).catch((e) => errorHandler(e));
}

export async function setTrendingEmoji(
  ctx: CommandContext<Context> | CallbackQueryContext<Context>
) {
  const chatId = ctx.chat?.id;
  const link = ctx.message?.text || "";

  if (!chatId) return ctx.reply("Please do /trend again");

  if (!isValidUrl(link)) {
    return ctx.reply("Please enter a valid URL");
  }

  const data = ctx.callbackQuery?.data;
  if (data?.split("-").at(-1) === "return") ctx.deleteMessage();

  trendingState[chatId] = { ...trendingState[chatId], social: link };
  delete userState[chatId];

  ctx.reply(
    "Please enter emoji that you wish to display in Hype Trending Channel's buybot"
  );
  userState[chatId] = "trendEmoji";
}

// export async function setTrendingGif(ctx: CommandContext<Context>) {
//   const { id: chatId } = ctx.chat;
//   const emoji = ctx.message?.text || "";

//   trendingState[chatId] = { ...trendingState[chatId], emoji };
//   delete userState[chatId];

//   ctx.reply(
//     "Send a GIF in the next message, this GIF will be shown in the buybot messages in the trending channel."
//   );
//   userState[chatId] = "trendGif";
// }

export async function selectTrendingSlot(
  ctx: CommandContext<Context> | CallbackQueryContext<Context>
) {
  const chatId = ctx.chat?.id;
  const emoji = ctx.message?.text || "";

  if (!chatId) return ctx.reply("Please do /trend again");

  const data = ctx.callbackQuery?.data;
  if (data?.split("-").at(-1) === "return") ctx.deleteMessage();

  trendingState[chatId] = { ...trendingState[chatId], emoji };
  delete userState[chatId];

  const top3Trending =
    toTrendTokens.filter(({ slot }) => slot === 1).length === 3;
  const top8Trending =
    toTrendTokens.filter(({ slot }) => slot === 2).length === 8;
  const top15Trending =
    toTrendTokens.filter(({ slot }) => slot === 3).length === 15;

  const getNearestExpiries = () => {
    let minExpiries = [];

    for (const toSearch of [1, 2, 3]) {
      const expiries = toTrendTokens
        .filter(({ slot }) => slot === toSearch)
        .map(({ expiresAt }) => expiresAt?.seconds)
        .filter((val) => val !== undefined) as number[];

      minExpiries.push(Math.min(...expiries));
    }

    minExpiries = minExpiries.map((val) =>
      val === Infinity ? undefined : val
    );

    const timeDifferences = minExpiries.map((timestamp, index) => {
      const [prefix, allTaken] =
        index === 0
          ? ["3", top3Trending]
          : index === 1
          ? ["8", top8Trending]
          : ["15", top15Trending];

      if (timestamp === undefined || !allTaken) {
        return "";
      }

      const currentTime = moment(); // Current time
      const futureTime = moment.unix(timestamp); // Convert timestamp to a moment object
      const duration = moment.duration(futureTime.diff(currentTime)); // Calculate the difference

      // Format the duration into a human-readable string
      const trimmedDuration = duration.humanize(true).trim(); // 'in a day', 'in 2 hours', etc.
      return `🔴 Top ${prefix} slots will be available ${trimmedDuration}`;
    });

    return timeDifferences.filter((val) => val).join("\n");
  };

  const minExpiries = getNearestExpiries();

  const text = `❕ Select open slot or click to see the nearest potential availability time:
    
${minExpiries}`;

  let keyboard = new InlineKeyboard();

  keyboard = keyboard
    .text(
      `${top3Trending ? "🔴" : "🟢"} Top 3 guarantee`,
      top3Trending ? "dum" : "trendSlot-1"
    )
    .text(
      `${top8Trending ? "🔴" : "🟢"} Top 8 guarantee`,
      top8Trending ? "dum" : "trendSlot-2"
    )
    .text(
      `${top15Trending ? "🔴" : "🟢"} Any position`,
      top15Trending ? "dum" : "trendSlot-3"
    )
    .toFlowed(2);

  ctx.reply(text, { reply_markup: keyboard });
}

export async function selectTrendingDuration(
  ctx: CommandContext<Context> | CallbackQueryContext<Context>
) {
  const chatId = ctx.chat?.id;
  const slot = Number(ctx.callbackQuery?.data.at(-1)) as 1 | 2 | 3;

  if (isNaN(slot)) return ctx.reply("Please click on the button again");
  else if (!chatId) return ctx.reply("Please do /trend again");
  else if (!TRENDING_PRICES) return ctx.reply("An error occurred");

  if (!chatId) return ctx.reply("Please do /trend again");

  const data = ctx.callbackQuery?.data;
  if (data?.split("-").at(-1) === "return") ctx.deleteMessage();

  trendingState[chatId] = { ...trendingState[chatId], slot };
  delete userState[chatId];

  ctx.deleteMessage();

  const text = "❔ Select the duration you want your token to trend for: ";
  let keyboard = new InlineKeyboard();

  const durationPrices = trendPrices[slot];
  const discounts = { 3: 0, 8: 15, 24: 30 };

  for (const [index, [duration, price]] of Object.entries(
    durationPrices
  ).entries()) {
    const discount = discounts[Number(duration) as 3 | 8 | 24];
    const discountText = discount ? `(-${discount}%)` : "";
    keyboard = keyboard.text(
      `${duration} hours | ${price} SOL ${discountText}`,
      `trendDuration-${duration}`
    );

    if (index % 2 !== 0) keyboard = keyboard.row();
  }

  keyboard = keyboard.row().text("<< Back >>", "trendEmoji-return");

  ctx.reply(text, { reply_markup: keyboard });
}

export function prepareTrendingState(ctx: CallbackQueryContext<Context>) {
  // @ts-expect-error temp
  const chatId = ctx.chat?.id;
  const duration = Number(ctx.callbackQuery?.data.split("-").at(-1));

  if (isNaN(duration)) return ctx.reply("Please click on the button again");

  trendingState[chatId] = { ...trendingState[chatId], duration };
  preparePayment(ctx);
}
