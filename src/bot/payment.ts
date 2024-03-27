import { addDocument, getDocument, updateDocumentById } from "@/firebase";
import { StoredAccount } from "@/types/accounts";
import { StoredToTrend } from "@/types/trending";
import { trendPrices } from "@/utils/constants";
import { encrypt } from "@/utils/cryptography";
import { roundUpToDecimalPlace } from "@/utils/general";
import { errorHandler } from "@/utils/handlers";
import { generateAccount } from "@/utils/web3";
import { ethPrice } from "@/vars/ethPrice";
import { trendingState } from "@/vars/state";
import { Timestamp } from "firebase-admin/firestore";
import { CallbackQueryContext, Context, InlineKeyboard } from "grammy";
import { nanoid } from "nanoid";

export async function getUnlockedAccount() {
  let publicKey: string = "";

  const notLockedAccount = (
    await getDocument<StoredAccount>({
      collectionName: "accounts",
      queries: [["locked", "!=", true]],
    })
  ).at(0);

  if (notLockedAccount) {
    publicKey = notLockedAccount.publicKey;
    updateDocumentById({
      id: notLockedAccount.id || "",
      collectionName: "accounts",
      updates: { locked: true, lockedAt: Timestamp.now() },
    });
  } else {
    const newAccount = generateAccount();
    publicKey = newAccount.publicKey;

    const newAccountData: StoredAccount = {
      publicKey,
      secretKey: encrypt(newAccount.secretKey),
      locked: true,
      lockedAt: Timestamp.now(),
    };

    addDocument({ data: newAccountData, collectionName: "accounts" });
  }

  return publicKey;
}

export async function preparePayment(ctx: CallbackQueryContext<Context>) {
  const chatId = ctx.chat?.id;
  const username = ctx.from.username;
  if (!chatId || !username)
    return ctx.reply("Please restart the bot interaction again");

  try {
    ctx.deleteMessage();
    const slot = Number(
      ctx.callbackQuery.data.replace(`${"trendSlot" || "adSlot"}-`, "")
    );
    const isTrendingPayment = Object.values(trendingState[chatId]).length > 0;

    const account = await getUnlockedAccount();
    const hash = nanoid(10);
    let text = "";
    let priceInEth = 0;
    const { duration, token } = trendingState[chatId];
    if (!duration || !token) return ctx.reply("Please do /trend again");

    if (isTrendingPayment) {
      trendingState[chatId] = { ...trendingState[chatId], slot };

      const price = trendPrices[duration][slot];
      priceInEth = roundUpToDecimalPlace(price / ethPrice, 6);
      text = `You have selected trending slot ${slot} for ${duration} hours.
The total cost - \`${priceInEth}\` ETH

Send the bill amount to the below address within 20 minutes, starting from this message generation. Once paid, click on "I have paid" to verify payment. If 20 minutes have already passed then please restart using /trend.

Address - \`${account}\``;
    }

    text = text.replace(/\./g, "\\.").replace(/-/g, "\\-");
    const keyboard = new InlineKeyboard().text(
      "I have paid",
      `subscription-payment-${hash}`
    );

    ctx.reply(text, { parse_mode: "MarkdownV2", reply_markup: keyboard });

    const dataToAdd: StoredToTrend = {
      paidAt: Timestamp.now(),
      sentTo: account,
      amount: priceInEth,
      trendSlot: slot,
      trendDuration: duration,
      initiatedBy: username,
      token: token,
      hash: hash,
      status: "PENDING",
    };

    addDocument({
      collectionName: "to_trend",
      data: dataToAdd,
      id: hash,
    });

    return true;
  } catch (error) {
    errorHandler(error);
    ctx.reply(
      "An error occurred. Please don't follow with the payment and instead use /advertise again in the same way you used earlier."
    );

    return false;
  }
}
