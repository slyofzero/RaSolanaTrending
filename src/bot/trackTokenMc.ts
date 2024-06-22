import { tokenMCTracking } from "@/vars/priceTracking";
import { trendingTokens } from "@/vars/trending";
import { CHANNEL_ID } from "@/utils/env";
import { errorHandler, log } from "@/utils/handlers";
import { sendNewTrendingMsg } from "./checkNewTrending";

export async function trackTokenMC() {
  if (!CHANNEL_ID) {
    return log("Channel ID or PINNED_MSG_ID is undefined");
  }

  // Checking prices for trending tokens and adding a token to tracking if not present
  for (const [index, [token, tokenData]] of trendingTokens.entries()) {
    const { fdv: currentMC } = tokenData;
    const tokenTrackingData = tokenMCTracking[token];

    if (!tokenTrackingData) continue;

    const { initialMC, pastBenchmark } = tokenTrackingData;

    const exactGrowth = Number(
      (((currentMC - initialMC) / initialMC) * 100).toFixed(2)
    );
    const growth = Math.floor(exactGrowth);
    console.log(growth);

    if (growth > pastBenchmark) {
      tokenMCTracking[token] = {
        ...tokenMCTracking[token],
        pastBenchmark: growth,
      };

      try {
        await sendNewTrendingMsg(tokenData, index, growth);
      } catch (e) {
        // eslint-disable-next-line
        // console.log(message);
        errorHandler(e);
      }
    }
  }

  // Remove token from tracking if not trending anymore
  for (const token in tokenMCTracking) {
    const isTokenTrending = trendingTokens.some(
      (trending) => trending.at(0) === token
    );
    if (!isTokenTrending) {
      delete tokenMCTracking[token];
    }
  }
}
