import { addDocument, getDocument, updateDocumentById } from "@/firebase";
import { StoredReferral } from "@/types";
import { cleanUpBotMessage } from "@/utils/bot";
import { referralCommisionFee } from "@/utils/constants";
import { referralAddressRepeated } from "@/utils/db";
import { BOT_URL } from "@/utils/env";
import { log } from "@/utils/handlers";
import { isValidSolAddress } from "@/utils/web3";
import { userState } from "@/vars/state";
import {
  CallbackQueryContext,
  CommandContext,
  Context,
  HearsContext,
  InlineKeyboard,
} from "grammy";

export async function referralLink(
  ctx: CommandContext<Context>,
  referrer?: number
) {
  const { id: chatId } = ctx.chat;
  const { match } = ctx;
  const messageText = ctx.message?.text;
  const address = match || messageText;

  let [referralLinkData] = await getDocument<StoredReferral>({
    collectionName: "referral",
    queries: [["userId", "==", chatId]],
  });

  if (referrer === chatId) {
    return ctx.reply("You can't use your own referral link");
  }

  // If not referral data then add one, if there is and address was passed as match then update the data
  if (!referralLinkData) {
    referralLinkData = { userId: chatId };
    if (referrer) referralLinkData.referrer = referrer;

    addDocument<StoredReferral>({
      collectionName: "referral",
      data: referralLinkData,
    }).then(() => log(`Referral data added for ${chatId}`));

    return;
  } else if (messageText?.startsWith("/") && !referralLinkData.walletAddress) {
    userState[chatId] = "referralAddress";

    return ctx.reply(
      "You don't have a referral link yet. Pass a Solana address in the next message. You will receive your referral fees in that address."
    );
  }
  // Making sure the message wasn't a command use
  else if (address && !address.startsWith("/")) {
    if (isValidSolAddress(address)) {
      // To check for duplicate referral addresses
      const addressInUse = await referralAddressRepeated(address);
      if (addressInUse) {
        const personUsingAddress =
          addressInUse.userId === chatId ? "you" : "someone else";

        return ctx.reply(
          `The address \`${address}\` is already in use by ${personUsingAddress}\\. Please pass a different address\\.`,
          { parse_mode: "MarkdownV2" }
        );
      }

      updateDocumentById<StoredReferral>({
        collectionName: "referral",
        updates: { walletAddress: address },
        id: referralLinkData.id || "",
      }).then(() => {
        log(`Referral address updated for ${chatId}`);
      });

      delete userState[chatId];

      if (match) {
        return ctx.reply(`Referral fee address updated to \`${address}\``, {
          parse_mode: "MarkdownV2",
        });
      }
    }
    // This check here because if a user use's a referral link even after theirs is already set, the refferer comes as `match`
    else if (!referrer) {
      return ctx.reply("Please pass a valid SOL address");
    }
    // So the user from the above case doesn't get both the /start and /referral_link msg
    else {
      return;
    }
  }

  if (messageText === "/start" && !match) return false;

  const { referralText, walletAddress: storedAddress } = referralLinkData;
  const commisionShare = referralCommisionFee * 100;
  const referral_link = `${BOT_URL}?start=${referralText || chatId}`;
  const text = `Your referral link is - \n\`${referral_link}\`\n\nAny payments the user that is introduced to our bot using your link makes would entitle you to ${commisionShare}% of that amount and would be sent to the wallet address mentioned below. Anytime a purchase is made, you'll be notified with the fees that was sent to your wallet.\n\nWallet - \`${
    storedAddress || address
  }\`\n\nTo change wallet addres do-\n/referral\\_link _wallet address_`;

  const keyboard = new InlineKeyboard().text(
    "Set custom link",
    "setCustomLink"
  );

  ctx.reply(cleanUpBotMessage(text), {
    reply_markup: keyboard,
    parse_mode: "MarkdownV2",
  });
}

export function setCustomLink(ctx: CallbackQueryContext<Context>) {
  const userId = ctx.from.id;
  userState[userId] = "setReferralText";
  ctx.reply(
    `Please send the custom text you want in your referral link in the next message. For example if you set your referral text as "doggie", your referral link would be like ${BOT_URL}?start=doggie`
  );
}

export async function setReferralText(ctx: HearsContext<Context>) {
  const userId = ctx.chat.id;
  const messageText = ctx.message?.text;

  if (!messageText) {
    return ctx.reply("Please enter a text");
  }

  const [isTaken] = await getDocument<StoredReferral>({
    queries: [["referralText", "==", messageText]],
    collectionName: "referral",
  });

  if (!isTaken) {
    const [referralData] = await getDocument<StoredReferral>({
      queries: [["userId", "==", userId]],
      collectionName: "referral",
    });

    const { walletAddress: address, id } = referralData;

    if (referralData) {
      await updateDocumentById({
        id: id || "",
        collectionName: "referral",
        updates: { referralText: messageText },
      });
    }

    const referral_link = `${BOT_URL}?start=${messageText}`;
    const commision = Math.floor(referralCommisionFee * 100);
    delete userState[userId];
    const text = `Your referral link is - \n\`${referral_link}\`\n\nAny payments the user that is introduced to our bot using your link makes would entitle you to ${commision}% of that amount and would be sent to the wallet address mentioned below. Anytime a purchase is made, you'll be notified with the fees that was sent to your wallet.\n\nWallet - \`${address}\``;

    await ctx.reply(cleanUpBotMessage(text), { parse_mode: "MarkdownV2" });
  } else {
    ctx.reply(
      `Custom referral text \`${messageText}\` is already taken, try something else`,
      { parse_mode: "MarkdownV2" }
    );
  }
}
