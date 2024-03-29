import { addDocument, getDocument, updateDocumentById } from "@/firebase";
import { StoredReferral } from "@/types";
import { cleanUpBotMessage } from "@/utils/bot";
import { referralCommisionFee } from "@/utils/constants";
import { referralAddressRepeated } from "@/utils/db";
import { BOT_URL } from "@/utils/env";
import { log } from "@/utils/handlers";
import { isValidEthAddress } from "@/utils/web3";
import { userState } from "@/vars/state";
import {
  CallbackQueryContext,
  CommandContext,
  Context,
  HearsContext,
  InlineKeyboard,
} from "grammy";

export async function referralLink(ctx: CommandContext<Context>) {
  const { id: chatId } = ctx.chat;
  const { match } = ctx;
  const messageText = ctx.message?.text;
  const address = match || messageText;

  let [referralLinkData] = await getDocument<StoredReferral>({
    collectionName: "referral",
    queries: [["userId", "==", chatId]],
  });

  // To check for duplicate referral addresses
  if (address && isValidEthAddress(address)) {
    const addressInUse = await referralAddressRepeated(address);
    if (addressInUse) {
      const personUsingAddress =
        addressInUse.userId === chatId ? "you" : "someone else";

      return ctx.reply(
        `The address \`${address}\` is already in use by ${personUsingAddress}\\. Please pass a different address\\.`,
        { parse_mode: "MarkdownV2" }
      );
    }
  }

  // If not referral data then add one, if there is and address was passed as match then update the data
  if (!referralLinkData) {
    if (messageText?.startsWith("/")) {
      userState[chatId] = "referralAddress";

      return ctx.reply(
        "You don't have a referral link yet. Pass a Base ETH address in the next message. You will receive your referral fees in that address."
      );
    } else if (address) {
      if (messageText && isValidEthAddress(messageText)) {
        referralLinkData = { userId: chatId, address };

        addDocument<StoredReferral>({
          collectionName: "referral",
          data: referralLinkData,
        }).then(() => log(`Referral data added for ${chatId}`));

        return ctx.reply(
          "You don't have a referral link yet. Pass a Base ETH address in the next message. You will receive your referral fees in that address."
        );
      }
    }
  } else {
    if (isValidEthAddress(match)) {
      updateDocumentById<StoredReferral>({
        collectionName: "referral",
        updates: { address },
        id: referralLinkData.id || "",
      }).then(() => log(`Referral address updated for ${chatId}`));

      return ctx.reply(`Your referral address was updated to \`${address}\``, {
        parse_mode: "MarkdownV2",
      });
    }
  }

  const { referralText, address: storedAddress } = referralLinkData;
  const commisionShare = referralCommisionFee * 100;
  const referral_link = `${BOT_URL}?start=${referralText || chatId}`;
  const text = `Your referral link is - \n\`${referral_link}\`\n\nAny payments the user that is introduced to our bot using your link makes would entitle you to ${commisionShare}% of that amount and would be sent to the wallet address mentioned below. Anytime a purchase is made, you'll be notified with the fees that was sent to your wallet.\n\nWallet - \`${storedAddress}\`\n\nTo change wallet addres do-\n/referral\\_link _wallet address_`;

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

    const { address, id } = referralData;

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
