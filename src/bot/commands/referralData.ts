import { getDocument } from "@/firebase";
import { StoredReferral } from "@/types";
import { errorHandler } from "@/utils/handlers";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { CommandContext, Context } from "grammy";

export async function referral_data(ctx: CommandContext<Context>) {
  const { id: userId } = ctx.from || {};

  const data = (
    await getDocument<StoredReferral>({
      queries: [["userId", "==", String(userId)]],
      collectionName: "referral",
    })
  ).at(0);

  if (data) {
    const referrals = (
      await getDocument({
        queries: [["referrer", "==", String(userId)]],
        collectionName: "referral",
      })
    ).length;

    const { feesCollected } = data;
    const feesCollectedSol = feesCollected
      ? feesCollected / LAMPORTS_PER_SOL
      : 0;

    const message = `Total Referrals - ${referrals}\nReferral Fees Collected - ${feesCollectedSol} SOL`;
    ctx.reply(message).catch((e) => errorHandler(e));
  } else {
    ctx.reply("Please do /start again").catch((e) => errorHandler(e));
  }
}
